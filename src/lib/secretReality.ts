// Bounded fractal iterations and analytic geometry, with no textures or assets.
// The curved lens is an artistic hyperbolic-inspired space, not a metric solver.
export const SECRET_SCENE_COUNT = 30;
export const SECRET_SCENE_SECONDS = 12;
export const secretVertexShader = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

export const secretFragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime, uPhase, uCurvature, uSeed, uMorph, uInvocation;
uniform int uMode, uNextMode;
uniform vec2 uCube[16];
uniform vec3 uCurve[64];
mat2 turn(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 palette(float t) {
return .53 + .47 * cos(6.28318 * (vec3(.0, .27, .58) + t));
}
float segment(vec2 p, vec2 a, vec2 b) {
vec2 v = b - a;
return length(p - a - v * clamp(dot(p - a, v) / max(dot(v, v), .000001), 0.0, 1.0));
}
vec3 background(vec2 uv) {
float radius = length(uv);
float angle = atan(uv.y, uv.x);
float warped = log(1.0 + radius * (1.8 + uCurvature)) * 5.5 - uTime * .11;
float grid = pow(.5 + .5 * cos(warped * 12.0), 24.0)
+ pow(.5 + .5 * cos(angle * 24.0 + warped * uCurvature * 2.0), 38.0);
vec3 color = vec3(.012, .014, .035);
color += palette(uTime * .012 + .58) * .08 * exp(-radius * radius * .6);
color += vec3(.10, .17, .25) * grid * .16;
return color;
}
vec2 lens(vec2 uv) {
float warp = uCurvature * .055;
uv += vec2(sin(uv.y * 3.0 + uTime * .17), sin(uv.x * 3.0 - uTime * .13)) * warp;
return turn(sin(uTime * .06) * .09) * uv;
}
vec3 escapeSet(vec2 uv, float julia, float age) {
float zoom = smoothstep(.0, .78, age);
float scale = mix(1.45, .07, zoom * zoom);
vec2 center = mix(vec2(-.45, .0), vec2(-.74364, .13182), zoom);
vec2 coordinate = lens(uv) * mix(scale, .95, julia) + center * (1.0 - julia);
vec2 constant = vec2(-.745 + .035 * sin(uTime * .13), .186 + .045 * cos(uTime * .11));
vec2 c = mix(coordinate, constant, julia);
vec2 z = coordinate * julia;
float count = .0;
float trap = 100.0;
float escaped = .0;
for (int i = 0; i < 64; i++) {
z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
trap = min(trap, abs(length(z) - .65));
if (dot(z, z) > 128.0) {
count = float(i) + 1.0 - log2(max(log2(dot(z, z)), .01));
escaped = 1.0;
break;
}
}
float bands = .55 + .45 * sin(count * .65 - uTime * .75);
vec3 color = palette(count * .033 + uTime * .022 + uSeed * .013);
color *= .28 + bands * .64;
color += palette(.65 + uTime * .02) * exp(-trap * 20.0) * .22;
vec3 interior = vec3(.01, .008, .035) + palette(trap * 2.0 + uTime * .025) * .1;
return mix(interior, color, escaped);
}
vec3 triangle(vec2 uv) {
vec2 p = lens(uv) * 1.3;
p.x /= .85 + .15 * cos(uTime * .24);
p = turn(sin(uTime * .12) * .22) * p;
float scale = 1.0;
for (int i = 0; i < 8; i++) {
vec2 a = vec2(-1.0, -.57735), b = vec2(1.0, -.57735), c = vec2(.0, 1.1547);
vec2 vertex = dot(p-a,p-a) < dot(p-b,p-b) ? a : b;
vertex = dot(p-c,p-c) < dot(p-vertex,p-vertex) ? c : vertex;
p = p * 2.0 - vertex;
scale *= 2.0;
}
float d = max(max(dot(p, vec2(.866025, .5)), dot(p, vec2(-.866025, .5))), -p.y) - .57735;
d /= scale;
float edge = exp(-abs(d) * 240.0);
float fill = 1.0 - smoothstep(-.001, .001, d);
vec3 tint = palette(uv.y * .23 + uv.x * .12 + uTime * .035);
return background(uv) + tint * (edge * .8 + fill * .4);
}
vec3 tree(vec2 uv) {
vec2 p = lens(uv);
p.y += .87;
float d = 10.0, scale = 1.0, leaves = 10.0;
float angle = .48 + sin(uTime * .21) * .13 + uCurvature * .18;
for (int i = 0; i < 10; i++) {
d = min(d, segment(p, vec2(.0), vec2(.0, .62)) / scale);
leaves = min(leaves, length(p - vec2(.0, .62)) / scale);
p.y -= .62;
p.x = abs(p.x);
p = turn(-angle) * p * 1.48;
scale *= 1.48;
}
vec3 tint = palette(uv.y * .28 - uTime * .025);
float line = exp(-d * 200.0) + .14 * exp(-d * 28.0);
float leaf = exp(-leaves * 110.0);
return background(uv) + tint * line + palette(.6 + uTime * .03) * leaf * .45;
}
vec3 cubeEdge(vec2 p, vec2 a, vec2 b, vec3 tint) {
float d = segment(p, a, b);
return tint * (exp(-d * 230.0) * .8 + exp(-d * 35.0) * .07);
}
vec3 hypercube(vec2 uv) {
vec2 p = lens(uv) / 1.18;
vec3 color = background(uv);
vec3 a = palette(uTime * .027), b = palette(.21 + uTime * .027);
vec3 c = palette(.42 + uTime * .027), d = palette(.63 + uTime * .027);
for (int i = 0; i < 8; i++) {
color += cubeEdge(p, uCube[i*2], uCube[i*2+1], a);
color += cubeEdge(p, uCube[i+(i/2)*2], uCube[i+(i/2)*2+2], b);
color += cubeEdge(p, uCube[i+(i/4)*4], uCube[i+(i/4)*4+4], c);
color += cubeEdge(p, uCube[i], uCube[i+8], d);
}
return color;
}
bool curve(int mode) { return mode == 9 || mode == 10 || mode == 11 || (mode >= 18 && mode <= 23); }
vec3 knot(vec2 uv) {
vec2 p = lens(uv);
float nearest = 100.0, depth = .0, strand = .0;
for (int i = 0; i < 63; i++) {
float d = segment(p, uCurve[i].xy, uCurve[i+1].xy);
if (d < nearest) { nearest = d; depth = uCurve[i].z; strand = float(i) / 63.0; }
}
vec3 tint = palette(strand * .72 + uTime * .028 + depth * .15);
return background(uv) + tint * (exp(-nearest * 150.0) * (1.1 + depth * .25) + exp(-nearest * 22.0) * .18);
}
vec3 newton(vec2 uv) {
vec2 z = turn(uTime * .06) * lens(uv) * 1.35;
float count = .0;
for (int i = 0; i < 28; i++) {
vec2 square = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y);
vec2 f = vec2(square.x*z.x-square.y*z.y, square.x*z.y+square.y*z.x) - vec2(1.0, .12*sin(uTime*.2));
vec2 derivative = 3.0*square;
float denom = max(dot(derivative, derivative), .00001);
z -= vec2(dot(f, derivative), f.y*derivative.x-f.x*derivative.y)/denom;
count = float(i);
if (dot(f, f) < .00001) break;
}
float basin = atan(z.y, z.x) / 6.28318;
return palette(basin + uTime*.025 + count*.015) * (.28 + .72*exp(-count*.075));
}
vec3 inversion(vec2 uv) {
vec2 p = lens(uv)*.75;
float scale = 1.0, orbit = 10.0;
for (int i = 0; i < 5; i++) {
p = abs(mod(p + 1.0, 2.0) - 1.0);
float inversionScale = 1.18 / max(dot(p,p), .07);
p = p*inversionScale - vec2(.8, .75 + .08*sin(uTime*.17));
scale *= inversionScale;
orbit = min(orbit, abs(length(p)-.55)/sqrt(min(scale,512.0)));
}
float ink = exp(-orbit*95.0)*.85+exp(-orbit*18.0)*.08;
return background(uv) + palette(uv.x*.12+uv.y*.21 + uTime*.03)*ink*(1.0-smoothstep(1.2,2.2,length(uv)));
}
vec3 bloom(vec2 uv) {
vec2 p = turn(uTime*.12)*lens(uv);
float a = atan(p.y,p.x), r = length(p);
float six = pow(pow(abs(cos(6.0*a/4.0)), .7) + pow(abs(sin(6.0*a/4.0)), .7), -1.25);
float ten = pow(pow(abs(cos(10.0*a/4.0)), .7) + pow(abs(sin(10.0*a/4.0)), .7), -1.25);
float radius = mix(six,ten,.5+.5*sin(uTime*.17));
float d = abs(r-radius);
float layers = pow(.5+.5*cos((r/max(radius,.05))*37.0-uTime*.8), 14.0)*exp(-d*2.5);
return background(uv)+palette(a*.18+r*.35+uTime*.035)*(exp(-d*140.0)+layers*.55);
}
vec3 waves(vec2 uv) {
vec2 p = lens(uv)*3.0;
float field = sin(length(p-vec2(sin(uTime*.2),.7))*10.0-uTime*1.1)
+ sin(length(p-vec2(-.8,cos(uTime*.17)))*11.0-uTime*.95)
+ sin(dot(p,vec2(.7,.7))*7.0+uTime*.8);
float contour = pow(.5+.5*cos(field*4.0), 8.0);
return background(uv)+palette(field*.14+uTime*.025)*(.14+contour*.7)*exp(-dot(uv,uv)*.13);
}
vec3 spiral(vec2 uv) {
vec2 p = lens(uv), q = turn(uTime*.1)*p;
float r = max(length(q), .003), a = atan(q.y,q.x);
float winding = a*6.0-log(r)*8.0-uTime*.65;
float arms = pow(.5+.5*cos(winding), 18.0);
float beads = pow(.5+.5*cos(log(r)*39.0+uTime*.5), 12.0);
return background(uv)+palette(log(r)*.18+a*.1+uTime*.035)*(arms*.7+arms*beads*.5)*smoothstep(.0,.13,r)*exp(-r*.7);
}
vec3 kaleidoscope(vec2 uv) {
vec2 p = lens(uv);
float r = length(p), angle = atan(p.y,p.x);
float wedge = abs(mod(angle + uTime*.05, .523599)-.261799);
p = vec2(cos(wedge),sin(wedge))*log(1.0+r*3.0);
for (int i = 0; i < 5; i++) p = abs(turn(.65+sin(uTime*.08)*.15)*p)-vec2(.45,.22);
float d = abs(length(p)-.18);
return background(uv)+palette(p.x*.8+p.y*.3+uTime*.035)*(exp(-d*65.0)+exp(-d*12.0)*.2);
}
vec3 crystal(vec2 uv, int mode) {
vec2 p = lens(uv)*4.0;
float field = .0;
if (mode == 27) {
for (int i = 0; i < 5; i++) {
float angle = float(i)*1.256637;
field += cos(dot(p,vec2(cos(angle),sin(angle)))*4.0+sin(uTime*.15)*.6);
}
} else {
vec2 q = turn(.09+sin(uTime*.11)*.07)*p;
field = cos(p.x*8.0)+cos(dot(p,vec2(.5,.866025))*8.0)+cos(dot(p,vec2(-.5,.866025))*8.0);
field += cos(q.x*8.0)+cos(dot(q,vec2(.5,.866025))*8.0)+cos(dot(q,vec2(-.5,.866025))*8.0);
}
float ink = pow(.5+.5*cos(field*2.2-uTime*.35),12.0);
return background(uv)+palette(field*.055+uTime*.027+length(uv)*.06)*(.12+ink*.8);
}
vec3 foam(vec2 uv) {
vec2 p = lens(uv)*3.2, cell = floor(p), local = fract(p);
float first = 10.0, second = 10.0, identity = .0;
for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
vec2 offset = vec2(float(x),float(y)), id = cell+offset;
vec2 hash = fract(sin(vec2(dot(id,vec2(127.1,311.7)),dot(id,vec2(269.5,183.3)))+uSeed*.01)*43758.5453);
vec2 center = .5+.3*sin(hash*6.28318+uTime*.22);
float d = length(offset+center-local);
if (d < first) { second = first; first = d; identity = hash.x; }
else second = min(second,d);
}
float edge = exp(-(second-first)*38.0);
vec3 tint = palette(identity*.8+uTime*.025);
return background(uv)+tint*(edge*.9+.12*exp(-first*first*3.0));
}
vec3 cassini(vec2 uv) {
vec2 p = turn(uTime*.11)*lens(uv);
float radius = .57+.15*sin(uTime*.28);
float field = length(p-vec2(.55,.0))*length(p+vec2(.55,.0))-radius*radius;
float halo = exp(-abs(field)*100.0);
float contours = pow(.5+.5*cos(field*65.0-uTime*.6),16.0)*exp(-abs(field)*5.0);
return background(uv)+palette(p.y*.2+uTime*.03)*(halo+contours*.45);
}
vec3 invocation(vec2 uv) {
float r = length(uv), a = atan(uv.y,uv.x);
float sphere = sqrt(max(.0,1.0-r*r/.4));
float halo = exp(-abs(r-.72)*90.0)+exp(-abs(r-1.0-.035*sin(a*12.0+uTime))*80.0)*.55;
float sigil = exp(-abs(r-.83-.075*cos(a*6.0-uTime*.5))*95.0);
vec3 orb = palette(sphere*.2 + a*.08+uTime*.04)*sphere;
orb *= .5+.5*sin(sphere*28.0+a*4.0-uTime*1.4);
return background(uv)+orb+palette(a*.13+uTime*.035)*(halo+sigil)*.7;
}
float shape(vec3 p, int mode) {
if (mode == 6) {
p.xy -= vec2(sin(p.z * .42 + uTime * .18), cos(p.z * .32)) * uCurvature * .65;
p.xy = turn(p.z * .19 + uTime * .09) * p.xy;
float angle = atan(p.y, p.x);
float z = mod(p.z + uTime * .55, 1.15) - .575;
float ring = length(vec2(length(p.xy) - 1.45 - .14 * sin(angle * 6.0 + p.z), z)) - .035;
float rails = max(abs(length(p.xy) - 1.45) - .024, abs(sin(angle * 6.0 + p.z * .24)) * .22 - .022);
return min(ring, rails);
}
p.xz = turn(uTime * .16 + uSeed * .043 + uPointer.x * .3) * p.xz;
p.yz = turn(.32 + uPointer.y * .25 + sin(uTime * .15) * .18) * p.yz;
if (mode == 24) {
// Helical rails and rungs: a mathematical ladder, not a DNA structure model.
float bound = length(p)-1.5;
if (bound > .1) return bound;
float angle = p.y*4.8+uTime*.2;
vec2 helix = .65*vec2(cos(angle),sin(angle));
float rails = min(length(p.xz-helix),length(p.xz+helix))-.05;
float level = floor(p.y/.26+.5)*.26;
vec2 rung = turn(-(level*4.8+uTime*.2))*p.xz;
float rods = max(length(vec2(rung.y,p.y-level))-.025,abs(rung.x)-.65);
return max(min(rails,rods),abs(p.y)-1.25)*.32;
}
if (mode == 25) {
// Orbital-inspired lobes, deliberately sculptural rather than probability data.
float two = min(length((p-vec3(.0,.57,.0))/vec3(.42,.68,.42)),length((p+vec3(.0,.57,.0))/vec3(.42,.68,.42)))-1.0;
float four = length((abs(p)-vec3(.48,.48,.0))/vec3(.46,.46,.34))-1.0;
float lobes = mix(two,four,.5+.5*sin(uTime*.2))*.32;
float collar = length(vec2(length(p.xz)-.66,p.y))-.055;
return min(min(lobes,collar),length(p)-.12);
}
if (mode == 8) {
vec3 q = p*.9;
vec3 box = abs(q)-vec3(1.0);
float d = length(max(box,.0))+min(max(box.x,max(box.y,box.z)),.0);
float scale = 1.0;
for (int i = 0; i < 3; i++) {
vec3 a = mod(q*scale,2.0)-1.0;
scale *= 3.0;
vec3 cut = abs(1.0-3.0*abs(a));
float hole = (min(max(cut.x,cut.y),min(max(cut.y,cut.z),max(cut.z,cut.x)))-1.0)/scale;
d = max(d,hole);
}
return d/.9;
}
p.xy = turn(p.z * uCurvature * .62) * p.xy;
float radius = length(p);
float frequency = mode == 7 ? 4.8 : 7.2;
vec3 g = p * frequency + vec3(sin(uTime * .21), cos(uTime * .17), sin(uTime * .13)) * .5;
float maze = (abs(dot(sin(g), cos(g.zxy))) - .23) / (frequency * 1.8);
if (mode == 7) return max(max(maze, radius - 1.3 - .07 * sin(p.y * 4.0 + uTime * .3)), .55 - radius);
float shell = abs(radius - 1.08 - .045 * sin(p.y * 5.0 + uTime * .4)) - .065;
float orb = min(max(shell, maze), radius - .86);
p.yz = turn(.65 + sin(uTime * .16) * .3) * p.yz;
return min(orb, length(vec2(length(p.xy) - 1.51, p.z)) - .018);
}
bool solid(int mode) { return mode == 0 || mode == 6 || mode == 7 || mode == 8 || mode == 24 || mode == 25; }
float world(vec3 p, int mode) {
float d = shape(p, mode);
if (solid(uMode) && solid(uNextMode) && uMorph > .001) return mix(d, shape(p, uNextMode), uMorph);
return d;
}
vec3 sculpture(vec2 uv, int mode) {
float camera = mode == 6 ? 4.8 : 3.55;
if (solid(uMode) && solid(uNextMode)) camera = mix(camera, uNextMode == 6 ? 4.8 : 3.55, uMorph);
vec3 origin = vec3(.0, .0, camera);
vec3 ray = normalize(vec3(lens(uv) * (1.0 + uCurvature * .08 * dot(uv, uv)), -1.85));
float travel = .0, glow = .0;
vec3 point = origin;
bool hit = false;
for (int i = 0; i < 64; i++) {
// The corridor's distant rails fade into the fog; do not trace empty depth.
// Blended solid sculptures retain the full iteration budget.
if (mode == 6 && i >= 40 && !(solid(uNextMode) && uMorph > .001)) break;
point = origin + ray * travel;
float d = world(point, mode);
glow += exp(-abs(d) * 28.0) * .011;
if (d < .003) { hit = true; break; }
travel += max(d * .65, .009);
if (travel > 14.0) break;
}
vec3 tint = palette(length(point) * .11 + point.y * .12 + uTime * .026 + uSeed * .017);
vec3 color = background(uv);
if (hit) {
vec2 e = vec2(.003, -.003);
vec3 n = normalize(e.xyy * world(point + e.xyy, mode) + e.yyx * world(point + e.yyx, mode)
+ e.yxy * world(point + e.yxy, mode) + e.xxx * world(point + e.xxx, mode));
float light = max(dot(n, normalize(vec3(-.5, .8, 1.2))), .0);
float edge = pow(1.0 - max(dot(n, -ray), .0), 2.4);
float specular = pow(max(dot(reflect(ray, n), normalize(vec3(-.5, .8, 1.2))), .0), 24.0);
vec3 surface = tint * (.18 + light * .72) + vec3(.6, .85, 1.0) * specular * .7;
surface += palette(.55 + point.z * .15 + uTime * .025) * edge * .8;
color = mix(color, surface, exp(-travel * (mode == 6 ? .085 : .035)));
}
return color + tint * glow * .45;
}
vec3 scene(vec2 uv, int mode, float age) {
if (mode == 1 || mode == 2) return escapeSet(uv, mode == 1 ? .0 : 1.0, age);
if (mode == 3) return triangle(uv);
if (mode == 4) return tree(uv);
if (mode == 5) return hypercube(uv);
if (curve(mode)) return knot(uv);
if (mode == 12) return newton(uv);
if (mode == 13) return inversion(uv);
if (mode == 14) return bloom(uv);
if (mode == 15) return waves(uv);
if (mode == 16) return spiral(uv);
if (mode == 17) return kaleidoscope(uv);
if (mode == 26 || mode == 27) return crystal(uv,mode);
if (mode == 28) return foam(uv);
if (mode == 29) return cassini(uv);
return sculpture(uv, mode);
}
void main() {
vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
vec2 original = uv;
uv = turn(uInvocation*.45)*uv*(1.0+uInvocation*.35);
vec3 color;
if ((uMode == 1 || uMode == 2) && (uNextMode == 1 || uNextMode == 2)) {
float julia = mix(uMode == 1 ? .0 : 1.0, uNextMode == 1 ? .0 : 1.0, uMorph);
color = escapeSet(uv, julia, mix(uPhase, .0, uMorph));
} else if (curve(uMode) && curve(uNextMode)) {
color = knot(uv);
} else if (solid(uMode) && solid(uNextMode)) {
color = sculpture(uv, uMode);
} else {
float swirl = sin(atan(uv.y, uv.x) * 3.0 + length(uv) * 4.0 - uTime * .25) * .08;
float merge = clamp(uMorph + swirl * sin(uMorph * 3.14159), .0, 1.0);
color = scene(uv + uv * sin(uMorph * 3.14159) * .12, uMode, uPhase);
if (uMorph > .001) color = mix(color, scene(turn((1.0 - uMorph) * .12) * uv, uNextMode, .0), smoothstep(.0, 1.0, merge));
}
color *= 1.0 - .18 * smoothstep(.6, 2.8, length(uv));
if (uInvocation > .001) color = mix(color, invocation(original), smoothstep(.0,1.0,uInvocation)*.94);
gl_FragColor = vec4(pow(clamp(color, .0, 1.0), vec3(.9)), 1.0);
}
`;

/** Seeded order changes each circuit; every shape appears once per circuit. */
function shuffledCircuit(seed: number, circuit: number): number[][] {
  let state = (seed ^ Math.imul(circuit + 1, 0x9e3779b9)) >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ state >>> 15, state | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  // Keep the quadratic sets together so c and the initial z genuinely morph
  // between Mandelbrot and Julia, rather than only blending their pictures.
  const groups = [[0], random() < .5 ? [1, 2] : [2, 1], [3], [4], [5], [6], [7], [8],
    random() < .5 ? [9, 10, 18, 11] : [11, 18, 10, 9], [12], [13], [14], [15], [16], [17],
    random() < .5 ? [19, 20, 21] : [21, 20, 19], random() < .5 ? [22, 23] : [23, 22], [24], [25], [26], [27], [28], [29]];
  for (let index = groups.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [groups[index], groups[other]] = [groups[other], groups[index]];
  }
  return groups;
}

export function secretSceneOrder(seed: number, circuit = 0): number[] {
  const groups = shuffledCircuit(seed, circuit);
  if (circuit > 0) {
    const previous = shuffledCircuit(seed, circuit - 1);
    const lastGroup = previous[previous.length - 1];
    // Exchange whole groups, keeping the quadratic pair and the final scene
    // intact, so the next circuit can make the same boundary check cheaply.
    if (groups[0][0] === lastGroup[lastGroup.length - 1]) [groups[0], groups[1]] = [groups[1], groups[0]];
  }
  return groups.flat();
}

/** Project the 16 tesseract vertices once per frame, rather than per pixel. */
export function secretCubeProjection(time: number, seed: number, output = new Float32Array(32)): Float32Array {
  const angles = [time * .23 + seed * .11, time * .17, time * .14, .45 + time * .09];
  const cosines = angles.map(Math.cos);
  const sines = angles.map(Math.sin);
  for (let index = 0; index < 16; index++) {
    let x = (index & 1) ? 1 : -1;
    let y = (index & 2) ? 1 : -1;
    let z = (index & 4) ? 1 : -1;
    let w = (index & 8) ? 1 : -1;
    [x, w] = [x * cosines[0] + w * sines[0], -x * sines[0] + w * cosines[0]];
    [z, w] = [z * cosines[1] + w * sines[1], -z * sines[1] + w * cosines[1]];
    const perspective4D = 1.9 / (3 - w);
    x *= perspective4D; y *= perspective4D; z *= perspective4D;
    [x, z] = [x * cosines[2] + z * sines[2], -x * sines[2] + z * cosines[2]];
    [y, z] = [y * cosines[3] + z * sines[3], -y * sines[3] + z * cosines[3]];
    const perspective3D = 2.8 / (4 - z);
    output[index * 2] = x * perspective3D;
    output[index * 2 + 1] = y * perspective3D;
  }
  return output;
}

export const secretIsCurve = (mode: number) => mode === 9 || mode === 10 || mode === 11 || mode >= 18 && mode <= 23;
let attractorSeed = -1;
const attractor = new Float32Array(64 * 3);

/** Integrate once per seed; only rotate/project the cached Lorenz path per frame. */
function lorenz(seed: number): Float32Array {
  if (attractorSeed === seed) return attractor;
  attractorSeed = seed;
  let x = .1 + seed % 97 / 500, y = .2, z = .3;
  const history = new Float32Array(800 * 3);
  let crossing = -1, end = 0;
  // Frame a short passage between both wings. Sampling sixteen seconds into
  // only 64 vertices obscures the smooth orbit with long crossing chords.
  for (let step = 0; step < 20000; step++) {
    const previousX = x;
    const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - 8 / 3 * z;
    x += dx * .004; y += dy * .004; z += dz * .004;
    const index = step % 800 * 3;
    history[index] = x / 22;
    history[index + 1] = (z - 25) / 22;
    history[index + 2] = y / 22;
    if (crossing < 0 && step > 1200 && previousX * x < 0) crossing = step;
    end = step;
    if (crossing >= 0 && step - crossing >= 400) break;
  }
  for (let index = 0; index < 64; index++) {
    const sample = (end + 1 + Math.round(index / 63 * 799)) % 800 * 3;
    attractor[index * 3] = history[sample];
    attractor[index * 3 + 1] = history[sample + 1];
    attractor[index * 3 + 2] = history[sample + 2];
  }
  return attractor;
}

const planarCurves = new Map<number, Float32Array>();
function planarCurve(mode: number): Float32Array {
  const cached = planarCurves.get(mode);
  if (cached) return cached;
  let points: number[][] = [];
  if (mode === 19) {
    // Hilbert d-to-xy transform on an 8×8 lattice.
    for (let index = 0; index < 64; index++) {
      let x = 0, y = 0, value = index;
      for (let size = 1; size < 8; size *= 2) {
        const rx = value >> 1 & 1, ry = (value ^ rx) & 1;
        if (!ry) { if (rx) { x = size - 1 - x; y = size - 1 - y; } [x, y] = [y, x]; }
        x += size * rx; y += size * ry; value >>= 2;
      }
      points.push([(x / 7 - .5) * 1.85, (y / 7 - .5) * 1.85]);
    }
  } else if (mode === 20) {
    // Six paper folds generate the dragon's 65-vertex polygonal approximation.
    points = [[0, 0], [1, 0]];
    for (let fold = 0; fold < 6; fold++) {
      const end = points[points.length - 1], length = points.length;
      for (let index = length - 2; index >= 0; index--) {
        const [x, y] = points[index];
        points.push([end[0] - (y - end[1]), end[1] + (x - end[0])]);
      }
    }
  } else {
    points = [[0, -.9], [.78, .45], [-.78, .45], [0, -.9]];
    for (let level = 0; level < 2; level++) {
      const refined: number[][] = [];
      for (let index = 0; index < points.length - 1; index++) {
        const [x, y] = points[index], next = points[index + 1];
        const dx = (next[0] - x) / 3, dy = (next[1] - y) / 3;
        refined.push([x, y], [x + dx, y + dy], [x + dx * 1.5 + dy * Math.sqrt(3) / 2, y + dy * 1.5 - dx * Math.sqrt(3) / 2], [x + dx * 2, y + dy * 2]);
      }
      refined.push(points[points.length - 1]); points = refined;
    }
  }
  const result = new Float32Array(64 * 3);
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = 1.85 / Math.max(maxX - minX, maxY - minY);
  for (let index = 0; index < 64; index++) {
    const point = points[mode === 20 ? Math.round(index / 63 * (points.length - 1)) : Math.min(index, points.length - 1)];
    result[index * 3] = (point[0] - (minX + maxX) / 2) * scale;
    result[index * 3 + 1] = (point[1] - (minY + maxY) / 2) * scale;
  }
  planarCurves.set(mode, result);
  return result;
}

let rosslerSeed = -1;
const rosslerOrbit = new Float32Array(64 * 3);
function rossler(seed: number): Float32Array {
  if (rosslerSeed === seed) return rosslerOrbit;
  rosslerSeed = seed;
  let x = .1 + seed % 31 / 100, y = .1, z = .1;
  let index = 0;
  for (let step = 0; step < 12000; step++) {
    const dx = -y - z, dy = x + .2 * y, dz = .2 + z * (x - 5.7);
    x += dx * .005; y += dy * .005; z += dz * .005;
    if (step >= 6400 && (step - 6400) % 80 === 0 && index < 64) {
      rosslerOrbit[index * 3] = x / 11;
      rosslerOrbit[index * 3 + 1] = y / 11;
      rosslerOrbit[index * 3 + 2] = (z - 8) / 14;
      index++;
    }
  }
  return rosslerOrbit;
}

function curvePoint(mode: number, index: number, seed: number, output: Float32Array): void {
  const t = index / 63 * Math.PI * (mode === 18 ? 4 : 2);
  if (mode === 11) {
    const orbit = lorenz(seed);
    output[0] = orbit[index * 3]; output[1] = orbit[index * 3 + 1]; output[2] = orbit[index * 3 + 2];
  } else if (mode >= 19 && mode <= 22) {
    const path = mode === 22 ? rossler(seed) : planarCurve(mode);
    output[0] = path[index * 3]; output[1] = path[index * 3 + 1]; output[2] = path[index * 3 + 2];
  } else if (mode === 23) {
    output[0] = Math.sin(3 * t + .4); output[1] = Math.sin(4 * t); output[2] = Math.sin(5 * t) * .55;
  } else if (mode === 18) {
    const radius = .95 + .32 * Math.cos(t / 2);
    output[0] = radius * Math.cos(t); output[1] = radius * Math.sin(t); output[2] = .48 * Math.sin(t / 2);
  } else if (mode === 10) {
    const radius = .9 + .35 * Math.cos(5 * t);
    output[0] = radius * Math.cos(3 * t); output[1] = radius * Math.sin(3 * t); output[2] = .42 * Math.sin(5 * t);
  } else {
    output[0] = (Math.sin(t) + 2 * Math.sin(2 * t)) * .42;
    output[1] = (Math.cos(t) - 2 * Math.cos(2 * t)) * .42;
    output[2] = -Math.sin(3 * t) * .55;
  }
}
const curveFrom = new Float32Array(3), curveTo = new Float32Array(3);

/** Curves morph their actual 3D vertices before one inexpensive projection. */
export function secretCurveProjection(time: number, seed: number, mode: number, next: number, morph: number, output: Float32Array): Float32Array {
  const from = secretIsCurve(mode) ? mode : next;
  const to = secretIsCurve(next) ? next : from;
  const blend = secretIsCurve(mode) && secretIsCurve(next) ? morph : 0;
  const a = time * .18 + seed * .021, b = .35 + Math.sin(time * .13) * .5;
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  for (let index = 0; index < 64; index++) {
    curvePoint(from, index, seed, curveFrom);
    curvePoint(to, index, seed, curveTo);
    let x = curveFrom[0] + (curveTo[0] - curveFrom[0]) * blend;
    let y = curveFrom[1] + (curveTo[1] - curveFrom[1]) * blend;
    let z = curveFrom[2] + (curveTo[2] - curveFrom[2]) * blend;
    const rotatedX = x * ca + z * sa;
    z = -x * sa + z * ca; x = rotatedX;
    const rotatedY = y * cb + z * sb;
    z = -y * sb + z * cb; y = rotatedY;
    const perspective = 2.8 / (4 - z);
    output[index * 3] = x * perspective;
    output[index * 3 + 1] = y * perspective;
    output[index * 3 + 2] = z;
  }
  return output;
}
