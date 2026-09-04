"use client";

import { Children, isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { matchSelectOption, nextSelectOption, selectMenuPlacement, type SelectChoice } from "@/lib/classicSelectBehavior";
import styles from "./ClassicSelect.module.css";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size">;

function textContent(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    return isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : "";
  }).join("");
}

function collectOptions(children: ReactNode, group?: string, groupDisabled = false): SelectChoice[] {
  return Children.toArray(children).flatMap((child): SelectChoice[] => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; label?: string; disabled?: boolean; lang?: string }>(child)) return [];
    if (child.type === "option") {
      const label = child.props.label ?? textContent(child.props.children);
      return [{ value: String(child.props.value ?? textContent(child.props.children)), label, disabled: groupDisabled || child.props.disabled, group, lang: child.props.lang }];
    }
    return collectOptions(child.props.children, child.type === "optgroup" ? child.props.label : group, groupDisabled || Boolean(child.props.disabled));
  });
}

/**
 * A System 7 pop-up menu, not an operating-system picker. The hidden select
 * retains form semantics and emits a real change event for existing callers.
 * The popover lives in the top layer, above window overflow and resize handles.
 */
export default function ClassicSelect({ children, value, defaultValue, disabled, id, className, style, title, onChange, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...nativeProps }: Props) {
  const generatedId = useId();
  const controlId = id ?? `classic-select-${generatedId}`;
  const menuId = `${controlId}-options`;
  const nativeRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef({ text: "", time: 0 });
  const options = useMemo(() => collectOptions(children), [children]);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => String(defaultValue ?? options.find((option) => !option.disabled)?.value ?? ""));
  const selectedValue = String(value ?? uncontrolledValue);
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const [open, setOpen] = useState(false);
  const [supportsPopover, setSupportsPopover] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const available = options.some((option) => !option.disabled);
  const effectiveActiveIndex = options[activeIndex] && !options[activeIndex].disabled ? activeIndex : nextSelectOption(options, -1, 1);

  useEffect(() => {
    const supported = "showPopover" in HTMLElement.prototype;
    setSupportsPopover(supported);
    // Safari 16.4 predates the top-layer popover API. Its custom menu uses a
    // fixed portal instead, with the same keyboard and viewport behaviour.
    // Keep menu options outside an enclosing <label>; otherwise option clicks
    // can activate that label's control again and immediately reopen the menu.
    setPortalTarget(triggerRef.current?.closest<HTMLElement>('dialog, [role="dialog"]') ?? document.body);
  }, []);

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function choose(index: number) {
    const option = options[index];
    const native = nativeRef.current;
    if (!option || option.disabled || disabled || !native) return;
    if (option.value !== selectedValue) {
      setUncontrolledValue(option.value);
      native.value = option.value;
      native.dispatchEvent(new Event("change", { bubbles: true }));
    }
    close();
  }

  function show(index = selectedIndex) {
    if (disabled || !available) return;
    setActiveIndex(options[index] && !options[index].disabled ? index : nextSelectOption(options, -1, 1));
    typeaheadRef.current = { text: "", time: 0 };
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.metaKey || event.ctrlKey) return;
    const current = open ? effectiveActiveIndex : selectedIndex;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      if (open) close(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) show();
      else setActiveIndex(nextSelectOption(options, current, event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = nextSelectOption(options, event.key === "Home" ? -1 : 0, event.key === "Home" ? 1 : -1);
      if (open) setActiveIndex(index);
      else show(index);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(effectiveActiveIndex);
      else show();
    } else if (event.key.length === 1 && !event.altKey) {
      const now = Date.now();
      const previous = now - typeaheadRef.current.time < 700 ? typeaheadRef.current.text : "";
      const query = previous + event.key;
      typeaheadRef.current = { text: query, time: now };
      const repeated = [...query].every((character) => character.toLocaleLowerCase() === event.key.toLocaleLowerCase());
      const index = matchSelectOption(options, repeated ? event.key : query, repeated ? current : current - 1);
      if (index >= 0) {
        event.preventDefault();
        if (open) setActiveIndex(index);
        else choose(index);
      }
    }
  }

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger) return;
    if (!open || disabled || !available) {
      if (supportsPopover && menu.matches(":popover-open")) menu.hidePopover();
      return;
    }
    function place() {
      if (!menu || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const placement = selectMenuPlacement(rect, { width: document.documentElement.clientWidth, height: window.innerHeight }, menu.scrollHeight || options.length * 32 + 4);
      Object.assign(menu.style, { left: `${placement.left}px`, top: `${placement.top}px`, width: `${placement.width}px`, maxHeight: `${placement.maxHeight}px` });
    }
    // Position once to establish width, then measure wrapped option text.
    place();
    if (supportsPopover && !menu.matches(":popover-open")) menu.showPopover();
    place();
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && menu.contains(event.target)) return;
      const rect = trigger.getBoundingClientRect();
      const scrollBounds = event.target instanceof HTMLElement && event.target !== document.body && event.target !== document.documentElement
        ? event.target.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight, left: 0, right: document.documentElement.clientWidth };
      if (rect.bottom <= scrollBounds.top || rect.top >= scrollBounds.bottom || rect.right <= scrollBounds.left || rect.left >= scrollBounds.right) setOpen(false);
      else place();
    };
    const onResize = () => setOpen(false);
    const onOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.contains(event.target) && !trigger.contains(event.target)) setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("pointerdown", onOutsidePointer, true);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerdown", onOutsidePointer, true);
      if (supportsPopover && menu.matches(":popover-open")) menu.hidePopover();
    };
  }, [open, disabled, available, options.length, supportsPopover, portalTarget]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const option = menu?.querySelector<HTMLElement>(`[data-option-index="${effectiveActiveIndex}"]`);
    if (!menu || !option) return;
    // Scroll only the menu, never the desktop/page behind a fixed pop-up.
    const optionRect = option.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    if (optionRect.top < menuRect.top + 4) menu.scrollTop -= menuRect.top + 4 - optionRect.top;
    else if (optionRect.bottom > menuRect.bottom - 4) menu.scrollTop += optionRect.bottom - menuRect.bottom + 4;
  }, [open, effectiveActiveIndex]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "closed") setOpen(false);
    };
    menu.addEventListener("toggle", onToggle);
    return () => menu.removeEventListener("toggle", onToggle);
  }, [portalTarget]);

  const expanded = open && !disabled && available;
  const menu = <div ref={menuRef} id={menuId} popover={supportsPopover ? "auto" : undefined} data-open={!supportsPopover && expanded ? "true" : undefined} role="listbox" className={styles.menu} aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? controlId)} onPointerDown={(event) => event.preventDefault()}>
    {options.map((option, index) => <div key={`${option.value}-${index}`}>
      {option.group && (index === 0 || options[index - 1].group !== option.group) && <div className={styles.group} role="presentation">{option.group}</div>}
      <div id={`${menuId}-${index}`} role="option" aria-selected={selectedValue === option.value} aria-disabled={option.disabled || undefined}
        className={styles.option} data-option-index={index} data-active={effectiveActiveIndex === index || undefined}
        onPointerMove={(event) => { if (event.pointerType === "mouse" && !option.disabled) setActiveIndex(index); }}
        onClick={() => choose(index)}>
        <span className={styles.check} aria-hidden="true">{selectedValue === option.value ? "✓" : ""}</span><span lang={option.lang}>{option.label}</span>
      </div>
    </div>)}
  </div>;
  return <>
    <button
      ref={triggerRef} id={controlId} type="button" data-classic-select="" className={`${styles.trigger} ${className ?? ""}`} style={style} title={title}
      disabled={disabled || !available} role="combobox" aria-haspopup="listbox" aria-expanded={expanded} aria-controls={menuId}
      aria-activedescendant={expanded && effectiveActiveIndex >= 0 ? `${menuId}-${effectiveActiveIndex}` : undefined}
      aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} aria-required={nativeProps.required}
      lang={nativeProps.lang} tabIndex={nativeProps.tabIndex}
      onClick={() => open ? close() : show()} onKeyDown={onKeyDown}
      onBlur={(event) => { if (!menuRef.current?.contains(event.relatedTarget)) close(false); }}
    >
      <span className={styles.value} lang={options[selectedIndex]?.lang}>{options[selectedIndex]?.label ?? options.find((option) => !option.disabled)?.label ?? "\u00a0"}</span>
      <span className={styles.arrow} aria-hidden="true" />
    </button>
    <select {...nativeProps} ref={nativeRef} value={value} defaultValue={defaultValue} disabled={disabled} aria-hidden="true" tabIndex={-1} hidden onChange={onChange}>{children}</select>
    {portalTarget ? createPortal(menu, portalTarget) : menu}
  </>;
}
