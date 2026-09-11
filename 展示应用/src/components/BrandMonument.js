import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import mark from '../media/brand-mountain.json';

// The original mountain silhouette becomes a hollow, bevelled exhibition object.
// Original logo assets stay intact; this is its spatial interpretation.
export function createBrandMonument(){
 const detail=modelDetail('monument');
 const group=new THREE.Group();group.name='paramont-mountain-monument';group.userData.qualityModel='monument';
 const points=coordinates=>coordinates.map(([x,y])=>new THREE.Vector2((x-302.1)*.0175,(174.4-y)*.024));
 const outline=new THREE.Shape(points(mark.outer)),hole=new THREE.Path(points(mark.cutout));outline.holes.push(hole);
 const face=new THREE.MeshPhysicalMaterial({color:'#668eae',metalness:.82,roughness:.27,clearcoat:.42,envMapIntensity:1.2});
 const side=new THREE.MeshPhysicalMaterial({color:'#153b64',metalness:.65,roughness:.25,clearcoat:.6});
 const geometry=new THREE.ExtrudeGeometry(outline,{depth:.85,bevelEnabled:true,bevelThickness:.075,bevelSize:.055,bevelSegments:detail.segment(4,'bevel'),curveSegments:detail.segment(18),steps:1});geometry.translate(0,.32,-.425);
 const sculpture=new THREE.Mesh(geometry,[face,side]);sculpture.castShadow=sculpture.receiveShadow=true;group.add(sculpture);
 const edgeMaterial=new THREE.MeshBasicMaterial({color:'#b3e2f2',transparent:true,opacity:.48});
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),edgeMaterial);group.add(edges);
 const glass=new THREE.MeshPhysicalMaterial({color:'#99c9e3',metalness:.15,roughness:.14,transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide,clearcoat:1});
 const inset=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(points(mark.cutout))),glass);inset.position.set(0,.32,-.06);group.add(inset);
 const base=new THREE.Mesh(new RoundedBoxGeometry(8.15,.22,2.3,detail.segment(4,'rounded'),.11),new THREE.MeshPhysicalMaterial({color:'#123252',metalness:.76,roughness:.3}));base.position.y=.12;base.receiveShadow=true;group.add(base);
 const seam=new THREE.Mesh(new RoundedBoxGeometry(7.8,.022,2.05,detail.segment(3,'rounded'),.05),new THREE.MeshBasicMaterial({color:'#6aa6c5',transparent:true,opacity:.5}));seam.position.y=.25;group.add(seam);
 applySurfaceFinish(THREE,group,detail);
 return {root:group,update(time,reduced){time*=detail.motionScale;edgeMaterial.opacity=reduced?.48:.42+Math.sin(time*.4)*.08;glass.opacity=reduced?.19:.18+Math.sin(time*.26)*.025;}};
}
