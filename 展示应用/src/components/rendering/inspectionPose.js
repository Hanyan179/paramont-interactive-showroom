// A content selection owns its presentation angle. Exploration never overwrites
// that angle or the visitor's separate overview orbit.
export const nearestAngle=(current,target)=>current+Math.atan2(Math.sin(target-current),Math.cos(target-current));
export function homeInspection(chapter,selection,focus){
  if(chapter===0)return focus===null?null:{key:`overview:${focus}`,yaw:[.28,.28,.10,.25][focus]??.28,tilt:0};
  if(chapter===4)return null;
  const {capability=0,company=0,year=0,detail=null}=selection;
  const network=chapter===2||chapter===1&&capability===0;
  const selected=chapter===2?company:detail;
  const yaw=network?(selected===null?-.28:-.12-selected*Math.PI/2):chapter===3?-.30:[-.28,-.36,-.10,-.24][capability];
  return {key:chapter===1?`capability:${capability}:${detail}`:chapter===2?`company:${company}`:`history:${year}`,yaw,tilt:0};
}
export function createInspectionPose(){
  let key=null,request=-1,current={yaw:0,tilt:0},target={...current};
  return {
    update(preset,revision,dt,reduced=false,seed){
      if(!preset){key=null;return {...current};}
      if(key!==preset.key||revision!==request){
        if(key===null&&seed)current={...seed};
        key=preset.key;request=revision;target={yaw:nearestAngle(current.yaw,preset.yaw),tilt:preset.tilt};
      }
      const k=reduced?1:1-Math.exp(-Math.max(0,dt)*4.5);
      current.yaw+=(target.yaw-current.yaw)*k;current.tilt+=(target.tilt-current.tilt)*k;
      if(Math.abs(current.yaw-target.yaw)+Math.abs(current.tilt-target.tilt)<.0001)current={...target};
      return {...current};
    },
    drag(dx,dy,width,height){target.yaw+=dx/width*Math.PI*1.6;target.tilt=Math.max(-.38,Math.min(.65,target.tilt+dy/height*.9));},
    snapshot:()=>({key,request,current:{...current},target:{...target}}),
    restore(value){({key,request}=value);current={...value.current};target={...value.target};},
  };
}
