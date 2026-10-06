import * as T from 'three';
import {stages} from '../stages/Stages';
import type {GraphicsTier} from './GraphicsQuality';
/** Three authored pools guide the eye without adding collision or progression. */
export class SceneLighting{
 group=new T.Group();spots:T.SpotLight[]=[];stage=-1;
 constructor(scene:T.Scene){scene.add(this.group);for(let n=0;n<3;n++){const light=new T.SpotLight(0xffdfb4,0,32,Math.PI*.36,.75,1.4);light.target=new T.Object3D();this.spots.push(light);this.group.add(light,light.target);}}
 update(stage:number,position:T.Vector3,tier:GraphicsTier,visible:boolean){this.group.visible=visible;const s=stages[stage],locations=[[s.start[0]+10,0,s.start[1]-3],[s.exit[0],stage===2?12:0,s.exit[1]],[s.boss.x,stage===2?12:0,s.boss.z]];for(let n=0;n<3;n++){const [x,y,z]=locations[n],light=this.spots[n];light.position.set(x+(n===2?-5:2),y+10,z+3);light.target.position.set(x,y,z);light.color.set(n===2?stage===2?0xdfb4ff:0xffb5c1:stage===1?0xffdeb9:0xb6ffe2);light.intensity=n===2?70:35;light.visible=light.position.distanceTo(position)<35&&(tier!=='low'||n===2);}}
}
