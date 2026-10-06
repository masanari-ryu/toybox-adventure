import * as T from 'three';
import {stages} from '../stages/Stages';
import type {GraphicsTier} from './GraphicsQuality';
/** Three authored pools guide the eye without adding collision or progression. */
export class SceneLighting{
 group=new T.Group();spots:T.SpotLight[]=[];stage=-1;
 points:T.PointLight[]=[];private sources:{position:T.Vector3;color:T.Color;intensity:number;distance:number;decay:number}[]=[];
 constructor(scene:T.Scene,tier:GraphicsTier='medium'){scene.add(this.group);for(let n=0;n<3;n++){const light=new T.SpotLight(0xffdfb4,0,32,Math.PI*.36,.75,1.4);light.target=new T.Object3D();light.visible=tier!=='low'||n===2;this.spots.push(light);this.group.add(light,light.target);}for(let n=0;n<(tier==='low'?2:3);n++){const light=new T.PointLight(0xffffff,0);this.points.push(light);this.group.add(light);}}
 setSources(world:T.Object3D){this.sources=[];world.updateMatrixWorld(true);world.traverse(o=>{if(o instanceof T.PointLight){this.sources.push({position:o.getWorldPosition(new T.Vector3()),color:o.color.clone(),intensity:o.intensity,distance:o.distance,decay:o.decay});o.visible=false;}});}
 /** Fixed light counts prevent shader recompilation when moving between rooms. */
 update(stage:number,position:T.Vector3,tier:GraphicsTier,visible:boolean){this.group.visible=true;const s=stages[stage],locations=[[s.start[0]+10,0,s.start[1]-3],[s.exit[0],stage===2?12:0,s.exit[1]],[s.boss.x,stage===2?12:0,s.boss.z]];for(let n=0;n<3;n++){const [x,y,z]=locations[n],light=this.spots[n];light.position.set(x+(n===2?-5:2),y+10,z+3);light.target.position.set(x,y,z);light.color.set(n===2?stage===2?0xdfb4ff:0xffb5c1:stage===1?0xffdeb9:0xb6ffe2);light.intensity=visible&&light.position.distanceToSquared(position)<1225&&(tier!=='low'||n===2)?n===2?70:35:0;}
 this.sources.sort((a,b)=>a.position.distanceToSquared(position)-b.position.distanceToSquared(position));for(let n=0;n<this.points.length;n++){const light=this.points[n],source=this.sources[n];if(source){light.position.copy(source.position);light.color.copy(source.color);light.distance=source.distance;light.decay=source.decay;}light.intensity=visible&&source&&source.position.distanceToSquared(position)<576&&n<(tier==='low'?2:3)?source.intensity:0;}}
}
