import * as T from 'three';
import type {Game} from './Game';
import {wall,lineOfSight} from '../world/layout';
export const thunderDamage=190;
export const thunderRange=52;
export function beamDistance(origin:T.Vector3,direction:T.Vector3,center:T.Vector3){const relative=center.clone().sub(origin),along=relative.dot(direction);return {along,distance:relative.addScaledVector(direction,-along).length()};}
export function thunderbolt(g:Game,direction:T.Vector3){let reach=thunderRange;for(let d=.5;d<=reach;d+=.25){const p=g.position.clone().addScaledVector(direction,d);if(wall(p.x,p.z,g.gate)){reach=d;break;}}
 const origin=g.position.clone(),end=origin.clone().addScaledVector(direction,reach);const muzzle=new T.Vector3(.42,-.3,-1.2).applyQuaternion(g.camera.quaternion).add(origin);g.lightning.add(g.scene,muzzle,end);g.sound.thunder();
 for(const e of g.enemies){if(!e.alive||e.kind==='KING PUNI'&&!g.gate||e.kind==='SAMURAI'&&!e.alert)continue;const center=e.group.position.clone().add(new T.Vector3(0,e.kind==='KING PUNI'?2.2*e.baseScale:e.baseScale,0)),hit=beamDistance(origin,direction,center);if(!lineOfSight(origin.x,origin.z,center.x,center.z,g.gate)||hit.along<0||hit.along>reach||hit.distance>e.radius*e.baseScale+.48+(g.input.touch?.3:0))continue;g.damage(e,thunderDamage*(g.arsenal.levels[2]?1.5:1)*(g.buffs.has('RAINBOW')?1.6:1));e.stunned=g.time+.35;g.burst(center,0x8debff);}
}
