import * as T from 'three';
import type {Game} from './Game';
import {lineOfSight} from '../world/layout';
import {mesh} from '../world/World';
export const katanaDamage=240;
export const katanaReach=5.2;
export function inSlash(px:number,pz:number,ex:number,ez:number,radius:number){return Math.hypot(ex-px,ez-pz)<katanaReach+radius;}
export function slash(g:Game){if(g.time<g.shotTime)return;g.shotTime=g.time+.48;g.input.tapAim=null;g.recoil=.13;g.sound.effect(620);g.sound.effect(1350);for(const e of g.enemies)if(e.alive&&(e.kind!=='KING PUNI'||g.gate)&&(e.kind!=='SAMURAI'||e.alert)&&inSlash(g.position.x,g.position.z,e.group.position.x,e.group.position.z,e.radius*e.baseScale)&&lineOfSight(g.position.x,g.position.z,e.group.position.x,e.group.position.z,g.gate)){g.damage(e,katanaDamage*(g.buffs.has('RAINBOW')?1.6:1));e.stunned=g.time+.3;g.burst(e.group.position.clone().add(new T.Vector3(0,e.baseScale,0)),0x99ffee);}
 const ring=mesh(new T.TorusGeometry(1,.045,6,48),0xa6fff1,g.position.x,.9,g.position.z);ring.rotation.x=-Math.PI/2;g.scene.add(ring);g.shockwaves.push({m:ring,r:1,hit:true});g.notify('カタナ！ まわりを なぎはらう！');}
