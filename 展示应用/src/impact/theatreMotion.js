// A visitor can hold a chapter/camera without stopping the world inside it.
export function theatreMotion({loaded=true,playing=true,suspended=false,held=false,touring=true,depth=false,movingReel=false}){
  const animate=loaded&&playing&&!suspended;
  return {animate,advanceTour:animate&&touring&&!held&&!depth&&!movingReel};
}
