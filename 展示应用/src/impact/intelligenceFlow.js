import * as THREE from 'three';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {createIntelligenceHero} from './intelligenceHero.js';

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smooth = t => t * t * (3 - 2 * t);
const fract = t => t - Math.floor(t);
const BLUE = new THREE.Color('#79bfe5');
const SILVER = new THREE.Color('#d5ecfa');
const GOLD = new THREE.Color('#e9c68a');

// A strand keeps its identity through all six operations. The targets describe
// where the same material goes; none of the stages mounts a replacement model.
function strandTarget(stage, lane, count, t, out) {
  const u = lane / count;
  const a = u * TAU;
  const q = fract(lane * .61803398875);
  const x = (t - .5) * 17;
  const envelope = Math.sin(t * Math.PI);
  if (stage === 0) {
    const layer = lane % 3 - 1;
    const row = Math.floor(lane / 3) % 9;
    const vertical = Math.floor(lane / 27) % 2;
    const sx = vertical ? (row - 4) * .8 : -3.2;
    const sy = vertical ? -3.1 : (row - 4) * .75;
    const ex = vertical ? sx : 3.2;
    const ey = vertical ? 3.1 : sy;
    const z = layer * 1.45;
    if(t >= .2 && t <= .8) {
      const k = (t - .2) / .6;
      out.set(mix(sx,ex,k),mix(sy,ey,k),z);
    } else if(t < .2) {
      const k = t / .2, h = 1 - k;
      const startY = Math.sin(a * 2) * 2.25;
      const controlX = vertical ? sx : sx - 1.6;
      const controlY = vertical ? sy - 1.1 : sy;
      out.set(h*h*h*(-8-q*.6) + 3*h*h*k*(-5.8) + 3*h*k*k*controlX + k*k*k*sx,
        h*h*h*startY + 3*h*h*k*startY + 3*h*k*k*controlY + k*k*k*sy,
        mix((q-.5)*2,z,smooth(k)));
    } else {
      const k = (t - .8) / .2, h = 1 - k;
      const endY = Math.sin(a) * 1.2;
      const controlX = vertical ? ex : ex + 1.6;
      const controlY = vertical ? ey + 1.1 : ey;
      out.set(h*h*h*ex + 3*h*h*k*controlX + 3*h*k*k*6 + k*k*k*(8+q*.5),
        h*h*h*ey + 3*h*h*k*controlY + 3*h*k*k*endY + k*k*k*endY,
        mix(z,Math.cos(a),smooth(k)));
    }
  } else if (stage === 1) {
    // Six softly separated braids sweep around an asymmetric three-dimensional
    // volume. Their ends do not converge to two points: that would turn the
    // silhouette into a flattened wire lens regardless of material quality.
    const bundle = lane % 6;
    const ribbon = Math.floor(lane / 6) / Math.max(1,Math.ceil(count / 6)-1) - .5;
    const theta = (t-.5) * TAU * (1.03 + bundle * .018) + bundle * .62;
    const r = 3.35 + ribbon * .28 + .22 * Math.sin(theta * 2 + bundle);
    const px = Math.cos(theta) * r;
    const py = Math.sin(theta) * r * (1.08 + bundle*.018);
    const pz = ribbon*.34 + .5*Math.sin(theta*1.7+bundle);
    const tilt = -.62 + bundle * .245;
    const turn = -.75 + bundle * .3;
    const xx = px * Math.cos(turn) + pz * Math.sin(turn);
    const zz = -px * Math.sin(turn) + pz * Math.cos(turn);
    out.set(xx * Math.cos(tilt)-py*Math.sin(tilt),xx*Math.sin(tilt)+py*Math.cos(tilt),zz);
    // Two quiet current bundles leave the weave, keeping directional meaning.
    if(bundle === 0 && Math.floor(lane/6) % 3 === 0) {
      const wave = (t-.5) * TAU;
      out.set((t-.5)*16.5,Math.sin(wave)*1.6+ribbon*.2,Math.cos(wave)*1.4+ribbon*.25);
    }
  } else if (stage === 2) {
    // The analytic weave separates into three clusters. A lifted middle
    // cluster becomes the opportunity, while the other evidence stays present.
    const cluster = lane % 3;
    const cx = [-4.7, .5, 4.65][cluster];
    const cy = [-1.45, 1.25, -.9][cluster];
    const radius = [1.1, 2.65, 1.15][cluster];
    const theta = t * TAU;
    const tilt = a * 2;
    const ringX = Math.cos(theta) * radius;
    const ringY = Math.sin(theta) * radius;
    out.set(cx + ringX, cy + ringY * Math.cos(tilt), ringY * Math.sin(tilt) * .85);
    // A third of the strands keep the relationships between clusters visible.
    if (Math.floor(lane / 3) % 3 === 0) {
      out.set(x, .6 * Math.sin(t * TAU) + Math.sin(a) * .55, Math.cos(a) * .65);
    }
  } else if (stage === 3) {
    const branch = lane % 3;
    const fork = smooth(clamp((t - .28) / .6, 0, 1));
    const spread = (branch - 1) * 2.6;
    const curl = Math.sin(a * 2 + t * TAU) * .24;
    out.set(x, spread * fork + curl * envelope, Math.cos(a) * .48 + fork * (branch - 1) * .5);
  } else if (stage === 4) {
    const family = lane % 3;
    const index = Math.floor(lane / 3);
    const familyCount = Math.ceil(count / 3);
    const f = index / familyCount;
    if (family === 0) {
      // A refillable care bottle: a lathed body, shoulders and a narrow cap.
      const y = -2.55 + t * 5.65;
      let r;
      if (t < .04) r = mix(.64, 1.18, t / .04);
      else if (t < .66) r = 1.18;
      else if (t < .77) r = mix(1.18, .53, smooth((t - .66) / .11));
      else if (t < .81) r = .53;
      else r = .65;
      const theta = f * TAU;
      out.set(-4.5 + Math.cos(theta) * r, y, Math.sin(theta) * r);
      // A few horizontal profile contours articulate the actual product.
      if (index % 5 === 0) {
        const level = Math.floor(index / 5);
        const levels = Math.ceil(familyCount / 5);
        const h = level / Math.max(1, levels - 1);
        const ringR = h > .8 ? .65 : 1.18;
        out.set(-4.5 + Math.cos(t * TAU) * ringR, -2.5 + h * 5.5, Math.sin(t * TAU) * ringR);
      }
    } else if (family === 1) {
      // Four toy stacking rings, plus a central stem. Their round volumes are
      // expressed by persistent meridian wires rather than a new opaque mesh.
      const ring = index % 4;
      const cross = Math.floor(index / 4) / Math.max(1, Math.ceil(familyCount / 4));
      const r = 1.75 - ring * .31;
      const tube = .27;
      const theta = t * TAU;
      const phi = cross * TAU;
      out.set(.2 + Math.cos(theta) * (r + Math.cos(phi) * tube), -2.1 + ring * .94 + Math.sin(phi) * tube, Math.sin(theta) * (r + Math.cos(phi) * tube));
    } else {
      // Three assortment / channel frames, front and side planes connected by
      // their shared corners. This expresses a product reaching a channel.
      const box = index % 3;
      const plane = Math.floor(index / 3) % 3;
      const scale = 1 - box * .15;
      const edge = Math.min(3, Math.floor(t * 4));
      const e = t === 1 ? 1 : fract(t * 4);
      const corners = [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]];
      const p = corners[edge], n = corners[edge + 1];
      const px = mix(p[0], n[0], e) * scale;
      const py = mix(p[1], n[1], e) * 1.55 * scale;
      out.set(4.7 + px + box * .45, py + (box - 1) * .35, (plane - 1) * .7 - box * .55);
    }
  } else {
    // Knowledge is a layered rhombic lattice with a quiet, readable outline.
    const layer = lane % 3 - 1;
    const row = Math.floor(lane / 3) % 9;
    const dir = Math.floor(lane / 27) % 2 ? 1 : -1;
    const u0 = (t - .5) * 6.7;
    const v0 = (row - 4) * .62;
    out.set((u0 + dir * v0) * .78, (dir * u0 - v0) * .54, layer * 1.25 + Math.sin(t * Math.PI) * .15);
    if (lane % 9 === 0) {
      // The lattice retains a few long strands ready for the next collection.
      out.x += Math.sign(t - .5) * Math.pow(Math.abs(t - .5) * 2, 4) * 2.3;
    }
  }
  return out;
}

