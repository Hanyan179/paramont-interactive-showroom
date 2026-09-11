// Local rooms retain their exhibit coordinates. Layout changes transform cameras
// and touch anchors through the same function, preventing displaced hit targets.
export const regionLayouts={
  china:[{position:[-10,0,3],yaw:-.12},{position:[0,1.5,-7],yaw:.12},{position:[10,.25,3.5],yaw:-.32}],
  cambodia:[{position:[-12,0,0],yaw:0},{position:[0,0,0],yaw:0},{position:[12,0,0],yaw:0}],
  usa:[{position:[-11,0,-4],yaw:.32},{position:[0,.38,3],yaw:0},{position:[11,0,-4],yaw:-.32}],
};
export function regionPoint(id,point){
  const index=Math.max(0,Math.min(2,Math.round(point[0]/12)+1)),layout=regionLayouts[id]?.[index];
  if(!layout)return [...point];
  const [x,y,z]=point,dx=x-(index-1)*12,c=Math.cos(layout.yaw),s=Math.sin(layout.yaw),p=layout.position;
  return [p[0]+dx*c+z*s,p[1]+y,p[2]-dx*s+z*c];
}
