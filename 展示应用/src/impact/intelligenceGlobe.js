import * as THREE from 'three';
import {feature, mesh as geographicMesh} from 'topojson-client';
import {geoCentroid, geoContains} from 'd3-geo';
import topology from '../../public/data/world-50m.json' with {type: 'json'};
import {getRenderQuality, modelDetail} from '../../../共享组件/renderQuality.js';

const RADIUS = 2.2;

// The same equirectangular longitude convention as the existing local earth maps.
function spherePoint(longitude, latitude, radius = RADIUS) {
  const lat = THREE.MathUtils.degToRad(latitude), lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(radius * Math.cos(lat) * Math.sin(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.cos(lon));
}

function coastlineEdges(radius) {
  const points = [], a = new THREE.Vector3(), b = new THREE.Vector3(), p = new THREE.Vector3();
  // Outer land contours only. Internal political borders visually fractured
  // the material into a patchwork, especially on the enlarged detail globe.
  const borders = geographicMesh(topology, topology.objects.countries, (a, b) => a === b);
  for (const line of borders.coordinates) {
    // Keep the geographic outline, while suppressing sub-pixel coastline noise.
    let previous = spherePoint(...line[0], radius);
    for (let i = 1; i < line.length; i++) {
      const next = spherePoint(...line[i], radius);
      if (i < line.length - 1 && previous.distanceToSquared(next) < .00006) continue;
      const steps = Math.max(1, Math.ceil(previous.angleTo(next) / .025));
      a.copy(previous);
      for (let step = 1; step <= steps; step++) {
        p.copy(previous).lerp(next, step / steps).normalize().multiplyScalar(radius);
        b.copy(p);
        points.push(a.x, a.y, a.z, b.x, b.y, b.z);
        a.copy(b);
      }
      previous = next;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

function landLights(radius) {
  const positions = [], phases = [];
  const countries = feature(topology, topology.objects.countries).features;
  // Decorative points sampled inside real country polygons. They are neither
  // customer locations nor a claim about measured activity or population.
  countries.forEach((country, index) => {
    if (String(country.id) === '010') return;
    const center = geoCentroid(country);
    for (let sample = 0; sample < 5; sample++) {
      const phase = index * 2.399963 + sample * 1.618;
      const spread = sample === 0 ? 0 : .65 + sample * .58;
      const coordinate = [center[0] + Math.cos(phase) * spread, center[1] + Math.sin(phase) * spread * .7];
      if (!geoContains(country, coordinate)) continue;
      const point = spherePoint(...coordinate, radius);
      positions.push(point.x, point.y, point.z);
      phases.push(phase);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
  return geometry;
}

function addMesh(parent, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.rotation.set(...rotation);
  parent.add(object);
  return object;
}

/** Continuous geographic surface with a restrained atmospheric rim and moving light; no private frame loop. */
export function createIntelligenceGlobe(manager, quality = getRenderQuality(), {research=false}={}) {
  const detail = modelDetail('globe', quality);
  const root = new THREE.Group();
  root.name = 'intelligence-market-impact-globe';
  root.userData.qualityModel = 'globe';
  root.userData.radius = 2.9;
  const earth = new THREE.Group();
  earth.rotation.z = .10;
  root.add(earth);

  const loader = new THREE.TextureLoader(manager);
  const load = (file, color = false) => {
    const texture = loader.load(`/media/materials/earth/${file}`);
    texture.name = file;
    texture.anisotropy = quality.render.anisotropy;
    texture.wrapS = THREE.RepeatWrapping;
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };
  const map = load('blue-marble-july-5400.jpg', true);
  const normal = load('earth-normal.jpg');
  const ocean = load('ocean-mask.jpg');
  const surfaceMaterial = new THREE.MeshPhysicalMaterial({
    color: '#edf6ff', map, normalMap: normal, normalScale: new THREE.Vector2(detail.surfaceDetail ? .2 : 0, detail.surfaceDetail ? .2 : 0),
    roughnessMap: ocean, roughness: .78, metalness: .12,
    clearcoat: .1, clearcoatRoughness: .65, envMapIntensity: .35, specularIntensity: .45,
    emissive: '#07192c', emissiveIntensity: .18,
  });
  surfaceMaterial.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      float oceanAmount = texture2D(roughnessMap, vMapUv).r;
      float brightness = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722));
      vec3 silverLand = mix(vec3(.018,.040,.065), vec3(.11,.20,.29), pow(clamp(brightness*1.8,0.0,1.0),.85));
      vec3 deepSea = mix(vec3(.002,.009,.025), vec3(.017,.053,.104), clamp(brightness*5.0,0.0,1.0));
      diffuseColor.rgb = mix(silverLand, deepSea, oceanAmount);
    `).replace('#include <roughnessmap_fragment>', `
      float water = texture2D(roughnessMap, vRoughnessMapUv).r;
      float roughnessFactor = mix(.82, .56, water);
    `);
  };
  surfaceMaterial.customProgramCacheKey = () => 'intelligence-globe-continuous-blue-v2';
  const globe = addMesh(earth, new THREE.SphereGeometry(RADIUS, detail.segment(80), detail.segment(56)), surfaceMaterial);
  globe.name = 'geographic-earth-surface';
  globe.rotation.y = -Math.PI / 2;

  const coastlines = new THREE.LineSegments(coastlineEdges(RADIUS * 1.001), new THREE.LineBasicMaterial({color: '#729ab5', transparent: true, opacity: .16, depthWrite: false}));
  coastlines.name = 'real-coastline-contours'; earth.add(coastlines);
  const lightsMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {clock: {value: 0}},
    vertexShader: `attribute float phase; varying float vPhase; void main(){
      vPhase=phase; vec4 mv=modelViewMatrix*vec4(position,1.0);
      gl_Position=projectionMatrix*mv; gl_PointSize=clamp(length(modelViewMatrix[0].xyz)*48.0/-mv.z,1.1,4.6);
    }`,
    fragmentShader: `uniform float clock; varying float vPhase; void main(){
      float d=length(gl_PointCoord-.5)*2.0;
      float glow=pow(max(0.0,1.0-d),1.6);
      gl_FragColor=vec4(1.0,.76,.39,glow*(.65+.2*sin(vPhase+clock*.45)));
    }`,
  });
  const lights = new THREE.Points(landLights(RADIUS * 1.008), lightsMaterial);
  lights.name = 'decorative-land-lights'; earth.add(lights);
  lights.visible = !research;

  const atmosphere = addMesh(root, new THREE.SphereGeometry(RADIUS * 1.032, detail.segment(64), detail.segment(40)), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 n; varying vec3 eye; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader: 'varying vec3 n; varying vec3 eye; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(eye))),4.0);gl_FragColor=vec4(.22,.53,.85,rim*.31);}',
  }));
  atmosphere.name = 'thin-blue-atmosphere';

  const orbitMaterial = new THREE.MeshBasicMaterial({color: '#ba9e68', transparent: true, opacity: .55});
  const orbitSpecs = [
    {radius: 2.58, tilt: [1.16, .28, -.24]},
    {radius: 2.65, tilt: [.43, -.62, .6]},
    {radius: 2.53, tilt: [-.53, .6, -.65]},
  ];
  const orbits = orbitSpecs.map(({radius, tilt}, index) => {
    const group = new THREE.Group(); group.rotation.set(...tilt); group.name = `gold-light-orbit-${index + 1}`;
    addMesh(group, new THREE.TorusGeometry(radius, .005, 6, detail.segment(128)), orbitMaterial);
    group.visible=!research;root.add(group); return {group, radius};
  });
  const sparkGeometry = new THREE.SphereGeometry(.016, 8, 6);
  const sparkMaterial = new THREE.MeshBasicMaterial({color: '#f2dcac'});
  const sparks = Array.from({length: 15}, (_, index) => {
    const orbit = orbits[index % 3];
    const object = addMesh(orbit.group, sparkGeometry, sparkMaterial);
    object.scale.setScalar(index % 4 === 0 ? 1 : .55);
    return {object, orbit, phase: index * 2.399963, speed: .075 + (index % 3) * .007};
  });

  function update({time = 0, reduced = false} = {}) {
    const clock = reduced ? 0 : time;
    // Keep a continental face in view; a presentation globe should not spend
    // half its cycle showing an empty ocean. Rotation is continuous and subtle.
    earth.rotation.y = -.52 + Math.sin(clock * .038) * .40;
    lightsMaterial.uniforms.clock.value = clock;
    sparks.forEach(({object, orbit, phase, speed}) => {
      const angle = phase + clock * speed;
      object.position.set(Math.cos(angle) * orbit.radius, Math.sin(angle) * orbit.radius, 0);
    });
  }
  update();
  return {root, earth, update};
}
