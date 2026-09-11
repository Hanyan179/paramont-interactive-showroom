import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { feature, mesh } from 'topojson-client';
import { geoEquirectangular, geoPath } from 'd3-geo';

const toPoint = (lat, lng, r) => new THREE.Vector3(r * Math.cos(lat * Math.PI / 180) * Math.sin(lng * Math.PI / 180), r * Math.sin(lat * Math.PI / 180), r * Math.cos(lat * Math.PI / 180) * Math.cos(lng * Math.PI / 180));

async function makeMap() {
  const response = await fetch('/data/world-50m.json'); if (!response.ok) throw new Error('Map unavailable');
  const data = await response.json();
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#092849'; ctx.fillRect(0, 0, 2048, 1024);
  const project = geoEquirectangular().translate([1024, 512]).scale(2048 / (2 * Math.PI));
  const draw = geoPath(project, ctx);
  ctx.beginPath(); draw(feature(data, data.objects.countries)); ctx.fillStyle = '#97b8d1'; ctx.fill();
  ctx.beginPath(); draw(mesh(data, data.objects.countries)); ctx.strokeStyle = '#dce9ed'; ctx.lineWidth = 0.65; ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeMountain(svgText, color = '#082e54') {
  // Extrude the supplied official polygon geometry; do not redraw the identity.
  const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const polygons = [...document.querySelectorAll('polygon')].map((p, i) => {p.setAttribute('fill', i ? '#e7f0f6' : '#082e54'); return p.outerHTML;}).join('');
  const parsed = new SVGLoader().parse('<svg xmlns="http://www.w3.org/2000/svg">' + polygons + '</svg>');
  const group = new THREE.Group();
  parsed.paths.filter(p => p.userData.node.nodeName === 'polygon').forEach((path, index) => {
    SVGLoader.createShapes(path).forEach(shape => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth: index ? 7 : 110, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 3, bevelThickness: 3 });
      const mat = new THREE.MeshPhysicalMaterial({ color: index ? '#e7f0f6' : color, metalness: index ? 0.5 : 0.82, roughness: 0.24, clearcoat: 1 });
      const part = new THREE.Mesh(geo, mat); part.position.z = index ? 113 : 0; group.add(part);
    });
  });
  const box = new THREE.Box3().setFromObject(group), center = box.getCenter(new THREE.Vector3());
  group.children.forEach(child => child.position.sub(center)); group.scale.set(0.012, -0.012, 0.012);
  return group;
}