function pointShader(size, brightness = 1, steady = .07) {
  return new THREE.ShaderMaterial({
    uniforms: {time:{value:0}, pixelScale:{value:size}, brightness:{value:brightness}, steady:{value:steady}, maxSize:{value:7.5}, accents:{value:new THREE.Vector4()}, blue:{value:BLUE}, silver:{value:SILVER}, gold:{value:GOLD}},
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false,
    vertexShader:`
      attribute vec2 flowPath;
      attribute vec4 focus;
      uniform float time, pixelScale, maxSize;
      uniform vec4 accents;
      varying float heat, pulse, lane;
      void main(){
        heat = clamp(dot(focus, accents), 0., 1.);
        lane = flowPath.y;
        float head = fract(flowPath.x - time * .075 - flowPath.y * 2.7);
        pulse = pow(1. - smoothstep(0., .07, head), 2.);
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_PointSize = clamp(pixelScale * (1. + pulse * .75) / max(1., -mv.z), 1.1, maxSize);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      uniform vec3 blue, silver, gold;
      uniform float brightness, steady;
      varying float heat, pulse, lane;
      void main(){
        float r = length(gl_PointCoord - .5) * 2.;
        if(r > 1.) discard;
        float core = pow(1. - r, 2.8);
        float alpha = core * (steady + pulse * .92) * brightness;
        vec3 color = mix(mix(blue, silver, pulse * .55), gold, heat);
        gl_FragColor = vec4(color * (1. + pulse * .6), alpha);
      }`,
  });
}

