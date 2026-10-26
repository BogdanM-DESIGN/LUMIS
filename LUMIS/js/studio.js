// 3D preview of a configured lamp. Loaded only when a product opens.
// Shapes are the printed parts' shapes (see js/geometry.js); the light is an artistic preview,
// not a photometric simulation.
import * as THREE from '../vendor/three.module.min.js';

import { LAMP, shadeRadius, baseProfile, ringProfile, plinthR, chaikin } from './geometry.js';

// The shapes come from the same spec as the printed parts (lampa/spec.json), in millimetres.
const MM = 0.01; // scene units: 1 unit = 100 mm
const SHADE_H = LAMP.shade.height, SHADE_Z0 = LAMP.shade.z0, WALL = LAMP.shade.wall;

const SHADE_DAY = new THREE.Color(0xf1ece4), SHADE_LIT = new THREE.Color(0xa59f98), SHADE_LIT_LITHO = new THREE.Color(0x4a4643);

// Open shell with an extra seam column so UVs stay continuous; seam normals are averaged afterwards.
function shadeGeometry(kind) {
  const nth = { ribbed: 432, twist: 420, wave: 288, litho: 128 }[kind], nz = kind === 'litho' ? 40 : 140;
  const cols = nth + 1, pos = new Float32Array(cols * nz * 3), uv = new Float32Array(cols * nz * 2), idx = [];
  for (let i = 0; i < nz; i++) {
    const z = i / (nz - 1);
    for (let j = 0; j < cols; j++) {
      const th = (j / nth) * Math.PI * 2, r = shadeRadius(kind, th, z), k = i * cols + j;
      pos.set([r * MM * Math.cos(th), (SHADE_Z0 + z * SHADE_H) * MM, -r * MM * Math.sin(th)], k * 3);
      uv.set([j / nth - 0.25, z], k * 2); // the side facing the camera (theta = 270 deg) lands on u = 0.5; texture repeats
    }
  }
  for (let i = 0; i < nz - 1; i++) for (let j = 0; j < nth; j++) {
    const a = i * cols + j, b = a + 1, c = a + cols + 1, d = a + cols;
    idx.push(a, b, c, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.attributes.normal;
  for (let i = 0; i < nz; i++) {
    const a = i * cols, b = a + nth, v = new THREE.Vector3().fromBufferAttribute(n, a).add(new THREE.Vector3().fromBufferAttribute(n, b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
  }
  return g;
}

const lathe = (pts, seg = 128) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * MM, y * MM)), seg);
// LatheGeometry spaces V by profile point, not by height, so layer lines would bunch at rounded corners.
// Map V to height instead: one texture period per printed layer.
function byHeight(geo, layerMm) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, pos.getY(i) / MM / layerMm);
  uv.needsUpdate = true;
  return geo;
}
const BASE_LAYER = 0.2; // mm, as in lampa/GHID-PRINT.md

// FDM layer lines as a tangent-space normal map: a fine horizontal ripple, repeated up the part
function layerLines(repeatY) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 32;
  const g = c.getContext('2d'), d = g.createImageData(4, 32);
  for (let y = 0; y < 32; y++) {
    const n = Math.round(128 + 70 * Math.sin((y / 32) * Math.PI * 2));
    for (let x = 0; x < 4; x++) d.data.set([128, n, 255, 255], (y * 4 + x) * 4);
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, repeatY);
  return t;
}

function gradientTexture(stops, w = 4, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, h, 0, 0);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function contactShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.42, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.75).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.y = 0.002;
  return m;
}

// Glow is stronger where the view grazes the shell, as with real translucent PLA.
// On the lithophane the effect is kept small so it does not wash the photo out at the edges.
const graze = { base: { value: 0.72 }, gain: { value: 0.55 } };
function glowShell(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.lumisGrazeBase = graze.base;
    sh.uniforms.lumisGrazeGain = graze.gain;
    sh.fragmentShader = 'uniform float lumisGrazeBase;\nuniform float lumisGrazeGain;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n float lumisGraze = 1.0 - abs(dot(normal, normalize(vViewPosition)));\n totalEmissiveRadiance *= lumisGrazeBase + lumisGrazeGain * lumisGraze;');
  };
  return mat;
}

