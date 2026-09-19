import * as THREE from 'three';
import {categoryWorld} from './categoryWorld.js';
import {intelligenceWorld} from './intelligenceWorld.js';
import {supplyWorld} from './supplyWorld.js';
import {brandsWorld} from './brandWorld.js';
import {companyMountainWorld} from './companyMountainWorld.js';

export function createImpactWorlds(manager,quality,brands,pmrem,atmosphere){return [companyMountainWorld(manager,quality,pmrem,atmosphere),supplyWorld(manager,quality),brandsWorld(manager,quality,brands),categoryWorld(quality,manager),intelligenceWorld(quality,manager)];}
export function disposeTree(root){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
