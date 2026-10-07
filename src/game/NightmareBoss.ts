import * as T from 'three';
import type {Game} from './Game';
import {Enemy} from './Enemy';
import {enemySizeMultiplier} from './EnemyScale';
import {bossPhase,nightmareBossPattern} from './NightmareTactics';
import {nightmareHealth} from './PowerEffects';
import {canMoveAt,sightAt} from '../world/layout';
import {supportHeight} from '../world/CastleFloors';
import {decorateProjectile} from '../effects/ProjectileLook';

function tell(g:Game,e:Enemy,angle:number,color=0x72e4ef){const group=new T.Group(),p=e.group.position;for(const side of [-1,1]){const a=angle+side*.52,points=[new T.Vector3(p.x,e.floorY+.08,p.z),new T.Vector3(p.x+Math.sin(a)*12,e.floorY+.08,p.z+Math.cos(a)*12)];group.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.65})));}g.scene.add(group);e.group.userData.nightmareTell=group;}
export function cancelNightmareBoss(g:Game,e:Enemy){const data=e.group.userData;if(data.nightmareTell){g.disposeGroup(data.nightmareTell);delete data.nightmareTell;}if(data.bossSummons){for(const s of data.bossSummons.actors as Enemy[]){s.alive=false;s.group.visible=false;}delete data.bossSummons;}}
export function clearNightmareTells(g:Game){for(const e of g.enemies)cancelNightmareBoss(g,e);}
function summon(g:Game,e:Enemy){const p=e.group.position,actors:Enemy[]=[];for(let n=0;n<24&&actors.length<Math.min(3,g.stageIndex+1);n++){const angle=n*2.399963,x=p.x+Math.sin(angle)*6,z=p.z+Math.cos(angle)*6,floor=e.floorY;if(Math.hypot(x-g.position.x,z-g.position.z)<6||!canMoveAt(x,z,floor+1.65,g.gate)||g.stageIndex===2&&Math.abs(supportHeight(x,z,floor)-floor)>.5||g.enemies.some(other=>other.alive&&Math.hypot(other.group.position.x-x,other.group.position.z-z)<3))continue;const minion=new Enemy(actors.length%2?'BOTTY':'PUNI',x,z);minion.floorY=floor;minion.group.position.y=floor;minion.baseScale=[.84,1.26,1.74][g.stageIndex]*enemySizeMultiplier;minion.group.scale.setScalar(minion.baseScale);minion.tier=Math.min(4,g.stageIndex+2);minion.hp=minion.maxHp=nightmareHealth(minion.kind,3,55);minion.alive=false;minion.group.visible=false;g.enemies.push(minion);g.scene.add(minion.group);g.burst(new T.Vector3(x,floor+.2,z),0xaaffdf);actors.push(minion);}e.group.userData.bossSummons={at:g.time+1.4,actors};}
export function updateNightmareBoss(g:Game,e:Enemy,dt:number,visible:boolean,allowed:boolean){
 const data=e.group.userData,phase=bossPhase(e.hp,e.maxHp),p=e.group.position;p.y=e.floorY;
 if(data.bossPhase!==phase){const old=data.bossPhase;data.bossPhase=phase;if(old!==undefined){g.notify(phase===1?'ボスの うごきが かわった！':'ボスが ほんきだ！');e.cooldown=Math.max(e.cooldown,.7);}if(phase===2&&!data.phaseSummoned){data.phaseSummoned=true;summon(g,e);}}
 if(data.bossSummons&&g.time>=data.bossSummons.at){for(const s of data.bossSummons.actors as Enemy[]){s.alive=true;s.group.visible=s.body.visible=true;s.alert=true;s.cooldown=1.3;s.brain.hit(g.position.x,g.position.z,g.time);}delete data.bossSummons;}
 if(g.time<e.dashUntil){const nx=p.x+e.dashX*dt,nz=p.z+e.dashZ*dt;if(canMoveAt(nx,nz,e.floorY+1.65,g.gate)&&(g.stageIndex!==2||Math.abs(supportHeight(nx,nz,e.floorY)-e.floorY)<.5)){p.x=nx;p.z=nz;}else e.dashUntil=0;if(!e.dashHit&&Math.hypot(p.x-g.position.x,p.z-g.position.z)<3.2&&Math.abs(e.floorY-(g.position.y-1.65))<2&&sightAt(p.x,p.z,e.floorY+1.65,g.position.x,g.position.z,g.position.y,g.gate)){g.hurt(24+g.stageIndex*8);e.dashHit=true;}return;}
 if(g.time<(data.bossRecovery??0))return;
 if(e.telegraph){
  e.body.rotation.x=-.1;if(g.time<e.telegraph)return;e.telegraph=0;e.body.rotation.x=0;const pattern=data.bossPattern as string,aim=data.bossAim as {x:number;y:number;z:number};const direction=new T.Vector3(aim.x-p.x,0,aim.z-p.z).normalize(),angle=Math.atan2(direction.x,direction.z);
  if(data.nightmareTell){g.disposeGroup(data.nightmareTell);delete data.nightmareTell;}
  if(pattern==='charge'){e.dashX=direction.x*18;e.dashZ=direction.z*18;e.dashUntil=g.time+.55;e.dashHit=false;data.bossRecovery=e.dashUntil+1;}
  else{const angles=pattern==='gap'?Array.from({length:phase===2?20:16},(_,n)=>n*Math.PI*2/(phase===2?20:16)).filter(a=>Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)))>.52):pattern==='stun'?[-.12,.12]:phase===2?[-.32,-.16,0,.16,.32]:[-.2,0,.2];
   const origin=p.clone().add(new T.Vector3(0,2.2*e.baseScale,0));for(const a of angles){const vector=pattern==='gap'?new T.Vector3(Math.sin(a),(aim.y-origin.y)/Math.max(6,Math.hypot(aim.x-p.x,aim.z-p.z)),Math.cos(a)).normalize():new T.Vector3(aim.x-origin.x,aim.y-origin.y,aim.z-origin.z).normalize().applyAxisAngle(new T.Vector3(0,1,0),a),kind=pattern==='poison'?3:pattern==='stun'?4:0,m=new T.Mesh(new T.SphereGeometry(.27,10,8),new T.MeshStandardMaterial({color:kind===3?0x95d96c:kind===4?0x8fe4ff:0xffa7cd}));decorateProjectile(m,true,kind,g.input.touch,vector);m.position.copy(origin);g.scene.add(m);g.shots.push({m,v:vector.multiplyScalar(9+g.stageIndex*2+phase),life:5,damage:16+g.stageIndex*6,enemy:true,kind});}
   data.bossRecovery=g.time+(pattern==='stun'?3.4:phase===2?.8:1.1);
  }
  e.attackCycle++;e.cooldown=phase===2?1.6:phase===1?2:2.4;g.sound.effect(280);return;
 }
 if(!visible||!allowed||e.cooldown>0)return;
 const pattern=nightmareBossPattern(phase,e.attackCycle);data.bossPattern=pattern;data.bossAim={x:g.position.x,y:g.position.y,z:g.position.z};e.telegraph=g.time+(pattern==='charge'?1:pattern==='gap'?.9:.65);if(pattern==='gap'||pattern==='charge')tell(g,e,Math.atan2(g.position.x-p.x,g.position.z-p.z),pattern==='charge'?0xffb65d:0x72e4ef);g.sound.effect(380);if(pattern==='charge')g.notify('ボスが かまえた！ よこへ よけよう');else if(pattern==='gap')g.notify('あおい みちが あいている！');else if(pattern==='stun')g.notify('あおい たま！ まひに きをつけて');
}
