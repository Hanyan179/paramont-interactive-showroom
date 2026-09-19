import * as THREE from 'three';

// Sample the actual brand face, including its negative space. Area weighting
// avoids concentrating stars in the many small triangles around the cutout.
export function sampleLogoFace(shape, count = 18000, seed = 731) {
  const face = new THREE.ShapeGeometry(shape), p = face.attributes.position;
  const indices = face.index.array, triangles = [];
  let area = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = new THREE.Vector2(p.getX(indices[i]), p.getY(indices[i]));
    const b = new THREE.Vector2(p.getX(indices[i + 1]), p.getY(indices[i + 1]));
    const c = new THREE.Vector2(p.getX(indices[i + 2]), p.getY(indices[i + 2]));
    area += Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    triangles.push({a, b, c, area});
  }
  face.dispose();
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const positions = new Float32Array(count * 3), seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const choice = random() * area;
    const triangle = triangles.find(t => t.area >= choice);
    const u = Math.sqrt(random()), v = random();
    const x = (1 - u) * triangle.a.x + u * (1 - v) * triangle.b.x + u * v * triangle.c.x;
    const y = (1 - u) * triangle.a.y + u * (1 - v) * triangle.b.y + u * v * triangle.c.y;
    positions.set([x, y + .08, 6.79 + Math.max(0, 1 - Math.abs(x) / 25.55) * 2.3 + (random() - .5) * 1.4], i * 3);
    seeds.set([random(), random(), random(), random()], i * 4);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
  geometry.computeBoundingSphere();
  // Intro and pointer response stay inside this generous culling boundary.
  geometry.boundingSphere.radius += 18;
  return geometry;
}

export function createStarlightLogo(shape, quality) {
  const root = new THREE.Group(); root.name = 'starlight-brand-symbol';
  const geometry = sampleLogoFace(shape, Math.round(10800 * quality.models.monument.geometry));
  const uniforms = {
    time: {value: 0}, formation: {value: 1}, motion: {value: 1}, pointScale: {value: 1},
    pointer: {value: new THREE.Vector3(0, -100, 7)}, response: {value: 0}, pulse: {value: 4},
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec4 seed;
      uniform float time, formation, motion, pointScale, response, pulse;
      uniform vec3 pointer;
      varying vec3 lightColor;
      varying float strength, brightStar;
      void main() {
        float phase=seed.x*6.2831853;
        float stream=time*.34+phase;
        vec3 drift=vec3(sin(stream+position.y*.42), cos(stream*.83+position.x*.23), sin(stream*.61+seed.y*8.));
        float loose=step(.92,seed.w)*pow(.5+.5*sin(stream*.71+seed.y*9.),5.);
        vec3 point=position+drift*(.12+loose*2.4)*motion;
        point.y+=loose*1.5*motion;
        vec3 origin=vec3(sin(phase)*14.,5.+seed.y*17.,cos(phase)*9.);
        point+=origin*(1.-formation);
        vec3 away=position-pointer;
        float influence=exp(-dot(away.xy,away.xy)/27.);
        point+=normalize(away+vec3(.001,.001,.1))*influence*response*2.5*motion;
        float distanceToTouch=length(away.xy);
        float ring=exp(-pow((distanceToTouch-pulse*12.)/2.4,2.))*exp(-pulse*1.1)*motion;
        point+=normalize(away+vec3(.01))*ring*.6;
        float ribbon=pow(.5+.5*sin(position.x*.19-position.y*.28-time*.7+sin(position.y*.31)),3.);
        float twinkle=.68+.32*sin(time*.75+phase+position.y*.24);
        strength=(.30+seed.z*seed.z*.52+ribbon*.7)*mix(1.,twinkle,motion)*mix(.12,1.,formation);
        strength+=ring*.55;
        lightColor=mix(vec3(.015,.23,.64),vec3(.17,.69,.94),seed.y*.68+ribbon*.22);
        float warm=smoothstep(12.,25.55,position.x)*(.10+.35*seed.y);
        lightColor=mix(lightColor,vec3(.85,.56,.24),warm);
        brightStar=step(.992,seed.z);
        vec4 view=modelViewMatrix*vec4(point,1.);
        gl_Position=projectionMatrix*view;
        gl_PointSize=clamp((1.8+seed.z*2.8+brightStar*3.)*pointScale*min(1.5,78./max(1.,-view.z)),1.,30.);
      }`,
    fragmentShader: `
      varying vec3 lightColor;
      varying float strength, brightStar;
      void main() {
        vec2 p=gl_PointCoord-.5;
        float r=dot(p,p);
        if(r>.25)discard;
        float core=exp(-r*44.);
        float glow=exp(-r*11.)*.22;
        float cross=(exp(-abs(p.x)*70.)+exp(-abs(p.y)*70.))*exp(-r*14.)*brightStar*.23;
        float alpha=(core+glow+cross)*strength*.90;
        gl_FragColor=vec4(lightColor*1.3,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const stars = new THREE.Points(geometry, material); stars.name = 'logo-starlight-particles';
  root.add(stars);
  let age = 3.2, wasActive = false, lastReform = 0, regroup = false;
  return {
    root,
    update({active, time, dt, animate, immediate, pixelHeight, pointer, response, pulse, reform}) {
      if (active && (!wasActive || reform !== lastReform)) {
        regroup = wasActive && reform !== lastReform;
        age = animate && !immediate ? 0 : 3.2;
      }
      wasActive = active; lastReform = reform;
      root.visible = active;
      if (!active) return;
      if (immediate) age = 3.2;
      else if (animate) age = Math.min(3.2, age + dt);
      const t = Math.min(1, Math.max(0, age - (regroup ? .65 : 0)) / 2.4);
      uniforms.formation.value = regroup && age < .65
        ? 1 - THREE.MathUtils.smoothstep(age, 0, .65)
        : 1 - Math.pow(1 - t, 3);
      uniforms.time.value = immediate ? 0 : time;
      uniforms.motion.value = immediate ? 0 : 1;
      uniforms.pointScale.value = Math.max(.6, pixelHeight / 720);
      uniforms.pointer.value.copy(pointer);
      uniforms.response.value = immediate ? 0 : response;
      uniforms.pulse.value = pulse;
      root.userData.formation = uniforms.formation.value;
    },
  };
}
