import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import mark from '../media/brand-mountain.json';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const outline = points => {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath(); return shape;
};

// Split triangles at the ridge before folding, so a triangle crossing the
// centre cannot turn the lower face into an unintended diagonal facet.
function foldAtRidge(geometry) {
  const positions = [], uvs = [], groups = [];
  const p = geometry.attributes.position, uv = geometry.attributes.uv;
  const clip = (polygon, side) => {
    const output = [];
    polygon.forEach((a, i) => {
      const b = polygon[(i + 1) % polygon.length], inA = side * a[0] >= 0, inB = side * b[0] >= 0;
      if (inA) output.push(a);
      if (inA !== inB) { const t = a[0] / (a[0] - b[0]); output.push(a.map((value, j) => value + (b[j] - value) * t)); }
    });
    return output;
  };
  for (const group of geometry.groups) {
    const start = positions.length / 3;
    for (let i = group.start; i < group.start + group.count; i += 3) {
      const triangle = [i, i + 1, i + 2].map(j => [p.getX(j), p.getY(j), p.getZ(j), uv.getX(j), uv.getY(j)]);
      for (const side of [-1, 1]) {
        const polygon = clip(triangle, side);
        for (let j = 1; j < polygon.length - 1; j++) for (const point of [polygon[0], polygon[j], polygon[j + 1]]) {
          positions.push(point[0], point[1], point[2] + Math.max(0, 1 - Math.abs(point[0]) / 25.55) * 2.3);
          uvs.push(.334 + (point[0] + 25.55) / 51.1 * .503, .353 + point[1] / 20.928 * .387);
        }
      }
    }
    groups.push({start, count: positions.length / 3 - start, materialIndex: group.materialIndex});
  }
  const folded = new THREE.BufferGeometry();
  folded.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  folded.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  folded.groups = groups; folded.computeVertexNormals(); geometry.dispose(); return folded;
}