function environment(renderer) {
  const env = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: gradientTexture([[0, '#5d5650'], [0.5, '#b9b2a8'], [1, '#f4f1ec']]) }));
  env.add(sky);
  const soft = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  soft.position.set(-6, 4, 5); soft.lookAt(0, 0, 0); env.add(soft);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(env, 0.04);
  pm.dispose(); sky.geometry.dispose(); sky.material.map.dispose(); sky.material.dispose(); soft.geometry.dispose(); soft.material.dispose();
  return rt;
}

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function createStudio(canvas, { reduceMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const envRT = environment(renderer);
  scene.environment = envRT.texture;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
  camera.position.set(0, 1.25, 7.2);
  const target = new THREE.Vector3(0, 1.05, 0); // mid-height of a 20 cm lamp

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x6f655c, 0.7);
  const key = new THREE.DirectionalLight(0xfff1e0, 1.5); key.position.set(-3, 4, 4);
  const rim = new THREE.DirectionalLight(0xdfe6ff, 0.5); rim.position.set(3, 2, -3);
  // warm spill from the lamp onto the front of the base and the table, kept low so it does not mark the shade
  const inner = new THREE.PointLight(0xffb36b, 0, 1.8, 2); inner.position.set(0, 0.06, 1.35);
  scene.add(hemi, key, rim, inner);

  const lamp = new THREE.Group();
  scene.add(lamp, contactShadow());

  const falloff = gradientTexture([[0, '#ffffff'], [0.55, '#f4e2c8'], [1, '#dcc5a4']]);
  const shadeLines = layerLines(300), baseLines = layerLines(1);
  const shadeMat = glowShell(new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.55, side: THREE.DoubleSide, emissive: 0xffa95c, emissiveIntensity: 0,
    normalMap: shadeLines, normalScale: new THREE.Vector2(0.25, 0.25) }));
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.5 });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2dfd8, roughness: 0.62, envMapIntensity: 0.6, normalMap: baseLines, normalScale: new THREE.Vector2(0.3, 0.3) });
  // the recessed plinth sits in the body's shadow; darkening it stands in for that occlusion
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x6f6c68, roughness: 0.7, envMapIntensity: 0.3 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xcdb68c, roughness: 0.3, metalness: 0.85, emissive: 0xfff1d8, emissiveIntensity: 0 });

  let shade = null, rimMesh = null, base = null, plinth = null, photoTex = null, sampleTex = null;
  const state = { shade: null, base: null, color: '#E2DFD8', ring: 'champagne', lit: true, photo: null };
  let glow = 1, glowTarget = 1, glowFrom = 1, glowT0 = 0;

  function replace(mesh, geo, mat) {
    if (mesh) { lamp.remove(mesh); mesh.geometry.dispose(); }
    const m = new THREE.Mesh(geo, mat); lamp.add(m); return m;
  }

  function buildShade(kind) {
    shade = replace(shade, shadeGeometry(kind), shadeMat);
    // the printed wall seen at the top edge
    const top = SHADE_Z0 + SHADE_H, rTop = shadeRadius(kind, 0, 1);
    rimMesh = replace(rimMesh, lathe(chaikin([[rTop - WALL, top - 0.5], [rTop + 0.1, top - 0.5], [rTop + 0.1, top], [rTop - WALL, top]], 2, true)), rimMat);
  }

  const ring = replace(null, lathe(ringProfile(), 160), ringMat);

  function litho() { return state.shade === 'litho' ? (photoTex || sampleTex) : null; }

  function applyMaterials() {
    const lt = litho();
    shadeMat.emissiveMap = lt || falloff;
    // off: the photo only reads as a faint relief; on: it shows through the light
    shadeMat.bumpMap = lt; shadeMat.bumpScale = lt ? 2.5 : 0;
    shadeMat.map = null;
    shadeMat.needsUpdate = true;
    baseMat.color.set(state.color);
    plinthMat.color.set(state.color).multiplyScalar(0.42);
    if (state.ring === 'champagne') { ringMat.color.set(0xc9ad7c); ringMat.metalness = 0.85; ringMat.roughness = 0.3; }
    else { ringMat.color.set(0xf3f0ea); ringMat.metalness = 0; ringMat.roughness = 0.45; }
    applyGlow();
  }

  function applyGlow() {
    const g = glow, lt = !!litho();
    // lit, the shell's colour comes from the light passing through it, not from the room,
    // so the reflected part dims; that keeps the lithophane image readable instead of washing out
    shadeMat.color.copy(SHADE_DAY).lerp(lt ? SHADE_LIT_LITHO : SHADE_LIT, g);
    shadeMat.emissiveIntensity = (lt ? 0.95 : 1.05) * g;
    graze.base.value = lt ? 0.9 : 0.72;
    graze.gain.value = lt ? 0.2 : 0.55;
    ringMat.emissiveIntensity = state.ring === 'lumina' ? 1.6 * g : 0;
    inner.intensity = 1.4 * g;
    hemi.intensity = 0.7 - 0.38 * g;
    key.intensity = 1.5 - 0.95 * g;
    rim.intensity = 0.5 - 0.3 * g;
  }

  // render on demand
  let raf = 0, alive = true;
  const frame = (t) => {
    raf = 0;
    if (!alive) return;
    let more = false;
    if (glow !== glowTarget) {
      const k = Math.min(1, (t - glowT0) / (reduceMotion ? 1 : 520));
      const e = 1 - Math.pow(1 - k, 3);
      glow = glowFrom + (glowTarget - glowFrom) * e;
      if (k >= 1) glow = glowTarget; else more = true;
      applyGlow();
    }
    if (Math.abs(vel) > 0.0004 && !dragging) { yaw += vel; vel *= 0.94; more = true; }
    lamp.rotation.y = yaw;
    camera.position.set(Math.sin(0) * 7.2, 0.9 + pitch * 3, 7.2);
    camera.lookAt(target);
    renderer.render(scene, camera);
    if (more) request();
  };
  const request = () => { if (!raf && alive) raf = requestAnimationFrame(frame); };

  // orbit by drag or keys, with inertia
  let yaw = -0.35, pitch = 0.08, vel = 0, dragging = false, lastX = 0, lastY = 0, lastT = 0;
  const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); vel = 0; canvas.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!dragging) return;
    const now = performance.now(), dx = e.clientX - lastX, dy = e.clientY - lastY;
    yaw += dx * 0.01; pitch = Math.max(-0.05, Math.min(0.3, pitch + dy * 0.002));
    vel = reduceMotion ? 0 : (dx * 0.01) / Math.max(1, (now - lastT) / 16);
    lastX = e.clientX; lastY = e.clientY; lastT = now; request();
  };
  const onUp = () => { dragging = false; request(); };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); yaw += e.key === 'ArrowLeft' ? -0.2 : 0.2; vel = 0; request(); }
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('keydown', onKey);

  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 32 : 26;
    camera.updateProjectionMatrix();
    request();
  });
  ro.observe(canvas);

  const loader = new THREE.TextureLoader();
  loader.load('img/litofanie-mostra.webp', (t) => { if (!alive) { t.dispose(); return; } t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); sampleTex = t; applyMaterials(); request(); });

  return {
    set({ shade: kind, base: b, color, ring: r }) {
      if (kind && kind !== state.shade) { state.shade = kind; buildShade(kind); }
      if (b && b !== state.base) {
        state.base = b;
        base = replace(base, byHeight(lathe(baseProfile(b), 160), BASE_LAYER), baseMat);
        const pr = plinthR(b), ph = LAMP.plinth.height;
        plinth = replace(plinth, lathe([[0, 0], [pr - 0.6, 0], [pr, 0.6], [pr, ph], [0, ph]], 128), plinthMat);
      }
      if (color) state.color = color;
      if (r) state.ring = r;
      applyMaterials(); request();
    },
    setLit(on) {
      state.lit = on; glowFrom = glow; glowTarget = on ? 1 : 0; glowT0 = performance.now(); request();
    },
    setPhoto(sourceCanvas) {
      if (photoTex) { photoTex.dispose(); photoTex = null; }
      if (sourceCanvas) {
        photoTex = new THREE.CanvasTexture(sourceCanvas);
        photoTex.colorSpace = THREE.SRGBColorSpace;
        photoTex.wrapS = THREE.RepeatWrapping;
        photoTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // stays sharp where the cylinder turns away
      }
      applyMaterials(); request();
    },
    resetView() { yaw = -0.35; pitch = 0.08; vel = 0; request(); },
    dispose() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('keydown', onKey);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } });
      [shadeMat, rimMat, baseMat, plinthMat, ringMat].forEach((m) => m.dispose());
      falloff.dispose(); shadeLines.dispose(); baseLines.dispose(); photoTex?.dispose(); sampleTex?.dispose(); envRT.dispose();
      renderer.dispose(); renderer.forceContextLoss();
    }
  };
}
