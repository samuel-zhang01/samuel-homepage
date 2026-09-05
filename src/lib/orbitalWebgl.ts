import type { OrbitalSamples } from "./orbitals";

const vertexSource = `
attribute vec3 position;
attribute vec3 normal;
attribute float phase;
uniform vec2 angles;
uniform float aspect;
uniform float pointSize;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vPhase;
varying float modelZ;
vec3 turn(vec3 p) {
  float x = p.x*cos(angles.x)+p.z*sin(angles.x);
  float z = -p.x*sin(angles.x)+p.z*cos(angles.x);
  return vec3(x,p.y*cos(angles.y)-z*sin(angles.y),p.y*sin(angles.y)+z*cos(angles.y));
}
void main() {
  vec3 p = turn(position);
  float distance = 3.4-p.z;
  float zoom = 3.0;
  gl_Position = vec4(p.x*zoom/aspect,p.y*zoom,distance*1.02-0.2,distance);
  gl_PointSize = pointSize*3.4/distance;
  vNormal = turn(normal);
  vPosition = p;
  vPhase = phase;
  modelZ = position.z;
}`;
const fragmentSource = `
precision mediump float;
uniform bool phaseInk;
uniform bool slice;
uniform bool points;
uniform float opacity;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vPhase;
varying float modelZ;
void main() {
  if (slice && abs(modelZ)>0.065) discard;
  if (points) {
    float radius = length(gl_PointCoord-vec2(0.5))*2.0;
    if (radius>1.0) discard;
    vec3 ink = !phaseInk ? vec3(0.15) : vPhase>=0.0 ? vec3(0.067,0.09,0.478) : vec3(0.60,0.255,0.173);
    gl_FragColor = vec4(ink,opacity*exp(-3.5*radius*radius));
    return;
  }
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(vec3(0.0,0.0,3.4)-vPosition);
  if (dot(normal,view)<0.0) normal=-normal;
  vec3 light = normalize(vec3(-0.5,0.8,1.0));
  float diffuse = max(0.0,dot(normal,light));
  float specular = pow(max(0.0,dot(normal,normalize(light+view))),40.0);
  float rim = pow(1.0-max(0.0,dot(normal,view)),3.0);
  vec3 ink = !phaseInk ? vec3(0.35,0.38,0.41) : vPhase>=0.0 ? vec3(0.12,0.20,0.57) : vec3(0.66,0.25,0.14);
  gl_FragColor = vec4(ink*(0.38+0.65*diffuse)+vec3(0.55)*specular+vec3(0.12)*rim,1.0);
}`;

export function createOrbitalRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: true });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const pointBuffer = gl.createBuffer();
  if (!program || !buffer || !pointBuffer) throw new Error("WebGL allocation failed");
  const dispose = () => {
    gl.deleteBuffer(buffer); gl.deleteBuffer(pointBuffer); gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
    // React may replay effects on the same attached canvas in development.
    // Release the context only after its canvas actually leaves the document.
    queueMicrotask(() => { if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext(); });
  };
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Shader allocation failed");
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader compilation failed");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader linking failed");
  } catch (error) { dispose(); throw error; }
  gl.useProgram(program);
  const attributes = [["position", 3, 0], ["normal", 3, 12], ["phase", 1, 24]].map(([name, size, offset]) => ({ location: gl.getAttribLocation(program, String(name)), size: Number(size), offset: Number(offset) }));
  const bind = (target: WebGLBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, target);
    for (const { location, size, offset } of attributes) {
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, 28, offset);
    }
  };
  gl.enable(gl.DEPTH_TEST);
  const uniforms = Object.fromEntries(["angles", "aspect", "phaseInk", "slice", "points", "pointSize", "opacity"].map((name) => [name, gl.getUniformLocation(program, name)]));
  let count = 0;
  let cloud: OrbitalSamples | null = null;
  let pointVertices = new Float32Array();
  return {
    upload(vertices: Float32Array) { gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); count = vertices.length / 7; },
    uploadPoints(samples: OrbitalSamples) { cloud = samples; pointVertices = new Float32Array(samples.points.length * 7); },
    draw(yaw: number, pitch: number, ink: boolean, slice: boolean, representation: "points" | "surface", opacity: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(1, 1, 243 / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(uniforms.angles, yaw, pitch); gl.uniform1f(uniforms.aspect, canvas.width / canvas.height);
      gl.uniform1i(uniforms.phaseInk, ink ? 1 : 0); gl.uniform1i(uniforms.slice, slice ? 1 : 0);
      gl.uniform1i(uniforms.points, representation === "points" ? 1 : 0);
      if (representation === "points" && cloud) {
        // Correct back-to-front alpha compositing. These are equal-weight
        // probability samples, not electrons; overlapping dots reveal density.
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        const ordered = cloud.points.map((point) => ({ point, depth: point.y * sp + (-point.x * sy + point.z * cy) * cp })).sort((a, b) => a.depth - b.depth);
        ordered.forEach(({ point }, i) => pointVertices.set([point.x / cloud!.radius, point.y / cloud!.radius, point.z / cloud!.radius, 0, 0, 1, point.phase], i * 7));
        bind(pointBuffer); gl.bufferData(gl.ARRAY_BUFFER, pointVertices, gl.DYNAMIC_DRAW);
        gl.uniform1f(uniforms.pointSize, Math.max(2, canvas.height / 170));
        gl.uniform1f(uniforms.opacity, opacity);
        gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, ordered.length);
      } else {
        bind(buffer); gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST);
        gl.drawArrays(gl.TRIANGLES, 0, count);
      }
    },
    dispose,
  };
}