// Both exterior and negative space use the original vector mark without
// changing their relative scale or position. The solid, lights and water are
// real geometry. The approved artwork supplies optical surface detail and the
// distant sea/sky; it never supplies the logo silhouette or its reflection.
export function companyMountainWorld(manager, quality, pmrem, atmosphere) {
  const root = new THREE.Group(); root.name = 'original-brand-crystal';
  const crystal = new THREE.Group(); crystal.name = 'crystal-brand-symbol'; root.add(crystal);
  const detail = modelDetail('monument', quality);
  const loader = new THREE.TextureLoader(manager);
  const optics = loader.load('/media/home/logo-approved-surface.png');
  optics.colorSpace = THREE.SRGBColorSpace;
  const plateUniforms = atmosphere.uniforms, plateColorGLSL = atmosphere.sampleGLSL;
  const lightingStudio = new THREE.Scene(); lightingStudio.background = new THREE.Color('#0b2449');
  const panel = (color, intensity, width, height, position, rotation = [0, 0, 0]) => {
    const material = new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.position.set(...position); mesh.rotation.set(...rotation); lightingStudio.add(mesh);
  };
  panel('#b9d1de', 1.4, 4, 30, [-9, 8, 22]);
  panel('#ffddb2', 2, 2, 24, [16, 3, 20], [0, -.25, 0]);
  panel('#799eaf', 1.4, 42, 28, [0, 22, 0], [-Math.PI / 2, 0, 0]);
  panel('#557f95', 1.2, 36, 20, [-18, 10, -15], [0, .5, 0]);
  const pavilionEnvironment = pmrem.fromScene(lightingStudio, .035);
  lightingStudio.traverse(object => { if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); } });
  // Keep the selected artwork's internal depth and light gradients. Uniform
  // diffuse tint erased those layers; only a small amount of real transmission
  // is needed here, with restrained dielectric reflections at the bevel.
  const glass = new THREE.MeshPhysicalMaterial({map: optics, color: '#ffffff', metalness: 0,
    roughness: .2, transmission: .12, thickness: 2.9, ior: 1.38,
    clearcoat: .36, clearcoatRoughness: .18, envMapIntensity: .24,
    specularIntensity: .45, emissiveMap: optics, emissive: '#ffffff', emissiveIntensity: .48, fog: false});
  const edgeGlass = new THREE.MeshPhysicalMaterial({color: '#739cb9', metalness: 0,
    roughness: .24, transmission: .16, thickness: 3.8, ior: 1.4,
    clearcoat: .3, clearcoatRoughness: .2, envMapIntensity: .45,
    specularIntensity: .55, fog: false});
  glass.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 glassPoint;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nglassPoint=position;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 glassPoint;
          vec3 coastalOptics(vec3 rgb){
            float luminance=dot(rgb,vec3(.2126,.7152,.0722));
            float sunset=smoothstep(.38,.98,(glassPoint.x+25.55)/51.1);
            vec3 body=mix(rgb,vec3(luminance),.09)*vec3(1.1,1.08,.86);
            return body+vec3(.14,.052,.012)*sunset*sqrt(luminance);
          }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          diffuseColor.rgb=coastalOptics(diffuseColor.rgb);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance=coastalOptics(totalEmissiveRadiance);`);
  };
  glass.customProgramCacheKey = () => 'coastal-layered-optics-v1';
  const add = (geometry, material, position = [0, 0, 0], parent = crystal) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position);
    mesh.castShadow = !material.isMeshBasicMaterial; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const extrude = (shape, depth, bevel = .075) => new THREE.ExtrudeGeometry(shape,
    {depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: detail.segment(3, 'bevel'), steps: 1});


  const outer = mark.outer.slice(0, -1).map(([x, y]) => [(x - 302.1) * .12, (174.4 - y) * .12]);
  const aperture = mark.cutout.slice(0, -1).map(([x, y]) => [(x - 302.1) * .12, (174.4 - y) * .12]);
  const facade = outline(outer);
  facade.holes.push(new THREE.Path(outline(aperture).getPoints()));
  const frontGeometry = foldAtRidge(extrude(facade, 2.9, .26));
  const front = add(frontGeometry, [glass, edgeGlass], [0, .08, 3.5]); front.name = 'original-logo-solid';
  const frontZ = x => 6.79 + Math.max(0, 1 - Math.abs(x) / 25.55) * 2.3;

  const sunsetEdge = new THREE.PointLight('#ffd7a7', 480, 65, 2);
  sunsetEdge.position.set(24, 16, 12); crystal.add(sunsetEdge);

  const flowUniforms = {time: {value: 0}, pulse: {value: 4}, response: {value: 0},
    origin: {value: V(0, 3, 7)}, reduced: {value: 0}};
  const flowMaterial = (color, phase, halo = false) => new THREE.ShaderMaterial({
    uniforms: {...flowUniforms, tint: {value: new THREE.Color(color)}, phase: {value: phase}, direction: {value: phase > 0 ? -1 : 1}, halo: {value: halo ? 1 : 0}},
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying float along; varying vec3 world;
      void main(){along=uv.x;world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,
    fragmentShader: `uniform float time,pulse,response,reduced,phase,direction,halo; uniform vec3 tint,origin;
      varying float along; varying vec3 world;
      void main(){float head=fract(time*.055*direction+phase);
        float behind=fract((head-along)*direction+1.);
        float headDistance=min(behind,1.-behind);
        float tip=exp(-pow(headDistance/.013,2.));
        float trail=exp(-behind*25.);
        float ring=exp(-pow((distance(world,origin)-pulse*13.)/2.8,2.))*exp(-pulse*.9);
        float power=.02+(1.-reduced)*(tip*3.5+trail*1.4+ring*3.+response*.25);
        gl_FragColor=vec4(tint*power,halo>.5?.11:.72);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const flowingStrip = (points, color, phase, radius = .024) => {
    const curve = new THREE.CurvePath();
    points.slice(1).forEach((point, i) => curve.add(new THREE.LineCurve3(V(...points[i]), V(...point))));
    add(new THREE.TubeGeometry(curve, detail.segment(150), radius, 6, false), flowMaterial(color, phase));
    add(new THREE.TubeGeometry(curve, detail.segment(150), radius * 4, 6, false), flowMaterial(color, phase, true));
  };
  flowingStrip([outer[1], outer[0], outer[2], [0,0], outer[1]].map(([x, y]) => [x, y + .12, frontZ(x)]), '#dce9ed', 0, .042);
  const aperturePath = [...aperture, aperture[0]].map(([x, y]) => [x, y + .08, frontZ(x) + .01]);
  flowingStrip(aperturePath, '#dce3df', .46, .035);
  const touchLight = new THREE.PointLight('#cbdfe5', 0, 18, 2); root.add(touchLight);

  const reflectionSize = quality.render.shadowMapSize;
  const surface = new Reflector(new THREE.PlaneGeometry(620, 620),
    {clipBias: .003, textureWidth: reflectionSize, textureHeight: reflectionSize, multisample: 0});
  surface.rotation.x = -Math.PI / 2; surface.position.y = -.13;
  surface.name = 'live-ocean-reflection'; root.add(surface);
  // Write transparent black behind the object in the reflection pass, then
  // composite its actual mirrored silhouette over the clean ocean plate.
  const reflect = surface.onBeforeRender;
  surface.onBeforeRender = function (...args) {
    plateUniforms.reflectionPass.value = 1;
    try { reflect.apply(this, args); } finally { plateUniforms.reflectionPass.value = 0; }
  };
  Object.assign(surface.material.uniforms, {...plateUniforms,
    waterTime: {value: 0}, waveEnabled: {value: 1}, touchOrigin: {value: new THREE.Vector2(0, 12)}, pulse: flowUniforms.pulse});
  surface.material.vertexShader = `uniform mat4 textureMatrix;varying vec4 vUv,screenPosition;varying vec3 surfaceWorld;
    void main(){vUv=textureMatrix*vec4(position,1.);surfaceWorld=(modelMatrix*vec4(position,1.)).xyz;
      screenPosition=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=screenPosition;}`;
  surface.material.fragmentShader = `uniform sampler2D tDiffuse;uniform vec2 touchOrigin;
    uniform float waterTime,waveEnabled,pulse;varying vec4 vUv,screenPosition;varying vec3 surfaceWorld; ${plateColorGLSL}
    void main(){vec2 screenUv=screenPosition.xy/screenPosition.w*.5+.5;
      vec2 imageUv=tideImageUv(screenUv);
      if(imageUv.y>.46)discard;
      vec2 p=surfaceWorld.xz;
      float wave=sin(p.x*.85+waterTime*.65+sin(p.y*.25))*sin(p.y*3.5-waterTime*.85)
        +.42*sin(p.x*1.4-p.y*6.8+waterTime*.6)+.2*sin(p.y*13.+p.x*2.+waterTime*.9);
      float distanceToTouch=distance(p,touchOrigin);
      float touchWave=sin(distanceToTouch*3.1-pulse*11.)*exp(-pow((distanceToTouch-pulse*9.)/3.2,2.))*exp(-pulse);
      float nearWater=smoothstep(.46,.05,imageUv.y);
      vec3 tide=tideMotion(imageUv);
      vec2 disturbance=(vec2(wave*.014,(wave+touchWave)*.004)+tide.xy*1.5)*waveEnabled;
      vec2 reflected=vUv.xy/vUv.w+disturbance*(.4+nearWater*1.6);
      vec4 reflectedColor=texture2D(tDiffuse,reflected)*.5;
      reflectedColor+=texture2D(tDiffuse,reflected+vec2(.0012,.0024))*.25;
      reflectedColor+=texture2D(tDiffuse,reflected-vec2(.0012,.0024))*.25;
      vec3 ocean=tideColor(screenUv);
      float reflectionStrength=smoothstep(.46,.36,imageUv.y)*mix(.9,.12,nearWater);
      reflectionStrength*=.55+.45*pow(.5+.5*sin(p.y*5.8+sin(p.x*.6)+waterTime*.7),2.);
      vec3 result=mix(ocean,reflectedColor.rgb*vec3(.65,.8,.97),reflectedColor.a*reflectionStrength);
      result+=ocean*pow(clamp(wave*.45+.45,0.,1.),12.)*.06*waveEnabled;
      gl_FragColor=vec4(result,1.);
    }`;

  let pulseAge = 4, response = 0, lastImpulse = 0;
  const pointerCamera = new THREE.PerspectiveCamera(46, 16 / 9, .1, 480), raycaster = new THREE.Raycaster();
  const facadePlane = new THREE.Plane(V(0, 0, 1), -7), waterPlane = new THREE.Plane(V(0, 1, 0), .13);
  const hit = new THREE.Vector3();
  return {
    root, environment: pavilionEnvironment.texture,
    prepare() { crystal.visible = true; },
    update({time = 0, camera, target, aspect = 16 / 9, homePointer = [0, 0], homeCursor = [.507, .65],
      homeTouch = false, homeImpulse = 0, homeImmediate = false, homeSuspended = false, dt = 0}) {
      if (homeSuspended) dt = 0;
      const moving = !homeImmediate, fit = Math.max(1, 1.64 / aspect);
      camera.set(-9.1 + (moving ? homePointer[0] * .72 + Math.sin(time * .13) * .14 : 0),
        7.0 + (moving ? homePointer[1] * .25 : 0), 78 * fit);
      target.set(-9.1, 7.0, 0);
      pointerCamera.aspect = aspect; pointerCamera.position.copy(camera); pointerCamera.lookAt(target);
      pointerCamera.updateProjectionMatrix(); pointerCamera.updateMatrixWorld();
      raycaster.setFromCamera(new THREE.Vector2(homeCursor[0] * 2 - 1, 1 - homeCursor[1] * 2), pointerCamera);
      if (raycaster.ray.intersectPlane(facadePlane, hit)) { touchLight.position.copy(hit).add(V(0, 0, 3)); }
      if (homeImpulse !== lastImpulse) {
        lastImpulse = homeImpulse; pulseAge = 0; flowUniforms.origin.value.copy(hit);
        if (raycaster.ray.intersectPlane(waterPlane, hit)) surface.material.uniforms.touchOrigin.value.set(hit.x, hit.z);
      }
      pulseAge = homeImmediate ? 4 : Math.min(4, pulseAge + dt);
      response = homeImmediate ? 0 : THREE.MathUtils.damp(response, homeTouch ? 1 : 0, 5.5, dt);
      flowUniforms.time.value = time; flowUniforms.pulse.value = pulseAge;
      flowUniforms.response.value = response; flowUniforms.reduced.value = homeImmediate ? 1 : 0;
      surface.material.uniforms.waterTime.value = time; surface.material.uniforms.waveEnabled.value = moving ? 1 : 0;
      touchLight.intensity = response * 90;
      root.userData.logoStyle = 'crystal';
      root.userData.lightResponse = response; root.userData.lightPulse = pulseAge;
    },
    isMoving() { return pulseAge < 4 || response > .001; },
    reset() { pulseAge = 4; response = 0; },
    dispose() { surface.getRenderTarget().dispose(); optics.dispose(); pavilionEnvironment.dispose(); },
  };
}
