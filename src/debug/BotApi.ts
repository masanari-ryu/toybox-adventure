import * as T from 'three';
import type {Game} from '../game/Game';
import type {Enemy} from '../game/Enemy';
import {fire} from '../game/Combat';
import {easyDormant} from '../game/EasyMode';
import {sightAt,canMoveAt} from '../world/layout';
import {doors,switches,bossEntranceClosed} from '../world/Threats';
import {topHeight,supportHeight} from '../world/CastleFloors';
import {route,canTraverseCastle} from '../world/Navigation';
import {stages} from '../stages/Stages';
import {railEnemyScale} from '../game/EnemyScale';
import {railFrame} from '../rail/RailCourse';
import {challenges} from '../game/Challenge';
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
type Event={type:string;time:number;stageIndex:number;position:{x:number;y:number;z:number};[key:string]:unknown};
export class BotApi{
 private scale=0;private last=0;private doorStates=doors.map(d=>d.open);private events=new Ring<Event>();private stepping=false;
 constructor(private g:Game,private random:()=>number){this.hookEvents();g.frame=(ms:number)=>this.frame(ms);}
 private record(type:string,details:Record<string,unknown>={}){const g=this.g;this.events.add({type,time:g.time,stageIndex:g.stageIndex,position:point(g.position),...details});}
 private pollDoors(){for(const [n,d]of doors.entries())if(this.doorStates[n]!==d.open)this.record(d.open?'door-open':'door-close',{id:d.id});this.doorStates=doors.map(d=>d.open);}
 private hookEvents(){const g=this.g,hurt=g.hurt.bind(g),damage=g.damage.bind(g),take=g.takeSupply.bind(g),load=g.loadStage.bind(g),activate=g.activateSwitch.bind(g);
  g.hurt=n=>{const hp=g.hp,state=g.state;hurt(n);if(g.hp<hp)this.record('damage',{amount:hp-g.hp,hp:g.hp});if(state!=='over'&&g.state==='over')this.record('game-over');};
  g.damage=(e,n,w)=>{const alive=e.alive,id=this.enemyId(e);damage(e,n,w);if(alive&&!e.alive)this.record('defeat',{id,kind:e.kind});this.pollDoors();};
  g.takeSupply=k=>{const result=take(k);if(result)this.record('pickup',{kind:k,weapon:g.input.weapon});return result;};
  g.loadStage=n=>{load(n);this.doorStates=doors.map(d=>d.open);this.record('stage',{stageIndex:n});};
  g.activateSwitch=s=>{const before=doors.map(d=>d.open),gate=g.gate;activate(s);for(const [n,d]of doors.entries())if(before[n]!==d.open)this.record(d.open?'door-open':'door-close',{id:d.id});this.doorStates=doors.map(d=>d.open);if(!gate&&g.gate)this.record('boss-entrance-open');};
 }
 private enemyId(e:Enemy){return `enemy-${this.g.stageIndex}-${this.g.enemies.indexOf(e)}`;}
 private center(e:Enemy){return e.group.position.clone().add(new T.Vector3(0,e.kind==='KING PUNI'?2.2*e.baseScale:e.baseScale,0));}
 private project(p:T.Vector3,visible=true){return screenPoint(this.g.camera,p,this.g.renderer.domElement.getBoundingClientRect(),visible);}
 getState(){const g=this.g,stage=stages[g.stageIndex],floor=(x:number,z:number)=>g.stageIndex===2?topHeight(x,z):0;
  const located=(x:number,z:number,y=floor(x,z))=>{const position={x,y,z};return {position,screen:this.project(new T.Vector3(x,y+1.1,z))};};
  return {state:g.state,stageIndex:g.stageIndex,challenge:g.challenge,time:g.time,stageTime:g.stageTime,endingTime:g.endingTime,timeScale:this.scale,ready:!g.visuals.preparing,
   hp:g.hp,position:point(g.position),yaw:g.yaw,pitch:g.pitch,weapon:g.input.weapon,energy:g.energy,potions:g.supplies.potions,bigPotions:g.supplies.bigPotions,antidotes:g.supplies.antidotes,score:g.score,keyCount:g.keyCount,
   inventory:{...g.supplies},weapons:g.arsenal.choices(),weaponLevels:[...g.arsenal.levels],poisonUntil:g.poisonUntil,paralyzedUntil:g.paralyzedUntil,gate:g.gate,bossClear:g.bossClear,battery:g.battery,stageFragment:g.stageFragment,
   enemies:g.ride?g.ride.targets.flatMap((t,n)=>t.hp>0?[{id:`rail-${g.stageIndex}-${n}`,kind:t.enemy.kind,hp:t.hp,maxHp:(t.enemy.kind==='BOTTY'?3:1)*challenges[g.challenge].hp,home:{x:t.origin.x,z:t.origin.z},position:point(t.enemy.group.position),distance:t.enemy.group.position.distanceTo(g.position),visible:t.enemy.group.visible&&t.enemy.body.visible,dormant:false,lineOfSight:t.enemy.group.visible,screen:this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible),attack:{state:'Chase',action:null,until:0,aim:null}}]:[]):g.enemies.flatMap((e,n)=>e.alive?[{id:`enemy-${g.stageIndex}-${n}`,kind:e.kind,hp:e.hp,maxHp:e.maxHp,home:{...e.home},position:point(e.group.position),distance:e.group.position.distanceTo(g.position),visible:e.group.visible&&e.body.visible,dormant:easyDormant(e),lineOfSight:!easyDormant(e)&&!e.group.userData.bossHidden&&sightAt(g.position.x,g.position.z,g.position.y,this.center(e).x,this.center(e).z,this.center(e).y,g.gate),screen:this.project(this.center(e),e.group.visible&&e.body.visible),attack:{state:e.group.userData.bossCombat?.mode??e.state,action:e.group.userData.bossCombat?.action??null,until:e.telegraph,aim:e.group.userData.bossCombat?.aim?{...e.group.userData.bossCombat.aim}:null}}]:[]),
   goals:{switches:switches.map((s,n)=>({id:n,kind:s.kind,door:s.door,...located(s.x,s.z)})),doors:doors.map(d=>({id:d.id,open:d.open,...located(d.x,d.z)})),items:g.world.items.map((i,n)=>({id:n,kind:i.kind,taken:i.taken,visible:i.mesh.visible,position:point(i.mesh.position),screen:this.project(i.mesh.position,i.mesh.visible&&!i.taken)})),exit:{...located(...stage.exit),visible:g.world.portal.visible},fragment:{...located(...stage.key),taken:g.stageFragment},chest:{position:point(g.world.chest.position),open:g.world.chestOpened,screen:this.project(g.world.chest.position.clone().add(new T.Vector3(0,.6,0)))},bossEntrance:g.stageIndex===2?{...located(90,30,12),open:g.gate&&!bossEntranceClosed,activated:g.coreEnabled}:{...located(g.stageIndex===0?58:70,g.stageIndex===0?30:18),open:!!doors[g.stageIndex===0?3:2]?.open},waypoints:stage.route.map(([x,z])=>({...located(x,z)}))},
   dialog:g.state==='ending'?{text:document.getElementById('ending-caption')?.textContent??'',buttons:[]}:['title','paused','over','clear'].includes(g.state)?{text:document.getElementById('description')?.textContent??'',buttons:Array.from(document.querySelectorAll<HTMLButtonElement>('#overlay button')).filter(b=>!b.hidden&&b.getBoundingClientRect().width>0).map(b=>b.textContent??'')}:null,objective:document.getElementById('objective')?.textContent??'',interaction:{visible:!document.getElementById('interact')!.hidden,text:document.getElementById('interact')!.textContent??''},card:g.card.open?{title:document.getElementById('card-title')!.textContent??'',text:document.getElementById('card-description')!.textContent??'',buttons:Array.from(document.querySelectorAll('#card button')).filter(b=>!(b as HTMLElement).hidden).map(b=>b.textContent??'')}:null,
   projectiles:g.shots.filter(s=>s.enemy).map(s=>({position:point(s.m.position),velocity:point(s.v),screen:this.project(s.m.position)})),
   train:g.ride?{progress:g.ride.progress.fraction,elapsed:g.ride.progress.elapsed,kills:g.ride.kills,targets:g.ride.targets.flatMap((t,n)=>t.hp>0?[{id:n,hp:t.hp,position:point(t.enemy.group.position),distance:t.enemy.group.position.distanceTo(g.position),screen:this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible)}]:[])}:null,
   events:this.events.read()};
 }
 setKeys(codes:string[]){if(!Array.isArray(codes)||codes.some(c=>typeof c!=='string'))throw new TypeError('Expected key codes');this.g.input.keys=new Set(codes);}
 private orient(){const g=this.g;g.camera.position.copy(g.position);g.camera.rotation.order='YXZ';g.camera.rotation.set(g.pitch,g.yaw,0);}
 look(dyaw:number,dpitch=0){if(!Number.isFinite(dyaw)||!Number.isFinite(dpitch))throw new TypeError('Invalid look delta');const g=this.g;if(g.ride){g.ride.lookYaw=T.MathUtils.clamp(g.ride.lookYaw+dyaw,-.85,.85);g.ride.lookPitch=T.MathUtils.clamp(g.ride.lookPitch+dpitch,-.55,.65);g.ride.pose(g.ride.progress.fraction);}else{g.yaw+=dyaw;g.pitch=T.MathUtils.clamp(g.pitch+dpitch,-1.15,1.15);this.orient();}}
 lookAt(x:number,z:number){if(!Number.isFinite(x)||!Number.isFinite(z))throw new TypeError('Invalid target');if(this.g.ride){const r=this.g.ride,local=new T.Vector3(x-this.g.position.x,0,z-this.g.position.z).applyQuaternion(railFrame(r.curve,r.progress.fraction).q.clone().invert());r.lookYaw=T.MathUtils.clamp(Math.atan2(-local.x,-local.z),-.85,.85);r.lookPitch=T.MathUtils.clamp(Math.atan2(local.y,Math.hypot(local.x,local.z)),-.55,.65);r.pose(r.progress.fraction);return true;}this.g.yaw=Math.atan2(this.g.position.x-x,this.g.position.z-z);this.orient();return true;}
 fireAt(sx:number,sy:number){const g=this.g;if(g.state!=='playing'||g.visuals.preparing||g.orientationBlocked||!Number.isFinite(sx)||!Number.isFinite(sy))return false;const r=g.renderer.domElement.getBoundingClientRect();if(sx<r.left||sx>r.right||sy<r.top||sy>r.bottom)return false;const aim={x:(sx-r.left)/r.width*2-1,y:1-(sy-r.top)/r.height*2};if(g.input.touch){g.input.tapAim=aim;g.input.mouseAim=null;}else{g.input.mouseAim=aim;g.input.tapAim=null;}const before=g.shotTime;if(g.ride){const before=g.ride.shotAt,alive=g.ride.targets.map(t=>t.hp>0);withRandom(this.random,()=>g.ride!.fire());for(const [n,t]of g.ride.targets.entries())if(alive[n]&&t.hp<=0)this.record('defeat',{id:`rail-${g.stageIndex}-${n}`,kind:t.enemy.kind});return g.ride.shotAt>before;}withRandom(this.random,()=>fire(g));return g.shotTime>before;}
 fireAtEnemy(id:string){if(this.g.ride){const n=this.g.ride.targets.findIndex((t,n)=>`rail-${this.g.stageIndex}-${n}`===id&&t.hp>0);if(n<0)return false;const t=this.g.ride.targets[n],s=this.project(t.enemy.group.position.clone().add(new T.Vector3(0,1.6*railEnemyScale/1.3,0)),t.enemy.group.visible);return s.onScreen&&this.fireAt(s.x,s.y);}const e=this.g.enemies.find(e=>this.enemyId(e)===id&&e.alive);if(!e||easyDormant(e)||!e.group.visible||e.group.userData.bossHidden)return false;const s=this.project(this.center(e));return s.onScreen&&this.fireAt(s.x,s.y);}
 interact(){if(this.g.state==='playing')this.g.input.interact=true;}
 heal(){if(this.g.state==='playing')this.g.input.heal=true;}
 antidote(){if(this.g.state==='playing')this.g.input.antidote=true;}
 selectWeapon(n:number){if(!Number.isInteger(n))return false;this.g.input.weapon=this.g.arsenal.select(n,this.g.input.weapon);this.g.updateHud();return this.g.input.weapon===n;}
 pause(){if(this.g.state==='playing')this.g.pause();}
 resume(){if(this.g.state==='paused'){this.g.resume();if(!this.g.ride)this.orient();}}
 async start(difficulty:0|1|2=0){const g=this.g;if(g.state!=='title'||![0,1,2].includes(difficulty))return false;withRandom(this.random,()=>{g.challenge=difficulty;g.loadStage(0);g.renderChallenges();});await g.visuals.ready;withRandom(this.random,()=>g.start());return true;}
 async restart(){if(this.g.state!=='over')return false;await new Promise(r=>setTimeout(r,Math.max(0,this.g.deathReadyAt-performance.now())));withRandom(this.random,()=>this.g.start());await this.g.visuals.ready;return true;}
 dismissCard(){if(this.g.card.open)withRandom(this.random,()=>this.g.card.close());this.pollDoors();if(this.g.state==='playing'&&!this.g.ride){this.orient();this.g.gun.position.set(0,-.18,-.6);}}
 setInputMode(mode:'mouse'|'touch'){if(mode!=='mouse'&&mode!=='touch')throw new TypeError('Invalid input mode');this.g.input.reset();this.g.input.touch=mode==='touch';document.body.classList.toggle('touch',this.g.input.touch);this.g.resize();}
 setTimeScale(s:number){if(!Number.isFinite(s)||s<0||s>100)throw new RangeError('Time scale must be between 0 and 100');this.scale=s;this.last=0;}
 private advance(dt:number){const g=this.g;if(g.visuals.preparing||g.orientationBlocked)return false;if(g.state==='playing')g.update(dt);else if(g.state==='ending')g.updateEnding(dt);else return false;this.pollDoors();return true;}
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
 private draw(){const g=this.g;g.gun.visible=g.state==='playing'||g.state==='review'&&!g.ending;g.renderVisuals();g.visuals.render();}
 private frame(ms:number){const elapsed=this.last?Math.min(.04,Math.max(0,(ms-this.last)/1000)):0;this.last=ms;if(!this.stepping&&this.scale>0)withRandom(this.random,()=>fixedSteps(elapsed*this.scale,1/60,dt=>this.advance(dt)));if(!this.g.visuals.preparing)this.draw();requestAnimationFrame(t=>this.g.frame(t));}
 help(){return 'getState(); setKeys(codes); look(dyaw, dpitch); lookAt(x, z); fireAt(sx, sy); fireAtEnemy(id); interact(); heal(); antidote(); selectWeapon(index); pause(); resume(); start(0|1|2); restart(); dismissCard(); setInputMode("mouse"|"touch"); setTimeScale(0..100); await step(seconds, fixedDt=1/60); routeTo(x,z); await snapshot();';}
 async snapshot(){await this.g.visuals.ready;this.draw();return {state:this.getState(),png:this.g.renderer.domElement.toDataURL('image/png')};}
}
const controlNames=['getState','setKeys','look','lookAt','fireAt','fireAtEnemy','interact','heal','antidote','selectWeapon','pause','resume','start','restart','dismissCard','setInputMode','setTimeScale','step','routeTo','help','snapshot'] as const;
export type BotControls=Pick<BotApi,typeof controlNames[number]>;
/** Expose bound controls only, never the live Game object or internal clock/event hooks. */
export function installBotApi(game:Game,random:()=>number=Math.random){const api=new BotApi(game,random),controls=Object.fromEntries(controlNames.map(name=>[name,(api[name] as (...args:never[])=>unknown).bind(api)])) as unknown as BotControls;window.__toybox=Object.freeze(controls);return controls;}
declare global{interface Window{__toybox?:BotControls;}}
