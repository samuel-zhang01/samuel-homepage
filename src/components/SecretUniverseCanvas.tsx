"use client";

import { useEffect, useRef, useState } from "react";
import { SECRET_SCENE_COUNT, SECRET_SCENE_SECONDS, secretCubeProjection, secretCurveProjection, secretIsCurve, secretFragmentShader, secretSceneOrder, secretVertexShader } from "@/lib/secretReality";
import styles from "./SecretApp.module.css";

type UniverseProps = {
  curvature: number;
  seed: number;
  moment: number;
  running: boolean;
  invoking: boolean;
  description: string;
  fallbackText: string;
};

function StillUniverse({ mode, seed }: { mode: number; seed: number }) {
  // Keep a complete, static artwork when WebGL is unavailable or lost.
  return <svg className={styles.stillUniverse} viewBox="0 0 800 360" aria-hidden="true">
    <defs>
      <radialGradient id="secret-halo"><stop stopColor="#4b2571" /><stop offset="1" stopColor="#090b19" /></radialGradient>
      <linearGradient id="secret-spectrum"><stop stopColor="#75e2dd" /><stop offset=".5" stopColor="#b790f3" /><stop offset="1" stopColor="#ffb08c" /></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#secret-halo)" />
    <g fill="none" stroke="url(#secret-spectrum)" transform={`translate(400 180) rotate(${seed * 13})`}>
      {Array.from({ length: 22 }, (_, i) => <ellipse key={i} rx={mode === 1 ? 12 + i * 12 : 130} ry={mode === 1 ? 9 + i * 8 : 14 + i * 5} transform={`rotate(${i * (mode === 2 ? 23 : 8)})`} opacity={.2 + i / 32} />)}
      <ellipse rx="175" ry="45" transform="rotate(-30)" strokeWidth="2" />
    </g>
  </svg>;
}

export default function SecretUniverseCanvas(props: UniverseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef(props);
  const invalidate = useRef<(() => void) | null>(null);
  const [fallback, setFallback] = useState(true);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    controls.current = props;
    invalidate.current?.();
  }, [props]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;
    let frame = 0;
    let lastFrame = 0;
    let time = 0;
    let previousMoment = controls.current.moment;
    let previousSeed = controls.current.seed;
    let circuit = -1;
    let order: number[] = [];
    let nextOrder: number[] = [];
    let lost = false;
    let disposed = false;
    let presented = false;
    let invocation = 0;
    const pointer = [0, 0];
    const target = [0, 0];
    const cube = new Float32Array(32);
    const curve = new Float32Array(64 * 3);
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, secretVertexShader);
    const fragment = compile(gl.FRAGMENT_SHADER, secretFragmentShader);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const release = () => {
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
    };
    if (!vertex || !fragment || !program || !buffer) { release(); return; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { release(); return; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(["uResolution", "uPointer", "uTime", "uPhase", "uCurvature", "uSeed", "uMode", "uNextMode", "uMorph", "uInvocation"].map(name => [name, gl.getUniformLocation(program, name)]));
    const cubeUniform = gl.getUniformLocation(program, "uCube[0]");
    const curveUniform = gl.getUniformLocation(program, "uCurve[0]");

    const draw = (timestamp: number) => {
      frame = 0;
      if (disposed || lost || document.hidden) { lastFrame = 0; return; }
      const { running, curvature, seed, moment, invoking } = controls.current;
      if (seed !== previousSeed) { time = 0; circuit = -1; previousSeed = seed; lastFrame = 0; }
      // Cap playback at 30fps. Time excludes hidden/inactive/paused periods.
      if (running && lastFrame && timestamp - lastFrame < 32) {
        frame = requestAnimationFrame(draw);
        return;
      }
      if (running && lastFrame) time += Math.min((timestamp - lastFrame) / 1000, .08);
      time += (moment - previousMoment) * .8;
      previousMoment = moment;
      lastFrame = running ? timestamp : 0;
      const nextCircuit = Math.floor(time / (SECRET_SCENE_SECONDS * SECRET_SCENE_COUNT));
      if (nextCircuit !== circuit) {
        circuit = nextCircuit;
        order = secretSceneOrder(seed, circuit);
        nextOrder = secretSceneOrder(seed, circuit + 1);
      }
      const slot = Math.floor(time / SECRET_SCENE_SECONDS) % SECRET_SCENE_COUNT;
      const phase = time % SECRET_SCENE_SECONDS / SECRET_SCENE_SECONDS;
      const blend = Math.max(0, (phase - 2 / 3) * 3);
      const morph = blend * blend * (3 - 2 * blend);
      const mode = order[slot];
      const nextMode = slot === SECRET_SCENE_COUNT - 1 ? nextOrder[0] : order[slot + 1];
      if (running) for (let i = 0; i < 2; i++) pointer[i] += (target[i] - pointer[i]) * .05;
      // Pause/reduced motion retain a still ritual; live playback gathers the
      // current mathematical world into an orb, then lets it unfold again.
      if (running) invocation += ((invoking ? 1 : 0) - invocation) * .09;
      else invocation = invoking ? .75 : 0;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uPointer, pointer[0], pointer[1]);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform1f(uniforms.uPhase, phase);
      gl.uniform1f(uniforms.uCurvature, curvature / 100);
      gl.uniform1f(uniforms.uSeed, seed);
      gl.uniform1i(uniforms.uMode, mode);
      gl.uniform1i(uniforms.uNextMode, nextMode);
      gl.uniform1f(uniforms.uMorph, morph);
      gl.uniform1f(uniforms.uInvocation, invocation);
      if (mode === 5 || nextMode === 5 && morph > 0) gl.uniform2fv(cubeUniform, secretCubeProjection(time, seed, cube));
      if (secretIsCurve(mode) || secretIsCurve(nextMode) && morph > 0) gl.uniform3fv(curveUniform, secretCurveProjection(time, seed, mode, nextMode, morph, curve));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.realityTime = time.toFixed(3);
      canvas.dataset.realityScene = String(mode);
      if (!presented) { setFallback(false); presented = true; }
      if (running) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (!frame && !lost && !disposed && !document.hidden) frame = requestAnimationFrame(draw);
    };
    invalidate.current = requestDraw;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(Math.min(rect.width * ratio, 960)));
      canvas.height = Math.max(1, Math.round(Math.min(rect.height * ratio, 420)));
      requestDraw();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      target[0] = (event.clientX - rect.left) / rect.width * 2 - 1;
      target[1] = (event.clientY - rect.top) / rect.height * 2 - 1;
    };
    const leave = () => { target[0] = 0; target[1] = 0; };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      requestDraw();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      frame = 0;
      setFallback(true);
    };
    const restored = () => { setGeneration(value => value + 1); };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", restored);
    document.addEventListener("visibilitychange", visibility);
    resize();
    return () => {
      disposed = true;
      invalidate.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", visibility);
      release();
    };
  }, [generation]);

  return <div className={styles.universe} role="img" aria-label={props.description} data-renderer={fallback ? "still" : "webgl"}>
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" style={{ opacity: fallback ? 0 : 1 }} />
    {fallback && <><StillUniverse mode={props.seed % 3} seed={props.seed} /><span className={styles.fallbackNote}>{props.fallbackText}</span></>}
  </div>;
}
