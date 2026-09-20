import confirmedBrands from '../../../共享数据/featured-brands.json' with {type:'json'};
import {proposalDirections} from './intelligenceResearch.js';

// Bounds measured on supplied originals remove empty margins, not the identity.
// Pairings are authored brand applications, not existing product-range claims.
const artwork={
 'kind-mind':{crop:[103,4,299,326]},
 'sugar-rush':{crop:[2,91,496,157]},
 'crafty-creations':{crop:[69,20,349,208],paper:true},
 'cozy-craftworks':{crop:[8,55,491,228]},
 scentos:{crop:[0,71,499,202]},
};
export const proposalBrands=proposalDirections.map(direction=>{
 const brand=confirmedBrands.brands.find(item=>item.id===direction.brandId);
 return {...brand,...artwork[brand.id]};
});
export const brandSurfaceRatio=640/192;

// One signature area preserves original colour and aspect ratio. A fine edge
// separates dark ink from navy; no glow/backplate. Keep a clean paper print too.
export function prepareBrandTexture(texture,brand){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=192;
 const c=canvas.getContext('2d'),[x,y,w,h]=brand.crop,scale=Math.min(624/w,176/h);
 c.drawImage(texture.image,x,y,w,h,(640-w*scale)/2,(192-h*scale)/2,w*scale,h*scale);
 if(brand.paper){
  const pixels=c.getImageData(0,0,640,192),data=pixels.data;
  // Same white-paper removal threshold as the existing brand gallery.
  for(let i=0;i<data.length;i+=4){const t=Math.max(0,Math.min(1,(Math.min(data[i],data[i+1],data[i+2])/255-.8)/.16));data[i+3]*=1-t*t*(3-2*t);}
  c.putImageData(pixels,0,0);
 }
 texture.userData.printImage=canvas;
 const edge=document.createElement('canvas');edge.width=640;edge.height=192;
 const e=edge.getContext('2d');
 for(let i=0;i<8;i++){const angle=i*Math.PI/4;e.drawImage(canvas,Math.cos(angle)*1.25,Math.sin(angle)*1.25);}
 e.globalCompositeOperation='source-in';e.fillStyle='#bdd3e2';e.fillRect(0,0,640,192);
 e.globalCompositeOperation='source-over';e.drawImage(canvas,0,0);
 texture.image=edge;texture.userData.brandId=brand.id;texture.needsUpdate=true;
}
