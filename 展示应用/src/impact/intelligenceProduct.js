import * as THREE from 'three';
// Print the original identity into the shared product surface once, so the lid,
// assembled kit, reflection and commerce image cannot drift during their handoff.
// Keep both source assets intact; the print sits in the clear upper-right paper area.
export function brandProductSurface(productTexture,brandTexture){
 const photo=productTexture.image,mark=brandTexture.userData.printImage;
 if(!photo?.width||!mark?.width)return false;
 const canvas=document.createElement('canvas');canvas.width=photo.width;canvas.height=photo.height;
 const context=canvas.getContext('2d');context.drawImage(photo,0,0);
 const width=210*photo.width/1254;
 context.drawImage(mark,790*photo.width/1254,163*photo.height/1254,width,width*mark.height/mark.width);
 productTexture.image=canvas;productTexture.needsUpdate=true;return true;
}
// The concept photograph is mapped onto its actual outline, not a rectangular
// billboard. All moving modules and the final product share these UV coordinates.
// Coordinates are measured on the 1254 px source; the original bitmap is preserved.
export function createProductGeometry(){
 const shape=new THREE.Shape(),p=(x,y)=>[x/1254-.5,.5-y/1254];
 const move=(x,y)=>shape.moveTo(...p(x,y)),line=(x,y)=>shape.lineTo(...p(x,y));
 const curve=(x,y,u,v)=>shape.quadraticCurveTo(...p(x,y),...p(u,v));
 move(224,79);line(1026,79);curve(1094,79,1091,145);
 line(1052,405);curve(1049,440,1020,454);curve(1045,457,1052,487);
 line(1070,1094);curve(1073,1158,1016,1158);line(244,1158);
 curve(187,1158,187,1097);line(211,493);curve(212,465,241,454);
 curve(208,449,202,415);line(162,148);curve(154,81,224,79);
 const geometry=new THREE.ShapeGeometry(shape,24),position=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<position.count;i++)uv.setXY(i,position.getX(i)+.5,position.getY(i)+.5);
 return geometry;
}
