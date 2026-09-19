import {geoEquirectangular,geoPath,geoGraticule10,geoTransform} from 'd3-geo';
import {footprintLand,footprintSilhouette,footprintGeography} from './footprintGeography.js';
import {distributionRegions} from './distributionContent.js';

// A single oblique plane, not a globe. Country paths, data points and scene
// entrances pass through this same camera so zoom and touch remain aligned.
export function mapLayout(width,height){
  const scale=Math.max(.78,width/1600);
  const projection=geoEquirectangular().rotate([-5,0]).fitExtent([[width*.035,-height*.04],[width*.965,height*1.04]],footprintLand);
  const projectPlane=([x,y])=>{
    const dy=y-height*.52,depth=1-dy/(height*3.8);
    return [width/2+(x-width/2)/depth,height*.50+dy*.88/depth];
  };
  const plane=geoTransform({point(x,y){this.stream.point(...projectPlane([x,y]));}});
  const path=geoPath({stream:stream=>projection.stream(plane.stream(stream))});
  const point=coordinate=>projectPlane(projection(coordinate));
  return {
    countries:footprintLand.features.map((country,index)=>({key:`land-${index}`,id:String(country.id).padStart(3,'0'),path:path(country)})),
    silhouette:path(footprintSilhouette),
    coveragePoints:footprintGeography.map(country=>({...country,center:point(country.coordinate)})),
    grid:path(geoGraticule10()),
    points:Object.fromEntries(distributionRegions.map(region=>[region.id,point(footprintGeography.find(country=>country.mapId===region.countryCode).coordinate)])),
    scale,
  };
}