export function WorldScene({ mode = 'globe', variant = 'atlas', locations = [], selected = 'china', onSelect, lang }) {
  const host = useRef(null), runtime = useRef(null), pins = useRef([]), latest = useRef({ onSelect, locations });
  latest.current = { onSelect, locations };
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false, frame = 0;
    const el = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { setError(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
    el.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new THREE.Scene();
    const lightTheme = variant !== 'atlas';
    scene.fog = new THREE.Fog(lightTheme ? '#e9edf0' : '#06172b', 17, 32);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 70); camera.position.set(0, 0.7, 11); camera.lookAt(0, 0, 0);
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04); scene.environment = env.texture; room.dispose();
    scene.add(new THREE.AmbientLight('#92b9d7', 0.7));
    const key = new THREE.DirectionalLight('#e5f4ff', 4); key.position.set(-4, 8, 5); scene.add(key);
    const rim = new THREE.DirectionalLight('#497eaf', 5); rim.position.set(4, 3, -3); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: lightTheme ? '#e1e7eb' : '#09233e', roughness: 0.35, metalness: 0.68 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.85; scene.add(floor);
    const centerGroup = new THREE.Group(); centerGroup.position.set(-1.8, 0.18, 0); scene.add(centerGroup);
    const content = new THREE.Group(); centerGroup.add(content);
    const state = { targetY: -104 * Math.PI / 180, targetX: 0.23, rotY: -104 * Math.PI / 180, rotX: 0.23, dragging: false, down: null, moved: false, time: 0, globe: null, mode, selected, camera, renderer, scene };
    runtime.current = state;
    let globe = null, mountain = null;
    const pinPoints = locations.map(l => toPoint(l.lat, l.lng, 2.37));
    if (mode === 'globe') {
      globe = new THREE.Mesh(new THREE.SphereGeometry(2.34, 96, 64), new THREE.MeshPhysicalMaterial({ color: '#c1d7e9', metalness: 0.35, roughness: 0.36, clearcoat: 0.75, clearcoatRoughness: 0.22 }));
      // Sphere UVs use a longitude offset from the geographic projection.
      globe.rotation.y = -Math.PI / 2; content.add(globe); state.globe = globe;
      makeMap().then(tex => { if (disposed) { tex.dispose(); return; } globe.material.map = tex; globe.material.bumpMap = tex; globe.material.bumpScale = 0.04; globe.material.needsUpdate = true; }).catch(() => setError(true));
      const glow = new THREE.Mesh(new THREE.SphereGeometry(2.41, 64, 48), new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color('#84b6de') } }, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vP=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
        fragmentShader: 'uniform vec3 glowColor; varying vec3 vN; varying vec3 vP; void main(){float f=pow(1.0-abs(dot(normalize(vN),normalize(vP))),3.0);gl_FragColor=vec4(glowColor,f*0.55);}'
      })); centerGroup.add(glow);
      locations.forEach((l, i) => {
        const point = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' })); point.position.copy(pinPoints[i]); content.add(point);
      });
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.75, 0.18, 96), new THREE.MeshPhysicalMaterial({ color: '#123758', metalness: 0.9, roughness: 0.24, clearcoat: 1 })); pedestal.position.y = -2.86; centerGroup.add(pedestal);
    }
    fetch('/media/brand/logo.svg').then(r => r.text()).then(text => {
      if (disposed) return;
      mountain = makeMountain(text); mountain.rotation.y = -0.25;
      if (mode === 'globe') { mountain.scale.multiplyScalar(0.52); mountain.rotation.x = -1.05; mountain.position.set(0, -2.65, 0); centerGroup.add(mountain); }
      else {
        content.add(mountain); state.rotY = 0.75; state.targetY = 0.75; state.rotX = .08; state.targetX = .08;
        if (variant === 'studio') {
          mountain.scale.multiplyScalar(0.9);
          const accent = new THREE.Mesh(new THREE.TorusGeometry(2.65, .026, 8, 120), new THREE.MeshPhysicalMaterial({color:'#809bb2',metalness:.9,roughness:.25}));
          accent.rotation.x=Math.PI*.33;accent.rotation.y=.3;content.add(accent);

        }
      }
    }).catch(() => setError(true));
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); centerGroup.position.x = camera.aspect > 1.5 ? -1.75 : -1.15; camera.position.z = camera.aspect > 1.5 ? 11 : 13.7; };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const down = e => { state.dragging = true; state.down = { x: e.clientX, y: e.clientY }; state.moved = false; el.setPointerCapture(e.pointerId); };
    const move = e => {
      if (!state.dragging || !state.down) return;
      const dx = e.clientX - state.down.x, dy = e.clientY - state.down.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
      state.targetY += dx * 0.007; state.targetX = THREE.MathUtils.clamp(state.targetX + dy * 0.005, -0.9, 0.9);
      state.down = { x: e.clientX, y: e.clientY };
    };
    const up = e => { state.dragging = false; state.down = null; if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    const visibility = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(tick); };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick(now) {
      frame = 0; if (disposed || document.hidden) return;
      state.time = now;
      state.rotY = THREE.MathUtils.lerp(state.rotY, state.targetY, reduced ? 1 : 0.065);
      state.rotX = THREE.MathUtils.lerp(state.rotX, state.targetX, reduced ? 1 : 0.065);
      content.rotation.set(state.rotX, state.rotY, 0);
      if (mode !== 'globe' && !state.dragging && !reduced) { content.rotation.y += Math.sin(now * 0.00028) * 0.17; content.position.y = Math.sin(now * 0.00065) * 0.09; }
      scene.updateMatrixWorld();
      if (mode === 'globe') pinPoints.forEach((point, i) => {
        const pin = pins.current[i]; if (!pin) return;
        const world = point.clone().applyMatrix4(content.matrixWorld), normal = point.clone().normalize().transformDirection(content.matrixWorld);
        const visible = normal.dot(camera.position.clone().sub(world).normalize()) > 0.14;
        const projected = world.project(camera);
        pin.style.transform = `translate(-50%,-50%) translate(${(projected.x * 0.5 + 0.5) * el.clientWidth}px,${(-projected.y * 0.5 + 0.5) * el.clientHeight}px)`;
        pin.style.opacity = visible ? 1 : 0; pin.style.pointerEvents = visible ? 'auto' : 'none'; pin.tabIndex = visible ? 0 : -1;
      });
      renderer.render(scene, camera);
      el.dataset.ready = 'true'; el.dataset.rotation = state.rotY.toFixed(3);
      frame = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', visibility); frame = requestAnimationFrame(tick);
    const lost = e => { e.preventDefault(); setError(true); }; renderer.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      disposed = true; cancelAnimationFrame(frame); ro.disconnect(); document.removeEventListener('visibilitychange', visibility);
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m)); });
      materials.forEach(m => { if (m.map) textures.add(m.map); if (m.bumpMap) textures.add(m.bumpMap); m.dispose(); }); textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose());
      env.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove(); runtime.current = null;
    };
  }, [mode, variant]);
  useEffect(() => {
    const s = runtime.current, l = locations.find(l => l.id === selected); if (!s || !l || mode !== 'globe') return;
    const target = -l.lng * Math.PI / 180;
    s.targetY = s.rotY + Math.atan2(Math.sin(target - s.rotY), Math.cos(target - s.rotY)); s.targetX = l.lat * Math.PI / 180 * 0.55;
  }, [selected, locations, mode]);
  return <div className="world-scene" ref={host} data-testid="world-scene" role="group" aria-label={lang === 'zh' ? '可拖动三维场景' : 'Draggable 3D scene'}>
    {mode === 'globe' && locations.map((l, i) => <button ref={e => pins.current[i] = e} key={l.id} className={`globe-pin ${selected === l.id ? 'selected' : ''}`} onPointerDown={e => e.stopPropagation()} onClick={() => onSelect(l.id)} aria-label={`${lang === 'zh' ? '定位' : 'Locate'} ${l.name[lang === 'zh' ? 0 : 1]}`}><i /><span>{l.name[lang === 'zh' ? 0 : 1]}</span></button>)}
    {error && <div className="scene-error">{lang === 'zh' ? '三维场景加载遇到问题，请刷新重试。' : 'The 3D scene could not load. Please reload.'}<button onClick={() => location.reload()}>{lang === 'zh' ? '重新加载' : 'Reload'}</button></div>}
  </div>;
}
