// Normalized screen layout shared by the flowing exhibits and touch targets.
export const brandFlowSpacing=.34;
export function brandFlowPose(index,count,offsets){
  const perRow=Math.ceil(count/2),row=index<perRow?0:1,column=index%perRow;
  const span=perRow*brandFlowSpacing;
  const x=((column*brandFlowSpacing+.16+offsets[row]+.2)%span+span)%span-.2;
  return {row,x,y:row===0?.405:.685,visible:x>-.19&&x<1.19};
}
