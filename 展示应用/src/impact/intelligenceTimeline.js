// All channels are sampled from one deterministic, periodic clock.
export const JOURNEY_DURATION = 108;
export const stageStarts = Object.freeze([0, 18, 34, 50, 70, 90, 108]);
export const stageFrames = Object.freeze([16, 31, 47, 67, 85, 100]);
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ease = x => { const t=clamp01(x); return t*t*t*(t*(t*6-15)+10); };
export const ramp = (t,a,b) => ease((t-a)/(b-a));
export const lerp = (a,b,t) => a+(b-a)*t;
export const loopTime = t => ((Number.isFinite(t)?t:0)%108+108)%108;
export function journeyFrame(seconds) {
  const time=loopTime(seconds);
  const stage=stageStarts.findIndex((start,i)=>i<6&&time>=start&&time<stageStarts[i+1]);
  return {time,stage,progress:(time-stageStarts[stage])/(stageStarts[stage+1]-stageStarts[stage]),
    gather:ramp(time,7,17), crystal:ramp(time,25,33), project:ramp(time,36,39),
    zoom:ramp(time,50,55), spread:ramp(time,55,59), ring:ramp(time,59,66),
    choose:ramp(time,67,73), product:ramp(time,72,77), commerce:ramp(time,79,85),
    feedback:ramp(time,93,100), close:ramp(time,100,106)};
}
// A subdivided cube and an elongated octahedron share exactly the same topology.
export function crystalVertex(x,y,z,morph) {
  const sum=Math.abs(x)+Math.abs(y)+Math.abs(z)||1;
  const shoulder=1+.36*Math.abs(y/sum);
  return [lerp(x,x/sum*1.5*shoulder,morph),lerp(y,y/sum*2.1,morph),lerp(z,z/sum*1.1*shoulder,morph)];
}
