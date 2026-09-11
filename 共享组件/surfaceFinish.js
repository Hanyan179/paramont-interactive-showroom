// Subtle roughness only: preserves authored colour, silhouette and interaction.
// Textures are owned by the model and collected by its existing disposal traversal.
export function createFinishTexture(T,detail,brushed=false) {
  const size=detail.textureSize,data=new Uint8Array(size*size*4);let seed=31;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    seed=(seed*16807)%2147483647;
    const grain=(seed%1000)/1000,stripe=.5+.5*Math.sin(y*2.17);
    const v=Math.round(255*(1-detail.surfaceStrength*(brushed?.7*stripe+.3*grain:grain)));
    data.set([v,v,v,255],(y*size+x)*4);
  }
  const texture=new T.DataTexture(data,size,size,T.RGBAFormat);
  texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
  texture.name=brushed?'subtle-brushed-finish':'subtle-satin-finish';
  texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,3);return texture;
}
export function applySurfaceFinish(T,root,detail) {
  if(!detail.surfaceDetail) return;
  const materials=new Set();root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]) if(m) materials.add(m);});
  let metal,satin;
  for(const m of materials) {
    if(!m.isMeshStandardMaterial||m.roughnessMap||m.transparent||m.transmission>0||m.roughness<.12)continue;
    m.roughnessMap=m.metalness>.45?(metal??=createFinishTexture(T,detail,true)):(satin??=createFinishTexture(T,detail));m.needsUpdate=true;
  }
}
