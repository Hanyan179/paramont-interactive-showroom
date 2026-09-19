import * as THREE from 'three';
// A rounded diamond enclosure, with a conforming curved visor. All are real
// surfaces: the face can yaw independently and the rear seam reads in profile.
function enclosure(rx,ry,rz){
 const g=new THREE.SphereGeometry(1,64,48),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,rx*Math.sign(x)*Math.abs(x)**1.35,ry*Math.sign(y)*Math.abs(y)**1.35,rz*z);}
 g.computeVertexNormals();return g;
}
function visorGeometry(){
 const vertices=[],uv=[],indices=[],segments=64,rings=18;
 for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,k=r/rings,c=Math.cos(a),s=Math.sin(a);
  const x=1.20*Math.sign(c)*Math.sqrt(Math.abs(c))*k,y=.81*Math.sign(s)*Math.sqrt(Math.abs(s))*k+.12;
  const z=.22+.56*Math.sqrt(Math.max(.03,1-Math.abs(x/1.53)**(2/1.35)-Math.abs(y/2.02)**(2/1.35)))+.018;
  vertices.push(x,y,z);uv.push(i/segments,k);
  if(r<rings&&i<segments){const n=r*(segments+1)+i;indices.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createDecisionRobot(){
 const group=new THREE.Group();group.name='decision-robot-enclosure';
 const silver=()=>new THREE.MeshPhysicalMaterial({color:'#d8dde2',metalness:.72,roughness:.31,clearcoat:.35,clearcoatRoughness:.22,envMapIntensity:1.0,transparent:true,depthWrite:false});
 const rear=new THREE.Mesh(enclosure(1.49,1.98,.48),silver());rear.position.z=-.32;rear.name='robot-rear-shell';group.add(rear);
 const seam=new THREE.Mesh(enclosure(1.51,2,.34),new THREE.MeshPhysicalMaterial({color:'#111c28',metalness:.5,roughness:.28,transparent:true,depthWrite:false}));seam.position.z=-.13;seam.name='robot-graphite-seam';group.add(seam);
 const front=new THREE.Mesh(enclosure(1.53,2.02,.56),silver());front.position.z=.22;front.name='robot-pearl-shell';group.add(front);
 const visor=new THREE.Mesh(visorGeometry(),new THREE.MeshPhysicalMaterial({color:'#030b14',metalness:.2,roughness:.12,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:.65,transparent:true,depthWrite:false,side:THREE.DoubleSide}));visor.name='robot-curved-visor';visor.renderOrder=7;group.add(visor);
 const rimPoints=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2,c=Math.cos(a),s=Math.sin(a),x=1.20*Math.sign(c)*Math.sqrt(Math.abs(c)),y=.81*Math.sign(s)*Math.sqrt(Math.abs(s))+.12,z=.22+.56*Math.sqrt(Math.max(.03,1-Math.abs(x/1.53)**(2/1.35)-Math.abs(y/2.02)**(2/1.35)))+.023;rimPoints.push(new THREE.Vector3(x,y,z));}
 const bezel=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints),128,.014,8,false),new THREE.MeshPhysicalMaterial({color:'#8f9ba7',metalness:.75,roughness:.23,transparent:true,depthWrite:false}));bezel.name='robot-visor-bezel';bezel.renderOrder=8;group.add(bezel);
 const seamPoints=[];for(let i=0;i<=48;i++){const x=(i/48-.5)*1.6,y=1.18,z=.22+.56*Math.sqrt(Math.max(.02,1-Math.abs(x/1.53)**(2/1.35)-Math.abs(y/2.02)**(2/1.35)))+.006;seamPoints.push(new THREE.Vector3(x,y,z));}
 const capSeam=new THREE.Line(new THREE.BufferGeometry().setFromPoints(seamPoints),new THREE.LineBasicMaterial({color:'#687481',transparent:true,depthWrite:false}));capSeam.name='robot-cap-seam';capSeam.renderOrder=8;group.add(capSeam);
 return {group,front,rear,seam,visor};
}
