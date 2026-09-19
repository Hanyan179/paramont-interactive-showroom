import {feature,merge} from 'topojson-client';
import {geoArea,geoCentroid,geoContains,geoBounds,geoDistance} from 'd3-geo';
import topology from '../../public/data/world-50m.json' with {type:'json'};
import footprint from '../../public/data/business-footprint.json' with {type:'json'};
import {distributionRegions,footprintCountries} from './distributionContent.js';

export {footprint};
const land=feature(topology,topology.objects.countries);
export const footprintLand={...land,features:land.features.filter(country=>String(country.id)!=='010')};
export const footprintSilhouette=merge(topology,topology.objects.countries.geometries.filter(country=>String(country.id)!=='010'));
function interiorPoint(polygon){
  const center=geoCentroid(polygon);if(geoContains(polygon,center))return center;
  const [[west,south],[east,north]]=geoBounds(polygon);let best=null,distance=Infinity;
  for(let x=0;x<48;x++)for(let y=0;y<48;y++){
    const point=[west+(east-west)*(x+.5)/48,south+(north-south)*(y+.5)/48],d=geoDistance(center,point);
    if(d<distance&&geoContains(polygon,point)){best=point;distance=d;}
  }
  if(!best)throw new Error('No representative point inside country boundary');
  return best;
}
// Both projections use the same boundaries and country-level representative points.
// These points never claim the position of an individual customer or factory.
export const footprintGeography=footprint.countries.map(country=>{
  const shapes=footprintLand.features.filter(shape=>String(shape.id).padStart(3,'0')===country.mapId);
  const shape={type:'Feature',properties:{code:country.code},geometry:{type:'GeometryCollection',geometries:shapes.map(shape=>shape.geometry)}};
  const polygons=shapes.flatMap(shape=>shape.geometry.type==='MultiPolygon'?shape.geometry.coordinates.map(coordinates=>({type:'Polygon',coordinates})):[shape.geometry]);
  const largest=polygons.reduce((a,b)=>geoArea(a)>geoArea(b)?a:b);
  const region=distributionRegions.find(region=>region.countryCode===country.mapId);
  return {...country,shape,coordinate:region?.coordinate||interiorPoint(largest)};
});
export function visibleFootprint(layer){const codes=new Set(footprintCountries(footprint,layer).map(country=>country.code));return footprintGeography.filter(country=>codes.has(country.code));}
export function footprintAt(coordinate,layer){return visibleFootprint(layer).find(country=>geoContains(country.shape,coordinate))?.code||null;}
export const footprintColors={customers:'#68adbf',suppliers:'#c4a56c',both:'#a6c8be'};
