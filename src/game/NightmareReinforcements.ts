import * as T from 'three';
import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {canMoveAt,sightAt} from '../world/layout';
import {supportHeight} from '../world/CastleFloors';
import {toxic,lava} from '../world/Threats';
export const nightmareWaveInterval=18;
export const nightmareSpawnWarning=1.1;
export const nightmareWaveSize=(cycle:number)=>cycle%3+1;
type Spawn={enemy:Enemy;x:number;z:number;floor:number;marker:T.Mesh};
/** Reuse defeated regular actors: endless pressure without an ever-growing scene. */
export class NightmareReinforcements{
 nextAt=nightmareWaveInterval;cycle=0;pending:{at:number;spawns:Spawn[]}|null=null;
 reset(g:Game){if(this.pending)for(const s of this.pending.spawns)g.dispose(s.marker);this.pending=null;this.nextAt=nightmareWaveInterval;this.cycle=0;}
 private safe(g:Game,x:number,z:number,floor:number){
  if(Math.hypot(x-g.position.x,z-g.position.z)<6)return false;
  if(Math.abs(floor-(g.position.y-1.65))>.55)return false;
  if(![[0,0],[.75,0],[-.75,0],[0,.75],[0,-.75]].every(([dx,dz])=>canMoveAt(x+dx,z+dz,floor+1.65,g.gate)))return false;
  if(floor<1&&(toxic(x,z)||lava(x,z)))return false;
  if(g.enemies.some(e=>e.alive&&Math.abs(e.floorY-floor)<2&&Math.hypot(e.group.position.x-x,e.group.position.z-z)<3))return false;
  return sightAt(x,z,floor+1.65,g.position.x,g.position.z,g.position.y,g.gate);
 }
 update(g:Game){
  if(g.challenge!==3||g.practice||g.ride||g.state!=='playing'||g.mapOpen||g.orientationBlocked)return;
  if(this.pending){
   for(const s of this.pending.spawns)s.marker.scale.setScalar(1+Math.sin(g.time*8)*.12);
   if(g.stageTime<this.pending.at)return;
   const wave=this.pending;this.pending=null;let appeared=0;
   for(const s of wave.spawns){g.dispose(s.marker);if(s.enemy.alive||!this.safe(g,s.x,s.z,s.floor))continue;
    const e=s.enemy;e.alive=true;e.hp=e.maxHp;e.floorY=s.floor;e.lastPlayerFloor=g.position.y-1.65;e.home={x:s.x,z:s.z};
    e.group.position.set(s.x,s.floor,s.z);e.group.rotation.y=Math.atan2(s.x-g.position.x,s.z-g.position.z);e.group.scale.setScalar(e.baseScale);e.group.visible=e.body.visible=true;
    e.body.position.set(0,0,0);e.body.rotation.set(0,0,0);e.body.scale.setScalar(1);e.telegraph=e.stunned=e.dashUntil=0;e.dashHit=false;
    e.brain.reset();e.brain.hit(g.position.x,g.position.z,g.time);e.alert=true;e.state='Alert';e.cooldown=1.2;
    g.routes.delete(e);g.routeTimes.delete(e);g.burst(e.group.position.clone().add(new T.Vector3(0,1,0)),0xa9ffe2);appeared++;
   }
   if(appeared){g.sound.effect(430);g.notify('モンスターが あらわれた！');}else this.nextAt=g.stageTime+3;
   return;
  }
  if(g.stageTime<this.nextAt)return;
  this.nextAt=g.stageTime+nightmareWaveInterval;
  const available=g.enemies.filter(e=>!e.alive&&e.kind!=='KING PUNI'&&e.kind!=='SAMURAI'&&!g.defeat.entries.some(d=>d.enemy===e));
  if(!available.length)return;
  const count=Math.min(nightmareWaveSize(this.cycle),available.length),points:{x:number;z:number;floor:number}[]=[];
  for(let n=0;n<300&&points.length<count;n++){
   const angle=n*2.399963+this.cycle*1.137,r=8+n%8*1.3,x=g.position.x+Math.cos(angle)*r,z=g.position.z+Math.sin(angle)*r;
   const floor=g.stageIndex===2?supportHeight(x,z,g.position.y-1.65):0;
   if(!this.safe(g,x,z,floor)||points.some(p=>Math.hypot(p.x-x,p.z-z)<3))continue;points.push({x,z,floor});
  }
  if(!points.length){this.nextAt=g.stageTime+3;return;}
  const spawns=points.map((p,n)=>{const marker=new T.Mesh(new T.TorusGeometry(1,.06,6,24),new T.MeshBasicMaterial({color:0xafffde,transparent:true,opacity:.75,depthWrite:false}));marker.position.set(p.x,p.floor+.1,p.z);marker.rotation.x=-Math.PI/2;g.scene.add(marker);return {...p,enemy:available[(this.cycle+n)%available.length],marker};});
  this.pending={at:g.stageTime+nightmareSpawnWarning,spawns};this.cycle++;g.sound.effect(330);g.notify('モンスターが また あらわれる！');
 }
}
