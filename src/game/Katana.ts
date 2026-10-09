import {murasameHealthCost,murasameBossDamage,bossDamageMultiplier} from './WeaponSettings';
import {attackPower} from './PowerEffects';
import * as T from 'three';
import type {Game} from './Game';
import {lineOfSight,sightAt} from '../world/layout';
import {mesh} from '../world/World';
export const katanaDamage=360;
export const katanaReach=5.2;
export function inSlash(px:number,pz:number,ex:number,ez:number,radius:number){return Math.hypot(ex-px,ez-pz)<katanaReach+radius;}
export function slash(g:Game){if(g.time<g.shotTime)return;if(g.arsenal.murasame){if(g.hp<=murasameHealthCost){g.notify('むらさめを ふるには たいりょくが たりない');return;}g.hp-=murasameHealthCost;}g.shotTime=g.time+.48;g.input.tapAim=null;g.recoil=.13;g.sound.effect(620);g.sound.effect(1350);for(const e of g.enemies)if(e.alive&&(e.kind!=='KING PUNI'||g.gate)&&(e.kind!=='SAMURAI'||e.alert)&&inSlash(g.position.x,g.position.z,e.group.position.x,e.group.position.z,e.radius*e.baseScale)&&Math.abs(g.position.y-1.65-e.floorY)<3&&sightAt(g.position.x,g.position.z,g.position.y,e.group.position.x,e.group.position.z,e.group.position.y+e.baseScale,g.gate)){g.damage(e,g.arsenal.murasame&&e.kind!=='KING PUNI'?e.hp+1:(g.arsenal.murasame?murasameBossDamage*bossDamageMultiplier:katanaDamage)*attackPower(g));e.stunned=g.time+.3;g.burst(e.group.position.clone().add(new T.Vector3(0,e.baseScale,0)),g.arsenal.murasame?0xc785ff:0x99ffee);}
 const ring=mesh(new T.TorusGeometry(1,.045,6,48),g.arsenal.murasame?0xb672ef:0xa6fff1,g.position.x,g.position.y-.75,g.position.z);ring.rotation.x=-Math.PI/2;g.scene.add(ring);g.shockwaves.push({m:ring,r:1,hit:true});g.notify(g.arsenal.murasame?'むらさめ！ まわりを なぎはらう！':'カタナ！ まわりを なぎはらう！');}
