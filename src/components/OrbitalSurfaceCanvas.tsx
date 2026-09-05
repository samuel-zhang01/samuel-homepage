"use client";

import { useEffect, useRef, useState, type CanvasHTMLAttributes, type RefObject } from "react";
import { createOrbitalRenderer } from "@/lib/orbitalWebgl";
import type { OrbitalSamples } from "@/lib/orbitals";
import styles from "./OrbitalLab.module.css";

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  n: number; l: number; m: number;
  yaw: number; pitch: number; phaseInk: boolean; slice: boolean;
  representation: "points" | "surface"; cloud: OrbitalSamples; opacity: number;
  loadingLabel: string;
  onUnavailable: () => void;
};

export default function OrbitalSurfaceCanvas({ canvasRef, n, l, m, yaw, pitch, phaseInk, slice, representation, cloud, opacity, loadingLabel, onUnavailable, ...canvasProps }: Props) {
  const rendererRef = useRef<ReturnType<typeof createOrbitalRenderer> | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef(0);
  const viewRef = useRef({ yaw, pitch, phaseInk, slice, representation, opacity });
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: ReturnType<typeof createOrbitalRenderer> | undefined;
    let worker: Worker | undefined;
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    try {
      renderer = createOrbitalRenderer(canvas);
      rendererRef.current = renderer;
      worker = new Worker(new URL("../lib/orbitalSurface.worker.ts", import.meta.url));
      workerRef.current = worker;
      worker.onerror = onUnavailable;
      worker.onmessage = (event: MessageEvent<{ id: number; vertices?: Float32Array; error?: boolean }>) => {
        if (event.data.id !== requestRef.current) return;
        if (event.data.error || !event.data.vertices?.length) { onUnavailable(); return; }
        renderer!.upload(event.data.vertices);
        const view = viewRef.current;
        renderer!.draw(view.yaw, view.pitch, view.phaseInk, view.slice, view.representation, view.opacity);
        canvas.dataset.ready = "true";
        setPending(false);
      };
      canvas.addEventListener("webglcontextlost", lost);
    } catch { onUnavailable(); }
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      worker?.terminate(); renderer?.dispose();
      rendererRef.current = null; workerRef.current = null;
    };
  }, [canvasRef, onUnavailable]);

  useEffect(() => {
    rendererRef.current?.uploadPoints(cloud);
    const surface = representation === "surface";
    setPending(surface);
    if (canvasRef.current) canvasRef.current.dataset.ready = surface ? "false" : "true";
    rendererRef.current?.upload(new Float32Array());
    const view = viewRef.current;
    rendererRef.current?.draw(view.yaw, view.pitch, view.phaseInk, view.slice, representation, view.opacity);
    const id = ++requestRef.current;
    if (surface) workerRef.current?.postMessage({ id, n, l, m });
    // View changes redraw the existing geometry; only quantum numbers remesh it.
  }, [n, l, m, cloud, representation, canvasRef, onUnavailable]);

  useEffect(() => {
    viewRef.current = { yaw, pitch, phaseInk, slice, representation, opacity };
    rendererRef.current?.draw(yaw, pitch, phaseInk, slice, representation, opacity);
  }, [yaw, pitch, phaseInk, slice, representation, opacity, canvasProps.width, canvasProps.height]);

  return <><canvas {...canvasProps} ref={canvasRef} aria-busy={pending} data-renderer={representation} />{pending && <span className={styles.renderStatus} role="status">{loadingLabel}</span>}</>;
}
