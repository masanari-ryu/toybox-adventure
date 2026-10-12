import * as T from 'three';
import type {Game} from '../game/Game';
import type {Enemy} from '../game/Enemy';
import {fire} from '../game/Combat';
import {inSlash,katanaReach} from '../game/Katana';
import {easyDormant} from '../game/EasyMode';
import {sightAt,canMoveAt} from '../world/layout';
import {doors,switches,bossEntranceClosed} from '../world/Threats';
import {topHeight,supportHeight} from '../world/CastleFloors';
import {route,canTraverseCastle} from '../world/Navigation';
import {stages} from '../stages/Stages';
import {railEnemyScale} from '../game/EnemyScale';
import {railFrame} from '../rail/RailCourse';
import {challenges} from '../game/Challenge';
import {weaponEnergy,murasameHealthCost} from '../game/WeaponSettings';
import {names} from '../ui/Text';
import {walkingPath,type Waypoint} from './BotNavigation';
const point=(p:{x:number;y:number;z:number})=>({x:p.x,y:p.y,z:p.z});
export function seededRandom(seed:number){let state=seed>>>0;return()=>{let n=state=(state+0x6d2b79f5)>>>0;n=Math.imul(n^n>>>15,n|1);n^=n+Math.imul(n^n>>>7,n|61);return ((n^n>>>14)>>>0)/4294967296;};}
/** Keep unrelated real-time audio/renderer callbacks from consuming gameplay entropy. */
export function withRandom<T>(random:()=>number,fn:()=>T){const original=Math.random;Math.random=random;try{return fn();}finally{Math.random=original;}}
export function screenPoint(camera:T.Camera,p:T.Vector3,rect:{left:number;top:number;width:number;height:number},visible=true){
 const world=new T.Matrix4().compose(camera.position,camera.quaternion,camera.scale);if(camera.parent)world.premultiply(camera.parent.matrixWorld);
 const v=p.clone().applyMatrix4(world.invert()).applyMatrix4(camera.projectionMatrix);
 if(!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Number.isFinite(v.z))return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,onScreen:false};
 return {x:rect.left+(v.x+1)*rect.width/2,y:rect.top+(1-v.y)*rect.height/2,onScreen:visible&&v.z>=-1&&v.z<=1&&Math.abs(v.x)<=1&&Math.abs(v.y)<=1};
}
export class Ring<T>{private values:T[]=[];constructor(private limit=50){}add(value:T){this.values.push(value);if(this.values.length>this.limit)this.values.shift();}read(){return structuredClone(this.values);}}
export function fixedSteps(seconds:number,dt:number,advance:(dt:number)=>boolean|void){if(!Number.isFinite(seconds)||seconds<0||seconds>600||!Number.isFinite(dt)||dt<=0||dt>.04)throw new RangeError('Invalid simulation interval');let total=0;while(total<seconds-1e-10){const tick=Math.min(dt,seconds-total);if(advance(tick)===false)break;total+=tick;}return total;}
export type FireResult={fired:boolean;reason?:'offscreen'|'cooldown'|'noenergy'|'blocked'|'dormant'|'dead'|'paused'};
export type StartResult={ok:true;stageIndex:number;hp:number;potions:number;checkpoint:{stageIndex:number;hp:number;potions:number}}|{ok:false;reason:'too-early'|'invalid-state'|'locked';waitMs?:number};
export type WalkOptions={maxSeconds?:number;radius?:number;autoFight?:boolean;healBelow?:number};
export type FightOptions={maxSeconds?:number;range?:number;healBelow?:number;approach?:boolean};
export type WalkResult={arrived:boolean;reason?:'blocked'|'timeout'|'dead'|'unreachable'|'paused';position:{x:number;y:number;z:number};elapsed:number;hpLost:number};
export type FightResult={elapsed:number;hpLost:number;killed:number;shots:number;heals:number;state:Game['state']};
type Event={type:string;time:number;stageIndex:number;position:{x:number;y:number;z:number};[key:string]:unknown};
export class BotApi{
 private scale=0;private last=0;private doorStates=doors.map(d=>d.open);private events=new Ring<Event>();private stepping=false;
 private checkpoint={stageIndex:0,hp:100,potions:1};
 private lastDamage:{amount:number;source:string;time:number}|null=null;
 private pickups=new Ring<string>(10);private objectiveHints=new Ring<{text:string;time:number;stageIndex:number}>(5);private objective='';
 private damageContext='';private usedSwitches=new Set<number>();private damageTotal=0;private killsTotal=0;private shotsTotal=0;private healsTotal=0;
 constructor(private g:Game,private random:()=>number){
  this.saveCheckpoint();this.hookEvents();this.pollObjective();g.frame=(ms:number)=>this.frame(ms);
  if(new URLSearchParams(location.search).get('nopause')==='1'){
   // Capture before the ordinary bubble listeners; only this opt-in instance bypasses background pause.
   window.addEventListener('blur',e=>e.stopImmediatePropagation(),true);
   document.addEventListener('visibilitychange',e=>{if(document.hidden)e.stopImmediatePropagation();},true);
  }
 }
 private saveCheckpoint(){this.checkpoint={stageIndex:this.g.stageIndex,hp:this.g.hp,potions:this.g.supplies.potions};}
 private pollObjective(){const text=document.getElementById('objective')?.textContent??'';if(text!==this.objective){this.objective=text;this.objectiveHints.add({text,time:this.g.time,stageIndex:this.g.stageIndex});}}
 private damageSource(amount:number){const g=this.g;if(g.ride)return 'RAIL';if(this.damageContext==='environment')return amount===3?'POISON':amount===10||amount===2?'LAVA':'UNKNOWN';
  const incoming=g.shots.filter(s=>s.enemy&&s.m.position.distanceTo(g.position)<2).sort((a,b)=>a.m.position.distanceToSquared(g.position)-b.m.position.distanceToSquared(g.position))[0];
  if(incoming)return incoming.bossOwner?.kind??(incoming.kind===3?'POISON PROJECTILE':incoming.kind===4?'PARALYSIS PROJECTILE':'PROJECTILE');
  const near=g.enemies.filter(e=>e.alive&&!easyDormant(e)&&Math.abs(e.floorY-(g.position.y-1.65))<3).sort((a,b)=>a.group.position.distanceToSquared(g.position)-b.group.position.distanceToSquared(g.position))[0];
  return near&&near.group.position.distanceTo(g.position)<8?near.kind:'UNKNOWN';
 }
 private record(type:string,details:Record<string,unknown>={}){const g=this.g;this.events.add({type,time:g.time,stageIndex:g.stageIndex,position:point(g.position),...details});}
 private pollDoors(){for(const [n,d]of doors.entries())if(this.doorStates[n]!==d.open)this.record(d.open?'door-open':'door-close',{id:d.id});this.doorStates=doors.map(d=>d.open);if(doors[5]?.open)for(const [n,s]of switches.entries())if(s.kind==='samurai')this.usedSwitches.add(n);}
 private hookEvents(){const g=this.g,hurt=g.hurt.bind(g),damage=g.damage.bind(g),take=g.takeSupply.bind(g),load=g.loadStage.bind(g),activate=g.activateSwitch.bind(g),useItems=g.useItems.bind(g),threats=g.updateThreats.bind(g),collect=g.collect.bind(g);
  g.collect=()=>{const before=g.stageFragment;collect();if(!before&&g.stageFragment){this.pickups.add(names.KEY);this.record('pickup',{kind:'KEY',name:names.KEY});}};
  g.updateThreats=dt=>{this.damageContext='environment';try{threats(dt);}finally{this.damageContext='';}};
  g.useItems=()=>{const before=g.supplies.potions+g.supplies.bigPotions;useItems();this.healsTotal+=Math.max(0,before-g.supplies.potions-g.supplies.bigPotions);};
  g.hurt=n=>{const hp=g.hp,state=g.state,source=this.damageSource(n);hurt(n);if(g.hp<hp){this.lastDamage={amount:hp-g.hp,source,time:g.time};this.damageTotal+=hp-g.hp;this.record('damage',{...this.lastDamage,hp:g.hp});}if(state!=='over'&&g.state==='over')this.record('game-over');};
  g.damage=(e,n,w)=>{const alive=e.alive,id=this.enemyId(e);damage(e,n,w);if(alive&&!e.alive){this.killsTotal++;this.record('defeat',{id,kind:e.kind});}this.pollDoors();};
  g.takeSupply=k=>{const result=take(k);if(result){this.pickups.add(names[k]??k);this.record('pickup',{kind:k,name:names[k]??k,weapon:g.input.weapon});}return result;};
  g.loadStage=n=>{load(n);this.usedSwitches.clear();this.saveCheckpoint();this.doorStates=doors.map(d=>d.open);this.record('stage',{stageIndex:n});this.pollObjective();};
  g.activateSwitch=s=>{const before=doors.map(d=>d.open),gate=g.gate,bridge=g.bridgeUntil,purge=g.purgeUntil;activate(s);if(gate!==g.gate||bridge!==g.bridgeUntil||purge!==g.purgeUntil||doors.some((d,n)=>d.open!==before[n]))this.usedSwitches.add(switches.indexOf(s));for(const [n,d]of doors.entries())if(before[n]!==d.open)this.record(d.open?'door-open':'door-close',{id:d.id});this.doorStates=doors.map(d=>d.open);if(!gate&&g.gate)this.record('boss-entrance-open');};
 }
 private enemyId(e:Enemy){return `enemy-${this.g.stageIndex}-${this.g.enemies.indexOf(e)}`;}
 private center(e:Enemy){return e.group.position.clone().add(new T.Vector3(0,e.kind==='KING PUNI'?2.2*e.baseScale:e.baseScale,0));}
 private project(p:T.Vector3,visible=true){return screenPoint(this.g.camera,p,this.g.renderer.domElement.getBoundingClientRect(),visible);}
 getState():FullState;
 getState(options:{compact:true}):CompactState;
 getState(options?:{compact?:boolean}):FullState|CompactState;
 getState(options?:{compact?:boolean}){const full=this.fullState();return options?.compact?compactState(full,[...this.usedSwitches]):full;}
 private fullState(){this.g.camera.updateMatrixWorld(true);const g=this.g,stage=stages[g.stageIndex],floor=(x:number,z:number)=>g.stageIndex===2?topHeight(x,z):0;
  const located=(x:number,z:number,y=floor(x,z))=>{const position={x,y,z};return {position,screen:this.project(new T.Vector3(x,y+1.1,z))};};
  return {state:g.state,stageIndex:g.stageIndex,challenge:g.challenge,time:g.time,stageTime:g.stageTime,endingTime:g.endingTime,timeScale:this.scale,ready:!g.visuals.preparing,
   hp:g.hp,position:point(g.position),yaw:g.yaw,pitch:g.pitch,weapon:g.input.weapon,energy:g.energy,potions:g.supplies.potions,bigPotions:g.supplies.bigPotions,antidotes:g.supplies.antidotes,elixirs:g.supplies.elixirs,parupuns:g.supplies.parupuns,score:g.score,keyCount:g.keyCount,
   inventory:{...g.supplies},weapons:g.arsenal.choices(),weaponLevels:[...g.arsenal.levels],poisonUntil:g.poisonUntil,paralyzedUntil:g.paralyzedUntil,gate:g.gate,bossClear:g.bossClear,battery:g.battery,stageFragment:g.stageFragment,
   enemies:g.ride?g.ride.targets.flatMap((t,n)=>t.hp>0?[{id:`rail-${g.stageIndex}-${n}`,kind:t.enemy.kind,hp:t.hp,maxHp:(t.enemy.kind==='BOTTY'?3:1)*challenges[g.challenge].hp,home:{x:t.origin.x,z:t.origin.z},position:point(t.enemy.group.position),distance:t.enemy.group.position.distanceTo(g.position),visible:t.enemy.group.visible&&t.enemy.body.visible,dormant:false,lineOfSight:t.enemy.group.visible,screen:this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible),attack:{state:'Chase',action:null,until:0,aim:null}}]:[]):g.enemies.flatMap((e,n)=>e.alive?[{id:`enemy-${g.stageIndex}-${n}`,kind:e.kind,hp:e.hp,maxHp:e.maxHp,home:{...e.home},position:point(e.group.position),distance:e.group.position.distanceTo(g.position),visible:e.group.visible&&e.body.visible,dormant:easyDormant(e),lineOfSight:!easyDormant(e)&&!e.group.userData.bossHidden&&sightAt(g.position.x,g.position.z,g.position.y,this.center(e).x,this.center(e).z,this.center(e).y,g.gate),screen:this.project(this.center(e),e.group.visible&&e.body.visible),attack:{state:e.group.userData.bossCombat?.mode??e.state,action:e.group.userData.bossCombat?.action??null,until:e.telegraph,aim:e.group.userData.bossCombat?.aim?{...e.group.userData.bossCombat.aim}:null}}]:[]),
   goals:{switches:switches.map((s,n)=>({id:n,kind:s.kind,door:s.door,...located(s.x,s.z)})),doors:doors.map(d=>({id:d.id,open:d.open,...located(d.x,d.z)})),items:g.world.items.map((i,n)=>({id:n,kind:i.kind,taken:i.taken,visible:i.mesh.visible,position:point(i.mesh.position),screen:this.project(i.mesh.position,i.mesh.visible&&!i.taken)})),exit:{...located(...stage.exit),visible:g.world.portal.visible},fragment:{...located(...stage.key),taken:g.stageFragment},chest:{position:point(g.world.chest.position),open:g.world.chestOpened,screen:this.project(g.world.chest.position.clone().add(new T.Vector3(0,.6,0)))},bossEntrance:g.stageIndex===2?{...located(90,30,12),open:g.gate&&!bossEntranceClosed,activated:g.coreEnabled}:{...located(g.stageIndex===0?58:70,g.stageIndex===0?30:18),open:!!doors[g.stageIndex===0?3:2]?.open},waypoints:stage.route.map(([x,z])=>({...located(x,z)}))},
   dialog:g.state==='ending'?{text:document.getElementById('ending-caption')?.textContent??'',buttons:[]}:['title','paused','over','clear'].includes(g.state)?{text:document.getElementById('description')?.textContent??'',buttons:Array.from(document.querySelectorAll<HTMLButtonElement>('#overlay button')).filter(b=>!b.hidden&&b.getBoundingClientRect().width>0).map(b=>b.textContent??'')}:null,objective:document.getElementById('objective')?.textContent??'',interaction:{visible:!document.getElementById('interact')!.hidden,text:document.getElementById('interact')!.textContent??''},card:g.card.open?{title:document.getElementById('card-title')!.textContent??'',text:document.getElementById('card-description')!.textContent??'',buttons:Array.from(document.querySelectorAll('#card button')).filter(b=>!(b as HTMLElement).hidden).map(b=>b.textContent??'')}:null,
   projectiles:g.shots.filter(s=>s.enemy).map(s=>({position:point(s.m.position),velocity:point(s.v),screen:this.project(s.m.position)})),
   train:g.ride?{progress:g.ride.progress.fraction,elapsed:g.ride.progress.elapsed,kills:g.ride.kills,targets:g.ride.targets.flatMap((t,n)=>t.hp>0?[{id:n,hp:t.hp,position:point(t.enemy.group.position),distance:t.enemy.group.position.distanceTo(g.position),screen:this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible)}]:[])}:null,
   checkpoint:{...this.checkpoint},lastDamage:this.lastDamage?{...this.lastDamage}:null,pickups:this.pickups.read(),objectiveHint:this.objectiveHints.read(),events:this.events.read()};
 }
 setKeys(codes:string[]){if(!Array.isArray(codes)||codes.some(c=>typeof c!=='string'))throw new TypeError('Expected key codes');this.g.input.keys=new Set(codes);}
 private orient(){const g=this.g;g.camera.position.copy(g.position);g.camera.rotation.order='YXZ';g.camera.rotation.set(g.pitch,g.yaw,0);g.camera.updateMatrixWorld(true);}
 look(dyaw:number,dpitch=0){if(!Number.isFinite(dyaw)||!Number.isFinite(dpitch))throw new TypeError('Invalid look delta');const g=this.g;if(g.ride){g.ride.lookYaw=T.MathUtils.clamp(g.ride.lookYaw+dyaw,-.85,.85);g.ride.lookPitch=T.MathUtils.clamp(g.ride.lookPitch+dpitch,-.55,.65);g.ride.pose(g.ride.progress.fraction);}else{g.yaw+=dyaw;g.pitch=T.MathUtils.clamp(g.pitch+dpitch,-1.15,1.15);this.orient();}}
 lookAt(x:number,z:number,_options:{instant?:boolean}={}){if(!Number.isFinite(x)||!Number.isFinite(z))throw new TypeError('Invalid target');if(this.g.ride){const r=this.g.ride,local=new T.Vector3(x-this.g.position.x,0,z-this.g.position.z).applyQuaternion(railFrame(r.curve,r.progress.fraction).q.clone().invert());r.lookYaw=T.MathUtils.clamp(Math.atan2(-local.x,-local.z),-.85,.85);r.lookPitch=T.MathUtils.clamp(Math.atan2(local.y,Math.hypot(local.x,local.z)),-.55,.65);r.pose(r.progress.fraction);return true;}this.g.yaw=Math.atan2(this.g.position.x-x,this.g.position.z-z);this.orient();return true;}
 lookAtEnemy(id:string){
  const g=this.g,e=g.enemies.find(e=>this.enemyId(e)===id&&e.alive);
  const rail=g.ride?.targets.find((t,n)=>`rail-${g.stageIndex}-${n}`===id&&t.hp>0);
  const target=rail?rail.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)):e?this.center(e):null;
  if(!target)return false;
  if(g.ride){const r=g.ride,local=target.sub(g.position).applyQuaternion(railFrame(r.curve,r.progress.fraction).q.clone().invert());r.lookYaw=T.MathUtils.clamp(Math.atan2(-local.x,-local.z),-.85,.85);r.lookPitch=T.MathUtils.clamp(Math.atan2(local.y,Math.hypot(local.x,local.z)),-.55,.65);r.pose(r.progress.fraction);}
  else{g.yaw=Math.atan2(g.position.x-target.x,g.position.z-target.z);g.pitch=T.MathUtils.clamp(Math.atan2(target.y-g.position.y,Math.hypot(target.x-g.position.x,target.z-g.position.z)),-1.15,1.15);this.orient();}
  g.camera.updateMatrixWorld(true);return true;
 }
 fireAt(sx:number,sy:number):FireResult{
  const g=this.g;if(g.state!=='playing'||g.visuals.preparing||g.orientationBlocked)return {fired:false,reason:'paused'};
  const r=g.renderer.domElement.getBoundingClientRect();if(!Number.isFinite(sx)||!Number.isFinite(sy)||sx<r.left||sx>r.right||sy<r.top||sy>r.bottom)return {fired:false,reason:'offscreen'};
  if(g.time<(g.ride?g.ride.shotAt:g.shotTime))return {fired:false,reason:'cooldown'};
  if(!g.ride&&(g.energy<weaponEnergy(g.input.weapon)||g.input.weapon===3&&g.arsenal.murasame&&g.hp<=murasameHealthCost))return {fired:false,reason:'noenergy'};
  g.camera.updateMatrixWorld(true);const aim={x:(sx-r.left)/r.width*2-1,y:1-(sy-r.top)/r.height*2};if(g.input.touch){g.input.tapAim=aim;g.input.mouseAim=null;}else{g.input.mouseAim=aim;g.input.tapAim=null;}
  let fired=false;
  if(g.ride){const before=g.ride.shotAt,alive=g.ride.targets.map(t=>t.hp>0);withRandom(this.random,()=>g.ride!.fire());for(const [n,t]of g.ride.targets.entries())if(alive[n]&&t.hp<=0){this.killsTotal++;this.record('defeat',{id:`rail-${g.stageIndex}-${n}`,kind:t.enemy.kind});}fired=g.ride.shotAt>before;}
  else{const before=g.shotTime;withRandom(this.random,()=>fire(g));fired=g.shotTime>before;}
  if(fired)this.shotsTotal++;return fired?{fired:true}:{fired:false,reason:'blocked'};
 }
 fireAtEnemy(id:string,options:{turn?:boolean}={}):FireResult{
  const g=this.g;if(g.state!=='playing'||g.visuals.preparing||g.orientationBlocked)return {fired:false,reason:'paused'};
  if(g.ride){const n=g.ride.targets.findIndex((_,n)=>`rail-${g.stageIndex}-${n}`===id),t=g.ride.targets[n];if(!t||t.hp<=0)return {fired:false,reason:'dead'};
   if(options.turn){this.lookAtEnemy(id);this.draw();}const screen=this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible);
   return screen.onScreen?this.fireAt(screen.x,screen.y):{fired:false,reason:'offscreen'};
  }
  const e=g.enemies.find(e=>this.enemyId(e)===id);if(!e||!e.alive)return {fired:false,reason:'dead'};
  if(easyDormant(e))return {fired:false,reason:'dormant'};
  if(e.group.userData.bossHidden||e.kind==='KING PUNI'&&!g.gate||e.kind==='SAMURAI'&&!doors[5]?.open)return {fired:false,reason:'blocked'};
  if(options.turn){this.lookAtEnemy(id);this.draw();}
  const center=this.center(e),screen=this.project(center,e.group.visible&&e.body.visible);
  if(!screen.onScreen)return {fired:false,reason:'offscreen'};
  if(!sightAt(g.position.x,g.position.z,g.position.y,center.x,center.z,center.y,g.gate))return {fired:false,reason:'blocked'};
  return this.fireAt(screen.x,screen.y);
 }
 interact(){if(this.g.state==='playing')this.g.input.interact=true;}
 heal(){if(this.g.state==='playing')this.g.input.heal=true;}
 antidote(){if(this.g.state==='playing')this.g.input.antidote=true;}
 selectWeapon(n:number){if(!Number.isInteger(n))return false;this.g.input.weapon=this.g.arsenal.select(n,this.g.input.weapon);this.g.updateHud();this.pollObjective();return this.g.input.weapon===n;}
 pause(){if(this.g.state==='playing')this.g.pause();}
 resume(){if(this.g.state==='paused'){this.g.resume();if(!this.g.ride)this.orient();}}
 private startResult():StartResult{return {ok:true,stageIndex:this.g.stageIndex,hp:this.g.hp,potions:this.g.supplies.potions,checkpoint:{...this.checkpoint}};}
 async start(difficulty:0|1|2|3=0):Promise<StartResult>{const g=this.g;if(g.state!=='title'||![0,1,2,3].includes(difficulty))return {ok:false,reason:'invalid-state'};if(difficulty===3&&!g.nightmare)return {ok:false,reason:'locked'};withRandom(this.random,()=>{g.challenge=difficulty;g.loadStage(0);g.renderChallenges();});await g.visuals.ready;withRandom(this.random,()=>g.start());this.saveCheckpoint();this.pollObjective();return this.startResult();}
 async restart():Promise<StartResult>{if(this.g.state!=='over')return {ok:false,reason:'invalid-state'};const waitMs=Math.max(0,Math.ceil(this.g.deathReadyAt-performance.now()));if(waitMs>0)return {ok:false,reason:'too-early',waitMs};withRandom(this.random,()=>this.g.start());await this.g.visuals.ready;this.saveCheckpoint();this.pollObjective();return this.startResult();}
 async restartWhenReady():Promise<StartResult>{if(this.g.state!=='over')return {ok:false,reason:'invalid-state'};while(this.g.state==='over'&&performance.now()<this.g.deathReadyAt)await new Promise(r=>setTimeout(r,Math.max(1,Math.ceil(this.g.deathReadyAt-performance.now()))));return this.restart();}
 dismissCard(){if(this.g.card.open)withRandom(this.random,()=>this.g.card.close());this.pollDoors();if(this.g.state==='playing'&&!this.g.ride){this.orient();this.g.gun.position.set(0,-.18,-.6);}}
 setInputMode(mode:'mouse'|'touch'){if(mode!=='mouse'&&mode!=='touch')throw new TypeError('Invalid input mode');this.g.input.reset();this.g.input.touch=mode==='touch';document.body.classList.toggle('touch',this.g.input.touch);this.g.resize();}
 setTimeScale(s:number){if(!Number.isFinite(s)||s<0||s>100)throw new RangeError('Time scale must be between 0 and 100');this.scale=s;this.last=0;}
 private advance(dt:number){const g=this.g;if(g.visuals.preparing||g.orientationBlocked)return false;if(g.state==='playing')g.update(dt);else if(g.state==='ending')g.updateEnding(dt);else return false;this.pollDoors();this.pollObjective();return true;}
 async step(seconds:number,fixedDt=1/60){if(this.scale!==0)throw new Error('Stop time before stepping');if(this.stepping)throw new Error('A step is already running');this.stepping=true;try{await this.g.visuals.ready;const advanced=withRandom(this.random,()=>fixedSteps(seconds,fixedDt,dt=>this.advance(dt)));this.draw();return {advanced,state:this.getState()};}finally{this.stepping=false;}}
 /** Read-only route helper reuses the game's navigation; it never moves the player. */
 routeTo(x:number,z:number){const g=this.g,p=g.position,feet=p.y-1.65,targetFeet=g.stageIndex===2?topHeight(x,z):undefined;
  const reachable=(a:number,b:number)=>g.stageIndex===2?canTraverseCastle(p.x,p.z,feet,a,b,g.gate):Array.from({length:Math.max(1,Math.ceil(Math.hypot(a-p.x,b-p.z)/.3))},(_,n)=>{const t=(n+1)/Math.max(1,Math.ceil(Math.hypot(a-p.x,b-p.z)/.3));return canMoveAt(p.x+(a-p.x)*t,p.z+(b-p.z)*t,p.y,g.gate);}).every(Boolean);
  const next=route(p.x,p.z,x,z,g.gate,g.stageIndex===2?feet:undefined,targetFeet);if(next&&reachable(next.x,next.z))return next;
  // The legacy navigator rounds its start. Validate nearby supported anchors instead of starting inside a wall.
  const spacing=g.stageIndex===2?2:4,offset=g.stageIndex===2?0:2,candidates:{x:number;z:number}[]=[];
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=Math.round((p.x-offset)/spacing)*spacing+offset+dx*spacing,b=Math.round((p.z-offset)/spacing)*spacing+offset+dz*spacing;if(Math.hypot(a-p.x,b-p.z)>.1&&reachable(a,b))candidates.push({x:a,z:b});}
  candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));for(const a of candidates)if(route(a.x,a.z,x,z,g.gate,g.stageIndex===2?supportHeight(a.x,a.z,feet):undefined,targetFeet))return a;return null;
 }
 private async helper(maxSeconds:number,tick:(elapsed:number,dt:number)=>boolean){
  if(!Number.isFinite(maxSeconds)||maxSeconds<0||maxSeconds>600)throw new RangeError('Invalid helper duration');
  if(this.scale!==0||this.stepping)throw new Error('Stop time and finish the current operation first');
  this.stepping=true;let elapsed=0,count=0;
  try{await this.g.visuals.ready;
   while(elapsed<maxSeconds-1e-10){
    if(this.g.card.open&&this.g.ride?.progress.fraction===1)break;
    if(this.g.card.open){this.dismissCard();await this.g.visuals.ready;}
    if(this.g.state!=='playing'||this.g.orientationBlocked)break;
    const dt=Math.min(1/60,maxSeconds-elapsed);
    if(!withRandom(this.random,()=>tick(elapsed,dt)))break;
    if(!withRandom(this.random,()=>this.advance(dt)))break;
    elapsed+=dt;
    if(++count%240===0)await new Promise(r=>setTimeout(r,0));
   }
   this.pollObjective();this.draw();return elapsed;
  }finally{this.g.input.keys.clear();this.stepping=false;}
 }
 private healIfNeeded(threshold:number){if(this.g.hp<threshold&&(this.g.supplies.potions+this.g.supplies.bigPotions)>0)this.heal();if(this.g.poisonUntil>this.g.time&&this.g.supplies.antidotes>0)this.antidote();}
 private foe(range:number){const g=this.g;return g.enemies.filter(e=>e.alive&&!easyDormant(e)&&!e.group.userData.bossHidden&&(e.kind!=='KING PUNI'||g.gate)&&(e.kind!=='SAMURAI'||doors[5]?.open)&&this.center(e).distanceTo(g.position)<=range&&sightAt(g.position.x,g.position.z,g.position.y,this.center(e).x,this.center(e).z,this.center(e).y,g.gate)).sort((a,b)=>this.center(a).distanceToSquared(g.position)-this.center(b).distanceToSquared(g.position))[0];}
 private canWalkTo(x:number,z:number){const g=this.g;return g.stageIndex===2?canTraverseCastle(g.position.x,g.position.z,g.position.y-1.65,x,z,g.gate):canMoveAt(x,z,1.65,g.gate);}
 private engage(e:Enemy){this.lookAtEnemy(this.enemyId(e));
  if(this.g.input.weapon===3&&(!inSlash(this.g.position.x,this.g.position.z,e.group.position.x,e.group.position.z,e.radius*e.baseScale)||Math.abs(this.g.position.y-1.65-e.floorY)>=3))return;
  this.fireAtEnemy(this.enemyId(e));
 }
 private combatMovement(e:Enemy,elapsed:number,approach:boolean){
  const g=this.g,dx=g.position.x-e.group.position.x,dz=g.position.z-e.group.position.z,d=Math.max(.01,Math.hypot(dx,dz));
  const melee=g.input.weapon===3,reach=katanaReach+e.radius*e.baseScale,near=melee?Math.min(4,reach*.65):(e.kind==='KING PUNI'?8:5),far=melee?reach-.6:10;
  if(d<near){
   const side=Math.floor(elapsed/3)%2?1:-1;
   for(const sign of [side,-side]){const p={x:g.position.x-dz/d*sign*.65+dx/d*.45,z:g.position.z+dx/d*sign*.65+dz/d*.45};if(this.canWalkTo(p.x,p.z))return p;}
   const p={x:g.position.x+dx/d*.6,z:g.position.z+dz/d*.6};if(this.canWalkTo(p.x,p.z))return p;
  }else if(approach&&d>far){const p={x:g.position.x-dx/d*.6,z:g.position.z-dz/d*.6};if(this.canWalkTo(p.x,p.z))return p;}
  return null;
 }
 async walkTo(x:number,z:number,options:WalkOptions={}):Promise<WalkResult>{
  if(!Number.isFinite(x)||!Number.isFinite(z)||options.radius!==undefined&&(!Number.isFinite(options.radius)||options.radius<=0))throw new RangeError('Invalid walking target');
  const g=this.g,max=options.maxSeconds??30,radius=options.radius??1.6,damage=this.damageTotal,stage=g.stageIndex;
  let reason:WalkResult['reason'],arrived=false,path:Waypoint[]|null=null,index=0;
  const feet=()=>g.position.y-1.65,targetFeet=stage===2?topHeight(x,z):0;
  let progressAt=0,progress=point(g.position),revision='',bestRemaining=Infinity,lastIndex=-1,nodeProgressAt=0;
  const elapsed=await this.helper(max,(elapsed)=>{
   if(g.stageIndex!==stage||g.ride){reason='unreachable';return false;}
   if(Math.hypot(g.position.x-x,g.position.z-z)<=radius&&Math.abs(feet()-targetFeet)<.65){arrived=true;return false;}
   this.healIfNeeded(options.healBelow??35);
   const signature=`${g.gate}/${bossEntranceClosed}/${doors.map(d=>+d.open).join('')}`;
   if(!path||signature!==revision){path=walkingPath({x:g.position.x,z:g.position.z,y:feet()},x,z,stage,g.gate);index=0;revision=signature;if(!path){reason='unreachable';return false;}}
   const straight=(n:number)=>{if(n>=path!.length-1)return false;const a=path![n],b=path![n+1],dx=a.x-g.position.x,dz=a.z-g.position.z,ex=b.x-a.x,ez=b.z-a.z;return (dx*ex+dz*ez)/Math.max(.00001,Math.hypot(dx,dz)*Math.hypot(ex,ez))>.995;};
   while(index<path.length-1&&Math.hypot(path[index].x-g.position.x,path[index].z-g.position.z)<.3&&(g.velocity.length()<.7||straight(index)))index++;
   const next=path[index];let combatMove:{x:number;z:number}|null=null;
   if(options.autoFight){const e=this.foe(18);if(e){this.engage(e);if(e.alive)combatMove=this.combatMovement(e,elapsed,false);}}
   this.lookAt(combatMove?.x??next.x,combatMove?.z??next.z,{instant:true});g.pitch=0;this.orient();const remaining=Math.hypot(next.x-g.position.x,next.z-g.position.z);this.setKeys(combatMove||straight(index)||remaining>.12+g.velocity.length()/12?['KeyW']:[]);
   if(index!==lastIndex||remaining<bestRemaining-.2){lastIndex=index;bestRemaining=remaining;nodeProgressAt=elapsed;}else if(elapsed-nodeProgressAt>=5){reason='blocked';return false;}
   if(Math.hypot(progress.x-g.position.x,progress.z-g.position.z,progress.y-g.position.y)>.45){progress=point(g.position);progressAt=elapsed;}
   else if(elapsed-progressAt>=5){reason='blocked';return false;}
   return true;
  });
  if(!arrived&&!reason)reason=g.state==='over'?'dead':g.state!=='playing'||g.orientationBlocked?'paused':'timeout';
  if(!arrived&&g.state==='playing'&&!g.orientationBlocked&&Math.hypot(g.position.x-x,g.position.z-z)<=radius&&Math.abs(feet()-targetFeet)<.65){arrived=true;reason=undefined;}
  return {arrived,...reason?{reason}:{},position:point(g.position),elapsed,hpLost:this.damageTotal-damage};
 }
 async fight(options:FightOptions={}):Promise<FightResult>{
  const g=this.g,damage=this.damageTotal,kills=this.killsTotal,shots=this.shotsTotal,heals=this.healsTotal,range=options.range??14;
  if(!Number.isFinite(range)||range<=0)throw new RangeError('Invalid combat range');
  const elapsed=await this.helper(options.maxSeconds??20,(elapsed)=>{
   if(g.ride)return false;this.healIfNeeded(options.healBelow??35);
   const e=this.foe(range);if(!e)return false;
   this.engage(e);
   const destination=this.combatMovement(e,elapsed,options.approach!==false);
   if(destination){this.lookAt(destination.x,destination.z,{instant:true});this.setKeys(['KeyW']);}else this.setKeys([]);
   return true;
  });
  return {elapsed,hpLost:this.damageTotal-damage,killed:this.killsTotal-kills,shots:this.shotsTotal-shots,heals:this.healsTotal-heals,state:g.state};
 }
 async playRail(options:{maxSeconds?:number}={}){
  const g=this.g,ride=g.ride,damage=this.damageTotal,startKills=ride?.kills??0,total=ride?.targets.length??0;
  if(!ride)return {kills:0,total:0,hpLost:0,arrived:false};
  const elapsed=await this.helper(options.maxSeconds??120,()=>{
   if(g.ride!==ride||ride.progress.fraction>=1)return false;
   this.healIfNeeded(35);
   const targets=ride.targets.map((t,n)=>({t,n,screen:this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible)})).filter(v=>v.t.hp>0&&v.screen.onScreen).sort((a,b)=>a.t.enemy.group.position.distanceToSquared(g.position)-b.t.enemy.group.position.distanceToSquared(g.position));
   if(targets[0])this.fireAtEnemy(`rail-${g.stageIndex}-${targets[0].n}`);
   return true;
  });
  return {kills:ride.kills-startKills,total,hpLost:this.damageTotal-damage,arrived:ride.progress.fraction>=1,elapsed};
 }
 private draw(){const g=this.g;g.gun.visible=g.state==='playing'||g.state==='review'&&!g.ending;g.renderVisuals();g.visuals.render();}
 private frame(ms:number){const elapsed=this.last?Math.min(.04,Math.max(0,(ms-this.last)/1000)):0;this.last=ms;if(!this.stepping&&this.scale>0)withRandom(this.random,()=>fixedSteps(elapsed*this.scale,1/60,dt=>this.advance(dt)));if(!this.g.visuals.preparing)this.draw();requestAnimationFrame(t=>this.g.frame(t));}
 help(){return 'getState({compact:true}); await walkTo(x,z,options); await fight(options); await playRail(options); lookAtEnemy(id); await restartWhenReady(); getState(); setKeys(codes); look(dyaw, dpitch); lookAt(x, z, {instant:true}); fireAt(sx, sy); fireAtEnemy(id, {turn:true}); interact(); heal(); antidote(); selectWeapon(index); pause(); resume(); await start(0|1|2|3);  restart(); dismissCard(); setInputMode("mouse"|"touch"); setTimeScale(0..100); await step(seconds, fixedDt=1/60); routeTo(x,z); await snapshot();';}
 async snapshot(){await this.g.visuals.ready;this.draw();return {state:this.getState(),png:this.g.renderer.domElement.toDataURL('image/png')};}
}
export type FullState=ReturnType<BotApi['fullState']>;
export function compactState(full:FullState,usedSwitches:number[]=[]){
 const withoutScreen=<V extends {screen:unknown}>({screen,...rest}:V)=>rest;
 return {state:full.state,stageIndex:full.stageIndex,challenge:full.challenge,time:full.time,stageTime:full.stageTime,hp:full.hp,position:full.position,yaw:full.yaw,pitch:full.pitch,weapon:full.weapon,energy:full.energy,potions:full.potions,bigPotions:full.bigPotions,antidotes:full.antidotes,elixirs:full.elixirs,parupuns:full.parupuns,inventory:full.inventory,score:full.score,keyCount:full.keyCount,objective:full.objective,
  enemies:full.train?[]:full.enemies.filter(e=>e.hp>0&&e.distance<30).sort((a,b)=>a.distance-b.distance).slice(0,12).map(e=>({id:e.id,kind:e.kind,hp:e.hp,maxHp:e.maxHp,distance:e.distance,lineOfSight:e.lineOfSight,dormant:e.dormant,state:e.attack.state,screen:e.screen})),
  goals:{switches:full.goals.switches.filter(s=>!usedSwitches.includes(s.id)).map(withoutScreen),doors:full.goals.doors.filter(d=>!d.open).map(withoutScreen),items:full.goals.items.filter(i=>!i.taken).map(withoutScreen)},
  train:full.train?{...full.train,targets:full.train.targets.filter(t=>t.hp>0&&t.screen.onScreen).sort((a,b)=>a.distance-b.distance).slice(0,10)}:null,
  checkpoint:full.checkpoint,lastDamage:full.lastDamage,pickups:full.pickups,objectiveHint:full.objectiveHint,events:full.events.slice(-10)};
}
export type CompactState=ReturnType<typeof compactState>;
const controlNames=['walkTo','fight','playRail','lookAtEnemy','restartWhenReady','getState','setKeys','look','lookAt','fireAt','fireAtEnemy','interact','heal','antidote','selectWeapon','pause','resume','start','restart','dismissCard','setInputMode','setTimeScale','step','routeTo','help','snapshot'] as const;
export type BotControls=Pick<BotApi,typeof controlNames[number]>;
/** Expose bound controls only, never the live Game object or internal clock/event hooks. */
export function installBotApi(game:Game,random:()=>number=Math.random){const api=new BotApi(game,random),controls=Object.fromEntries(controlNames.map(name=>[name,(api[name] as (...args:never[])=>unknown).bind(api)])) as unknown as BotControls;window.__toybox=Object.freeze(controls);return controls;}
declare global{interface Window{__toybox?:BotControls;}}
