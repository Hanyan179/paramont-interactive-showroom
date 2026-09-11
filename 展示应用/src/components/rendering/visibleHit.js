// Raycaster includes invisible objects. Scene transitions keep old shapes mounted,
// so reject hits anywhere under a hidden ancestor before resolving an action.
export function firstVisibleHit(hits){
 return hits.find(({object})=>{for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;});
}
