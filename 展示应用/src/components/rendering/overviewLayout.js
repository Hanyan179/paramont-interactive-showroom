// Four business exhibits share one orbit. Fixed distances survive whole-world
// rotation; focus hides the other exhibits while the camera moves closer.
export const overviewPositions=[[0,0,0],[6.8,.1,3.9],[-7.1,.3,3.4],[4.7,.55,-4.9]];
export function overviewVisibility(weights,index){return Math.max(0,1-weights.reduce((sum,v,i)=>sum+(i===index?0:v),0));}
