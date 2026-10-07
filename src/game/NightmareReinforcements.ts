import * as T from 'three';
import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {canMoveAt,sightAt} from '../world/layout';
import {supportHeight} from '../world/CastleFloors';
import {toxic,lava} from '../world/Threats';
import {nightmareRoom} from './NightmareRooms';
export const nightmareWaveInterval=8;
export const nightmareSpawnWarning=1.4;
export const nightmareWaveSize=(cycle:number)=>2+Math.min(2,cycle);
type Spawn={enemy:Enemy;x:number;z:number;floor:number;marker:T.Mesh};
type Room={actors:Enemy[];wave:number;limit:number;cleared:boolean;nextAt:number;initial:number;elite?:Enemy};
/** Each encounter has a finite budget; retreat preserves progress and completed rooms stay safe. */
export class NightmareReinforcements{
 nextAt=nightmareWaveInterval;cycle=0;pending:{at:number;spawns:Spawn[];room:string}|null=null;rooms=new Map<string,Room>();private initialized=false;
 reset(g:Game){this.cancel(g);this.rooms.clear();this.initialized=false;this.nextAt=nightmareWaveInterval;this.cycle=0;}
 private cancel(g:Game){if(this.pending)for(const s of this.pending.spawns)g.dispose(s.marker);this.pending=null;}
 private initialize(g:Game){
  for(const e of g.enemies){const room=nightmareRoom(g.stageIndex,e.home.x,e.home.z,e.floorY);let state=this.rooms.get(room);if(!state){state={actors:[],wave:1,limit:g.stageIndex===0?2:3,cleared:false,nextAt:g.stageTime+nightmareWaveInterval,initial:0};this.rooms.set(room,state);}if(e.kind==='KING PUNI'){state.elite=e;state.limit=1;}else if(e.kind==='SAMURAI')state.elite=e;else{state.actors.push(e);e.group.userData.waveRoom=room;}}
  for(const state of this.rooms.values())state.initial=state.actors.length;this.initialized=true;
 }
 private safe(g:Game,x:number,z:number,floor:number,room:string){
  if(Math.hypot(x-g.position.x,z-g.position.z)<6||Math.abs(floor-(g.position.y-1.65))>.55||nightmareRoom(g.stageIndex,x,z,floor)!==room)return false;
  if(![[0,0],[.75,0],[-.75,0],[0,.75],[0,-.75]].every(([dx,dz])=>canMoveAt(x+dx,z+dz,floor+1.65,g.gate)))return false;
  if(floor<1&&(toxic(x,z)||lava(x,z)))return false;
  if(g.enemies.some(e=>e.alive&&Math.abs(e.floorY-floor)<2&&Math.hypot(e.group.position.x-x,e.group.position.z-z)<3))return false;
  return sightAt(x,z,floor+1.65,g.position.x,g.position.z,g.position.y,g.gate);
 }
 private reward(g:Game,state:Room){state.cleared=true;for(const [kind,color]of [['POTION',0xf78abc],['AMMO CELL',0xffdc7c]]as const){g.world.item(kind,g.position.x+(kind==='POTION'?-.7:.7),g.position.z,color);const item=g.world.items.at(-1)!;item.mesh.userData.baseY=g.position.y-1.65;item.mesh.position.y=g.position.y-.35;}g.sound.effect(1100);g.notify('へやを きりぬけた！ ほきゅうしよう');}
 update(g:Game){
  if(g.challenge!==3||g.practice||g.ride||g.state!=='playing'||g.mapOpen||g.orientationBlocked)return;
  if(!this.initialized)this.initialize(g);
  const room=nightmareRoom(g.stageIndex,g.position.x,g.position.z,g.position.y-1.65),state=this.rooms.get(room);if(!state||state.cleared){this.cancel(g);return;}
  if(this.pending){
   if(this.pending.room!==room){this.cancel(g);state.nextAt=g.stageTime+2;return;}
   for(const s of this.pending.spawns)s.marker.scale.setScalar(1+Math.sin(g.time*8)*.12);
   if(g.stageTime<this.pending.at)return;const wave=this.pending;this.pending=null;let appeared=0;
   for(const s of wave.spawns){g.dispose(s.marker);if(s.enemy.alive||!this.safe(g,s.x,s.z,s.floor,room))continue;const e=s.enemy;e.alive=true;e.hp=e.maxHp;e.floorY=s.floor;e.lastPlayerFloor=g.position.y-1.65;e.home={x:s.x,z:s.z};e.group.position.set(s.x,s.floor,s.z);e.group.rotation.y=Math.atan2(s.x-g.position.x,s.z-g.position.z);e.group.scale.setScalar(e.baseScale);e.group.visible=e.body.visible=true;e.body.position.set(0,0,0);e.body.rotation.set(0,0,0);e.body.scale.setScalar(1);e.telegraph=e.stunned=e.dashUntil=0;e.group.userData.meleeTell=false;e.dashHit=false;e.brain.reset();e.brain.hit(g.position.x,g.position.z,g.time);e.alert=true;e.state='Alert';e.cooldown=1.3;g.routes.delete(e);g.routeTimes.delete(e);g.burst(e.group.position.clone().add(new T.Vector3(0,1,0)),0xa9ffe2);appeared++;}
   if(appeared){state.wave++;this.cycle++;g.sound.effect(430);g.notify(`だい${state.wave}は！ あと${state.limit-state.wave}は`);}state.nextAt=g.stageTime+nightmareWaveInterval;return;
  }
  const alive=state.actors.filter(e=>e.alive).length;if(state.wave>=state.limit){if(alive===0&&!state.elite?.alive&&state.initial>0)this.reward(g,state);return;}
  if(g.stageTime<state.nextAt||alive>Math.floor(state.initial*.4))return;
  const available=state.actors.filter(e=>!e.alive&&!g.defeat.entries.some(d=>d.enemy===e));if(!available.length)return;
  const count=Math.min(g.stageIndex+2,available.length),points:{x:number;z:number;floor:number}[]=[];
  for(let n=0;n<240&&points.length<count;n++){const angle=n*2.399963+state.wave*1.137,r=8+n%8*1.3,x=g.position.x+Math.cos(angle)*r,z=g.position.z+Math.sin(angle)*r,floor=g.stageIndex===2?supportHeight(x,z,g.position.y-1.65):0;if(this.safe(g,x,z,floor,room)&&points.every(p=>Math.hypot(p.x-x,p.z-z)>=3))points.push({x,z,floor});}
  if(!points.length){if(alive===0&&!state.elite?.alive){state.wave=state.limit;this.reward(g,state);}else state.nextAt=g.stageTime+3;return;}
  const ranked=[...available].sort((a,b)=>Number(b.kind==='BOTTY'||b.kind==='TOX MUNCHER')-Number(a.kind==='BOTTY'||a.kind==='TOX MUNCHER'));
  const spawns=points.map((p,n)=>{const marker=new T.Mesh(new T.TorusGeometry(1,.06,6,24),new T.MeshBasicMaterial({color:0xafffde,transparent:true,opacity:.65,depthWrite:false}));marker.position.set(p.x,p.floor+.1,p.z);marker.rotation.x=-Math.PI/2;g.scene.add(marker);return {...p,enemy:ranked[n],marker};});
  this.pending={at:g.stageTime+nightmareSpawnWarning,spawns,room};this.nextAt=this.pending.at;g.sound.effect(330);g.notify(`だい${state.wave+1}はが くる！`);
 }
}
