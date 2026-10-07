import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {stages,makeLayout} from '../stages/Stages';
import {canMoveAt,sightAt} from '../world/layout';
import {floorNumber,supportHeight} from '../world/CastleFloors';
import {toxic,lava,bossEntranceClosed} from '../world/Threats';
import {route} from '../world/Navigation';
import {inBossArena} from './CombatRules';
import {enteredMajorRoom} from '../ui/MajorEnemyHealth';
import {randomOutcome,type ParupunOutcome} from './PowerEffects';

/** Room boundaries remain boundaries even when their doors are open. */
export function roomCells(stageIndex:number,x:number,z:number){
 const stage=stages[stageIndex],map=makeLayout(stage),blocked=new Set(stage.doors.flatMap(d=>d.cells.map(([x,z])=>`${x},${z}`)));
 if(stage.bossGate)blocked.add(stage.bossGate.join(','));
 const cells=new Set<string>(),queue=[[Math.floor(x/4),Math.floor(z/4)]];
 for(let n=0;n<queue.length;n++){const [c,r]=queue[n],key=`${c},${r}`;if(cells.has(key)||blocked.has(key)||map[r]?.[c]!=='.')continue;cells.add(key);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([c+dx,r+dz]);}
 return cells;
}
export function roomTargets(g:Game):Enemy[]{
 const feet=g.position.y-1.65,cells=roomCells(g.stageIndex,g.position.x,g.position.z);
 return g.enemies.filter(e=>e.alive&&e.kind!=='KING PUNI'&&Math.abs(e.floorY-feet)<2&&(
  g.stageIndex===2&&feet>=10?inBossArena(g.position.x,g.position.z,feet)&&inBossArena(e.group.position.x,e.group.position.z,e.floorY):
  g.stageIndex===2&&feet>3?e.group.position.distanceTo(g.position)<26&&sightAt(g.position.x,g.position.z,g.position.y,e.group.position.x,e.group.position.z,e.floorY+1.65,g.gate):cells.has(`${Math.floor(e.group.position.x/4)},${Math.floor(e.group.position.z/4)}`)));
}
export function safeWarpTargets(g:Game){
 if(bossEntranceClosed&&g.bossRoomEntered||g.practice||g.ride)return [];
 const cells=roomCells(g.stageIndex,g.position.x,g.position.z),candidates:{x:number;z:number;floor:number}[]=[],feet=g.position.y-1.65;
 for(let f=0;f<(g.stageIndex===2?3:1);f++)for(const key of g.fog.floorVisited[f]){
  const [c,r]=key.split(',').map(Number),x=c*4+2,z=r*4+2,floor=g.stageIndex===2?f*6:0;
  if(cells.has(key)&&floorNumber(feet)===f+1||Math.hypot(x-g.position.x,z-g.position.z)<12)continue;
  if(!canMoveAt(x,z,floor+1.65,g.gate)||g.stageIndex===2&&Math.abs(supportHeight(x,z,floor)-floor)>.5)continue;
  if(floor<1&&(toxic(x,z)||lava(x,z)))continue;
  if(enteredMajorRoom(g.stageIndex,'KING PUNI',x,z,floor)||enteredMajorRoom(g.stageIndex,'SAMURAI',x,z,floor))continue;
  if(g.enemies.some(e=>e.alive&&Math.abs(e.floorY-floor)<2&&Math.hypot(e.group.position.x-x,e.group.position.z-z)<4))continue;
  candidates.push({x,z,floor});
 }
 // Bound graph searches: a rare item must never stall a phone on a large explored map.
 const targets:typeof candidates=[];for(let n=0;n<Math.min(16,candidates.length);n++){const j=n+Math.floor(Math.random()*(candidates.length-n));[candidates[n],candidates[j]]=[candidates[j],candidates[n]];const target=candidates[n];if(route(g.position.x,g.position.z,target.x,target.z,g.gate,g.stageIndex===2?feet:undefined,target.floor))targets.push(target);if(targets.length===4)break;}
 return targets;
}
export function useElixir(g:Game){
 if(g.supplies.elixirs<1){g.notify('えりくさーが ない');return false;}
 g.supplies.elixirs--;g.hp=100;g.poisonUntil=g.paralyzedUntil=0;g.poisonTick=g.time+1;g.paralysisImmuneUntil=g.time+4;g.buffs.set('ANTIDOTE',g.time+4);
 for(const key of ['POWER DOWN','DEFENSE DOWN','SPEED DOWN'])g.buffs.delete(key);
 g.burst(g.position,0xffe5aa);g.sound.effect(1300);g.notify('えりくさー！ ぜんぶ かいふく！');return true;
}
export function useParupun(g:Game,outcome:ParupunOutcome=randomOutcome()){
 if(g.supplies.parupuns<1){g.notify('ぱるぷんが ない');return false;}g.supplies.parupuns--;
 if(outcome==='room'){for(const e of roomTargets(g))g.damage(e,e.hp*2+1);g.finishBossArena();g.notify('ぱるぷん！ へやの てきが きえた！');}
 else if(outcome==='warp'){
  const targets=safeWarpTargets(g),target=targets[Math.floor(Math.random()*targets.length)];
  if(target){g.position.set(target.x,target.floor+1.65,target.z);g.safe.copy(g.position);g.camera.position.copy(g.position);g.velocity.set(0,0,0);g.vy=0;g.input.reset();g.routes.clear();g.routeTimes.clear();g.notify('ぱるぷん！ ちがう へやへ！');}
  else{g.buffs.set('INVINCIBLE',g.time+8);g.notify('ぱるぷん！ しばらく むてき！');}
 }else{
  const effects:Record<Exclude<ParupunOutcome,'room'|'warp'>,[string,string,string]>={
   'power-up':['POWER UP','POWER DOWN','こうげきが つよく なった！'],'power-down':['POWER DOWN','POWER UP','こうげきが よわく なった！'],
   'defense-up':['DEFENSE UP','DEFENSE DOWN','まもりが つよく なった！'],'defense-down':['DEFENSE DOWN','DEFENSE UP','まもりが よわく なった！'],
   slow:['SPEED DOWN','SPEED UP','あしが おそく なった！'],fast:['SPEED UP','SPEED DOWN','あしが はやく なった！'],invincible:['INVINCIBLE','','しばらく むてき！'],
  };
  const [key,opposite,message]=effects[outcome];if(opposite)g.buffs.delete(opposite);g.buffs.set(key,g.time+(outcome==='invincible'?8:15));g.notify(`ぱるぷん！ ${message}`);
 }
 g.sound.effect(800);g.burst(g.position,0xe5b9ff);return true;
}
