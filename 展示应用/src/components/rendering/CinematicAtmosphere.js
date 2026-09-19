import * as THREE from 'three';
import {createSpaceAtmosphere} from '../../../../共享组件/spaceAtmosphere.js';
export const createCinematicAtmosphere=(scene,exposure)=>createSpaceAtmosphere(THREE,scene,{exposure});
