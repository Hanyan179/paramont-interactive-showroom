export function advanceMediaJourney(progress,phase,dt,reduced=false){
  const target=phase==='approaching'||phase==='open'?1:0;
  if(reduced)return target;
  const step=Math.max(0,dt)/(target?1.65:1.35);
  return target?Math.min(1,progress+step):Math.max(0,progress-step);
}
export const mediaJourneyEase=t=>t*t*t*(t*(t*6-15)+10);