function filamentShader() {
  return new THREE.ShaderMaterial({
    uniforms:{time:{value:0}, strength:{value:1}, accents:{value:new THREE.Vector4()}, blue:{value:BLUE}, silver:{value:SILVER}, gold:{value:GOLD}},
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false,
    vertexShader:`
      attribute vec2 flowPath;
      attribute vec4 focus;
      uniform vec4 accents;
      varying vec2 path;
      varying float heat;
      void main(){
        path = flowPath;
        heat = clamp(dot(focus, accents), 0., 1.);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader:`
      uniform float time, strength;
      uniform vec3 blue, silver, gold;
      varying vec2 path;
      varying float heat;
      void main(){
        float head = fract(path.x - time * .075 - path.y * 2.7);
        float pulse = pow(1. - smoothstep(0., .17, head), 2.);
        float laneLight = .55 + .45 * sin(path.y * 113. + .7);
        float ends = .28 + .72 * pow(max(0., sin(path.x * 3.14159265)), .35);
        float alpha = (.025 + laneLight * .065 + pulse * .25) * ends * strength;
        vec3 color = mix(mix(blue, silver, pulse * .8), gold, heat);
        gl_FragColor = vec4(color * (1. + pulse * .45), alpha);
      }`,
  });
}

function createSilverThreads(root, laneCount, samples, source) {
  // A few actual silver fibres catch the shared scene lighting. They use the
  // same centreline as the luminous threads, so the sculpture has fine physical
  // highlights without a solid skin hiding the analysis underneath.
  const chosen = [];
  for(let lane = 2; lane < laneCount; lane += 6) chosen.push(lane);
  const sides = 5;
  const position = new Float32Array(chosen.length * samples * sides * 3);
  const normal = new Float32Array(position.length);
  const index = [];
  for(let l = 0; l < chosen.length; l++) for(let i = 0; i < samples - 1; i++) for(let s = 0; s < sides; s++) {
    const a = (l * samples + i) * sides + s;
    const b = (l * samples + i) * sides + (s + 1) % sides;
    index.push(a,b,a + sides,b,b + sides,a + sides);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normal,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(index);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(),13);
  const material = new THREE.MeshStandardMaterial({color:'#a1c6df',metalness:.86,roughness:.24,transparent:true,opacity:.66,depthWrite:false,emissive:'#13384c',emissiveIntensity:.12});
  root.add(new THREE.Mesh(geometry,material));
  const tangent = new THREE.Vector3(), axis = new THREE.Vector3(), bitangent = new THREE.Vector3();
  const reference = new THREE.Vector3(0,1,0), alternative = new THREE.Vector3(1,0,0);
  return {update(){
    for(let l = 0; l < chosen.length; l++) for(let i = 0; i < samples; i++) {
      const j = (chosen[l] * samples + i) * 3;
      const before = (chosen[l] * samples + Math.max(0,i - 1)) * 3;
      const after = (chosen[l] * samples + Math.min(samples - 1,i + 1)) * 3;
      tangent.set(source[after] - source[before],source[after + 1] - source[before + 1],source[after + 2] - source[before + 2]).normalize();
      if(tangent.lengthSq() < .5) tangent.set(1,0,0);
      axis.crossVectors(tangent,Math.abs(tangent.y) > .94 ? alternative : reference).normalize();
      bitangent.crossVectors(tangent,axis).normalize();
      const radius = .012 * (.6 + Math.sin(i / (samples - 1) * Math.PI) * .4);
      for(let side = 0; side < sides; side++) {
        const theta = side / sides * TAU, c = Math.cos(theta), s = Math.sin(theta);
        const nx = axis.x * c + bitangent.x * s, ny = axis.y * c + bitangent.y * s, nz = axis.z * c + bitangent.z * s;
        const v = ((l * samples + i) * sides + side) * 3;
        position[v] = source[j] + nx * radius;
        position[v + 1] = source[j + 1] + ny * radius;
        position[v + 2] = source[j + 2] + nz * radius;
        normal[v] = nx;normal[v + 1] = ny;normal[v + 2] = nz;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }};
}

function createSilkSurfaces(root, laneCount, samples, source) {
  // Narrow, continuous physical ribbons are present in every state. They gain
  // width while material resolves into product surfaces, using the exact same
  // centreline vertices and triangle topology as the preceding analysis.
  const lanes = [];
  for(let i = 0; i < 8; i++) {const lane = Math.min(laneCount-1,Math.floor(i*laneCount/8)+(i%3));if(!lanes.includes(lane)) lanes.push(lane);}
  const position = new Float32Array(lanes.length * samples * 6);
  const normal = new Float32Array(position.length);
  const index = [];
  for(let l = 0; l < lanes.length; l++) for(let i = 0; i < samples-1; i++) {
    const a = (l*samples+i)*2;
    index.push(a,a+1,a+2,a+1,a+3,a+2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normal,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(index);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(),13);
  const material = new THREE.MeshPhysicalMaterial({color:'#82bce2',metalness:.72,roughness:.21,clearcoat:.8,transparent:true,opacity:.26,side:THREE.DoubleSide,depthWrite:false,emissive:'#0a2b45',emissiveIntensity:.28});
  root.add(new THREE.Mesh(geometry,material));
  const tangent = new THREE.Vector3(), radial = new THREE.Vector3(), widthAxis = new THREE.Vector3(), surfaceNormal = new THREE.Vector3();
  const fallback = new THREE.Vector3(0,0,1);
  return {update(weights){
    const impact = weights[4], analytics = weights[1];
    material.opacity = .23 + analytics*.16 + impact*.24;
    for(let l = 0; l < lanes.length; l++) for(let i = 0; i < samples; i++) {
      const lane = lanes[l];
      const j = (lane*samples+i)*3;
      const before = (lane*samples+Math.max(0,i-1))*3;
      const after = (lane*samples+Math.min(samples-1,i+1))*3;
      tangent.set(source[after]-source[before],source[after+1]-source[before+1],source[after+2]-source[before+2]).normalize();
      if(tangent.lengthSq()<.5) tangent.set(0,1,0);
      const family = lane%3;
      const cx = impact * (family===0?-4.5:family===1?.2:5.1);
      radial.set(source[j]-cx,source[j+1]*(1-impact),source[j+2]);
      if(radial.lengthSq()<.01) radial.copy(fallback);
      widthAxis.crossVectors(radial,tangent).normalize();
      if(widthAxis.lengthSq()<.5) widthAxis.crossVectors(fallback,tangent).normalize();
      if(widthAxis.lengthSq()<.5) widthAxis.set(1,0,0);
      surfaceNormal.crossVectors(tangent,widthAxis).normalize();
      const t = i/(samples-1);
      const width = (.036+analytics*.105+impact*.19)*(.25+.75*Math.sin(t*Math.PI));
      for(let side=0;side<2;side++) {
        const offset = side?width:-width;
        const v = ((l*samples+i)*2+side)*3;
        position[v]=source[j]+widthAxis.x*offset;
        position[v+1]=source[j+1]+widthAxis.y*offset;
        position[v+2]=source[j+2]+widthAxis.z*offset;
        normal[v]=surfaceNormal.x;normal[v+1]=surfaceNormal.y;normal[v+2]=surfaceNormal.z;
      }
    }
    geometry.attributes.position.needsUpdate=true;
    geometry.attributes.normal.needsUpdate=true;
  }};
}

function createReturnStream(root, detail) {
  // An open current, not an orbit or circular flywheel. It remains visible
  // during every operation so feedback never looks like a reset to zero.
  const laneCount = 3, samples = detail.segment(96);
  const positions = new Float32Array(laneCount * samples * 3);
  const paths = new Float32Array(laneCount * samples * 2);
  const focuses = new Float32Array(laneCount * samples * 4);
  const indices = [];
  const p = new THREE.Vector3();
  for (let lane = 0; lane < laneCount; lane++) {
    const offset = (lane - (laneCount - 1) / 2) * .065;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(8.8, 1.5 + offset, -1.6),
      new THREE.Vector3(5.7, 2.8 + offset, -3.2),
      new THREE.Vector3(1.1, .6 + offset, -3.5),
      new THREE.Vector3(-3.5, -2.8 + offset, -.9),
      new THREE.Vector3(-6.7, -2.5 + offset, .7),
      new THREE.Vector3(-8.8, -.9 + offset, -.5),
    ]);
    for(let i = 0; i < samples; i++) {
      const n = lane * samples + i;
      curve.getPoint(i / (samples - 1), p);
      positions.set([p.x,p.y,p.z], n * 3);
      paths.set([i / (samples - 1),lane / laneCount], n * 2);
      focuses[n * 4 + 3] = .7;
      if(i < samples - 1) indices.push(n,n + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('flowPath',new THREE.BufferAttribute(paths,2));
  geometry.setAttribute('focus',new THREE.BufferAttribute(focuses,4));
  geometry.setIndex(indices);
  const material = filamentShader();
  material.uniforms.strength.value = .35;
  // Feed the line backwards: from outcomes to retained knowledge, then input.
  const line = new THREE.LineSegments(geometry,material);
  line.renderOrder = 2;
  root.add(line);
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.attributes = geometry.attributes;
  const dotsMaterial = pointShader(70,.45);
  root.add(new THREE.Points(pointsGeometry,dotsMaterial));
  return {update(time,accents){
    material.uniforms.time.value = time * .7;
    material.uniforms.accents.value.copy(accents);
    dotsMaterial.uniforms.time.value = time * .7;
    dotsMaterial.uniforms.accents.value.copy(accents);
  }};
}

function createCoreSignals(root, laneCount, samples, source) {
  const count = 38;
  const positions = new Float32Array(count*3);
  const paths = new Float32Array(count*2);
  const focuses = new Float32Array(count*4);
  const anchors = [];
  for(let i=0;i<count;i++) {
    const lane = Math.floor(fract(i*.61803398875)*laneCount);
    const t = .1+fract(i*.754877666)*.8;
    anchors.push((lane*samples+Math.floor(t*(samples-1)))*3);
    paths.set([t,i/count],i*2);
    focuses.set([i%5===0?.8:0,i%3===0?.65:0,.12,i%7===0?.4:0],i*4);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('flowPath',new THREE.BufferAttribute(paths,2));
  geometry.setAttribute('focus',new THREE.BufferAttribute(focuses,4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(),13);
  const light = pointShader(165,1.7,.4);
  const halo = pointShader(520,.15,.85);
  halo.uniforms.maxSize.value=28;
  root.add(new THREE.Points(geometry,halo),new THREE.Points(geometry,light));
  return {update(time,weights,accents){
    for(let i=0;i<count;i++) {
      const j=anchors[i],v=i*3;
      const inset=mix(.5+fract(i*.371)*.68,1,weights[4]);
      positions[v]=source[j]*inset;
      positions[v+1]=source[j+1]*inset;
      positions[v+2]=source[j+2]*inset;
    }
    geometry.attributes.position.needsUpdate=true;
    light.uniforms.time.value=time;halo.uniforms.time.value=time;
    light.uniforms.accents.value.copy(accents);halo.uniforms.accents.value.copy(accents);
  }};
}

function createKnowledgeSeed(root) {
  const group = new THREE.Group();
  group.position.set(-6.25,-2.6,0);
  root.add(group);
  const geometry = new THREE.OctahedronGeometry(.25,0);
  const material = new THREE.MeshPhysicalMaterial({color:'#5998c4',metalness:.54,roughness:.28,clearcoat:.55,transparent:true,opacity:.24,depthWrite:false,emissive:'#286789',emissiveIntensity:.3});
  const mesh = new THREE.InstancedMesh(geometry,material,4);
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(.2,.4,Math.PI / 4));
  const position = new THREE.Vector3(), scale = new THREE.Vector3(1,1,1);
  for(let i = 0; i < 4; i++) {
    position.set((i % 2 - .5) * .46,Math.floor(i / 2) * .4,Math.sin(i * 2.4) * .16);
    matrix.compose(position,rotation,scale);
    mesh.setMatrixAt(i,matrix);
  }
  group.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:'#96c6e8',transparent:true,opacity:.17,depthWrite:false}));
  edges.position.set(0,.55,0);group.add(edges);
  return {update(time){group.position.y = -2.6 + Math.sin(time * .24) * .045;group.rotation.y = Math.sin(time * .08) * .12;}};
}

export function createIntelligenceFlow(quality) {
  const detail = modelDetail('analytics',quality);
  const root = new THREE.Group();
  root.name = 'continuous-intelligence-flow';
  root.userData.qualityModel = 'analytics';
  const laneCount = Math.min(24,Math.max(18,Math.round(detail.segment(20) / 6) * 6));
  const samples = detail.segment(112);
  const vertexCount = laneCount * samples;
  const positions = new Float32Array(vertexCount * 3);
  const paths = new Float32Array(vertexCount * 2);
  const focuses = new Float32Array(vertexCount * 4);
  const targets = Array.from({length:6},() => new Float32Array(vertexCount * 3));
  const indices = [];
  const p = new THREE.Vector3();
  for(let lane = 0; lane < laneCount; lane++) for(let i = 0; i < samples; i++) {
    const n = lane * samples + i, t = i / (samples - 1);
    paths.set([t,lane / laneCount],n * 2);
    const clustered = lane % 3 === 1 && Math.floor(lane / 3) % 3 !== 0;
    focuses.set([clustered ? .82 : 0,lane % 3 === 2 ? .92 : 0,lane % 3 === 0 && t > .75 ? .6 : 0,lane % 9 === 0 ? .35 : 0],n * 4);
    for(let stage = 0; stage < 6; stage++) {
      strandTarget(stage,lane,laneCount,t,p);
      targets[stage].set([p.x,p.y,p.z],n * 3);
    }
    if(i < samples - 1) indices.push(n,n + 1);
  }
  positions.set(targets[0]);
  const positionAttribute = new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',positionAttribute);
  geometry.setAttribute('flowPath',new THREE.BufferAttribute(paths,2));
  geometry.setAttribute('focus',new THREE.BufferAttribute(focuses,4));
  geometry.setIndex(indices);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(),13);
  const lineMaterial = filamentShader();
  const lines = new THREE.LineSegments(geometry,lineMaterial);
  root.add(lines);
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.attributes = geometry.attributes;
  pointGeometry.boundingSphere = geometry.boundingSphere;
  const pointMaterial = pointShader(93);
  root.add(new THREE.Points(pointGeometry,pointMaterial));
  const silverThreads = createSilverThreads(root,laneCount,samples,positions);
  const silk = createSilkSurfaces(root,laneCount,samples,positions);
  const flowMaterials = [lineMaterial,pointMaterial];

  // Small physical data fragments give the filaments depth, reflection and a
  // tangible material scale. They follow the same target samples in every form.
  const count = 24;
  const fragmentMaterial = new THREE.MeshPhysicalMaterial({color:'#63b1df',metalness:.32,roughness:.17,clearcoat:1,transparent:true,opacity:.55,depthWrite:false,emissive:'#174d71',emissiveIntensity:.4});
  const fragmentGeometry = new THREE.IcosahedronGeometry(.36,0);
  const fragments = new THREE.InstancedMesh(fragmentGeometry,fragmentMaterial,count);
  fragments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  fragments.frustumCulled = false;
  root.add(fragments);
  const fragmentIndices = Array.from({length:count},(_,i) => (Math.floor(fract(i * .61803398875) * laneCount) * samples + Math.floor((.12 + fract(i * .754877666) * .76) * (samples - 1))) * 3);
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion(), euler = new THREE.Euler(), scale = new THREE.Vector3();
  const coreSignals = createCoreSignals(root,laneCount,samples,positions);
  const seed = createKnowledgeSeed(root);
  const hero = createIntelligenceHero(quality);
  root.add(hero.root);
  const returning = createReturnStream(root,detail);
  const accents = new THREE.Vector4();
  const normalized = new Float32Array(6);
  let disposed = false;
  function update({time = 0,weights = [1,0,0,0,0,0]} = {}) {
    if(disposed) return;
    let total = 0;
    for(let s = 0; s < 6; s++) {normalized[s] = Math.max(0,Number.isFinite(weights[s]) ? weights[s] : 0);total += normalized[s];}
    if(total <= 0) {normalized[0] = 1;total = 1;}
    for(let s = 0; s < 6; s++) normalized[s] /= total;
    accents.set(normalized[2],normalized[3],normalized[4],normalized[5]);
    // Only the weave breathes appreciably. Lattices and product profiles stay
    // crisp enough to recognize rather than wobbling like simulated liquid.
    const breathing = .012 + normalized[1] * .065 + normalized[2] * .025;
    for(let n = 0; n < vertexCount; n++) {
      const j = n * 3;
      let x = 0,y = 0,z = 0;
      for(let s = 0; s < 6; s++) if(normalized[s] > 0) {
        x += targets[s][j] * normalized[s];
        y += targets[s][j + 1] * normalized[s];
        z += targets[s][j + 2] * normalized[s];
      }
      const t = paths[n * 2], lane = paths[n * 2 + 1];
      positions[j] = x;
      positions[j + 1] = y + Math.sin(time * .35 + t * TAU + lane * TAU) * breathing;
      positions[j + 2] = z + Math.cos(time * .26 + t * TAU + lane * TAU * 2) * breathing;
    }
    positionAttribute.needsUpdate = true;
    silverThreads.update();
    silk.update(normalized);
    for(const material of flowMaterials) {
      material.uniforms.time.value = time;
      material.uniforms.accents.value.copy(accents);
    }
    const fragmentScale = .1 + normalized[0] * 1.65 + normalized[5] * 1.15;
    fragmentMaterial.opacity = .025 + normalized[0] * .56 + normalized[5] * .42;
    for(let i = 0; i < count; i++) {
      const j = fragmentIndices[i];
      p.set(positions[j],positions[j + 1],positions[j + 2]);
      euler.set(Math.sin(i * 1.7 + time * .1) * .2,.24 + Math.sin(time * .09 + i) * .22,Math.sin(i * 2.1) * .13);
      rotation.setFromEuler(euler);
      const size = fragmentScale * (.65 + fract(i * .37) * .65);
      scale.set(size,size,size);
      matrix.compose(p,rotation,scale);
      fragments.setMatrixAt(i,matrix);
    }
    fragments.instanceMatrix.needsUpdate = true;
    seed.update(time);
    returning.update(time,accents);
    coreSignals.update(time,normalized,accents);
    hero.update(time,normalized);
  }
  update();
  return {root,update,dispose(){
    if(disposed) return;
    disposed = true;
    const geometries = new Set(), materials = new Set();
    root.traverse(object => {
      if(object.geometry) geometries.add(object.geometry);
      for(const material of Array.isArray(object.material) ? object.material : [object.material]) if(material) materials.add(material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
  }};
}
