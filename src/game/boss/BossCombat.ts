import {prepareBossAdds,tickBossAdds} from './BossAdds';
import * as T from 'three';
import type {Game}from '../Game';import type {Enemy}from '../Enemy';
import {bossState,type BossState,type BossAction}from './BossState';import {bossSettings as c,bossSecondForm,rulerAttack}from './BossSettings';
import {bossCanMove,bossPositions,bossWalk,safeBossDestination}from './BossSpace';import {bossVolley}from './BossProjectiles';import {createIllusions,tickIllusions,destroyIllusion}from './BossIllusions';import {prepareBossAppearance,floorTell,clearTell,stunnedStars,bossPose}from './BossVisuals';import {sightAt}from '../../world/layout';
export {destroyIllusion};
function recover(g:Game,e:Enemy,s:BossState,seconds:number){clearTell(g,s);s.mode='Recovery';s.until=g.time+seconds;e.telegraph=0;e.dashUntil=0;e.group.userData.bossHidden=false;e.body.visible=true;}
function windup(g:Game,e:Enemy,s:BossState,action:BossAction){s.mode='Windup';s.action=action;s.hit=false;s.aim={x:g.position.x,y:g.position.y,z:g.position.z};s.until=g.time+c.windup[g.challenge]*(action==='slam'?1.2:1);e.telegraph=s.until;e.group.rotation.y=Math.atan2(e.group.position.x-s.aim.x,e.group.position.z-s.aim.z);
 if(action==='slam')floorTell(g,e,s,'circle',s.second?c.charger.enragedRadius:c.charger.slamRadius);
 else if(action==='charge'||action==='advance')floorTell(g,e,s,'line');
 else if(action==='slash')floorTell(g,e,s,'circle',c.ruler.slashReach);
 else if(action==='warp'){s.warp=bossPositions(g,e,1)[0];if(s.warp)floorTell(g,e,s,'warp',2,s.warp);s.until=g.time+c.magician.warpWarning; e.telegraph=s.until;}
 else floorTell(g,e,s,'circle',1.5);g.sound.effect(action==='charge'?260:action==='illusion'?720:440);
}
function frontHit(g:Game,e:Enemy,s:BossState,reach:number){const p=e.group.position,ax=s.aim.x-p.x,az=s.aim.z-p.z,dx=g.position.x-p.x,dz=g.position.z-p.z,d=Math.hypot(dx,dz);return d<=reach&&Math.abs(g.position.y-1.65-e.floorY)<2&& (ax*dx+az*dz)/Math.max(.001,Math.hypot(ax,az)*d)>.4&&sightAt(p.x,p.z,e.floorY+1.65,g.position.x,g.position.z,g.position.y,g.gate);}
function attack(g:Game,e:Enemy,s:BossState){clearTell(g,s);e.telegraph=0;const damage=c.damage[g.stageIndex]*(g.challenge>=2?1.1:1),p=e.group.position;e.attackCycle++;
 if(s.action==='charge'||s.action==='advance'){const dx=s.aim.x-p.x,dz=s.aim.z-p.z,d=Math.hypot(dx,dz),speed=s.action==='advance'?12:s.second&&s.nightmare?c.charger.nightmareSpeed:(s.second?c.charger.enragedSpeed:c.charger.speed)*c.speed[g.challenge];e.dashX=dx/Math.max(.01,d)*speed;e.dashZ=dz/Math.max(.01,d)*speed;s.mode='Attack';s.until=g.time+Math.min(c.charger.duration,Math.max(.25,(d+4)/speed));e.dashUntil=s.until;return;}
 if(s.action==='slam'){const radius=s.second?c.charger.enragedRadius:c.charger.slamRadius;if(Math.hypot(p.x-g.position.x,p.z-g.position.z)<radius&&Math.abs(g.position.y-1.65-e.floorY)<2&&sightAt(p.x,p.z,e.floorY+1.65,g.position.x,g.position.z,g.position.y,g.gate))g.hurt(damage);e.body.scale.y=.75;g.burst(new T.Vector3(p.x,e.floorY+.2,p.z),0xffd7a5);g.sound.impact();recover(g,e,s,c.recovery[g.challenge]);return;}
 if(s.action==='warp'){let point=s.warp;if(!point||!safeBossDestination(g,e,point.x,point.z))point=bossPositions(g,e,1)[0];if(point){g.burst(p.clone().add(new T.Vector3(0,1,0)),0xb7e9ff);p.set(point.x,e.floorY,point.z);g.burst(p.clone().add(new T.Vector3(0,1,0)),0xb7e9ff);}s.nextWarp=g.time+(s.second?c.magician.enragedWarpCooldown:c.magician.warpCooldown);recover(g,e,s,c.magician.warpRecovery);return;}
 if(s.action==='illusion'){createIllusions(g,e,s);recover(g,e,s,c.recovery[g.challenge]);return;}
 if(s.action==='slash'){s.mode='Attack';s.remaining=s.nightmare&&s.second?c.ruler.nightmareSlashes:c.ruler.slashes;s.until=g.time;return;}
 const angles=s.action==='fan'?[-.56,-.28,0,.28,.56]:s.action==='magic'?s.second?[-.22,0,.22]:[0]:[0];const poison=(g.stageIndex===1||g.stageIndex===2)&&s.second&&e.attackCycle%3===0,paralysis=g.stageIndex===2&&s.second&&e.attackCycle%4===0;
 bossVolley(g,e,angles,s.aim,damage,paralysis?4:poison?3:0);if(g.stageIndex===2&&s.nightmare&&s.second&&s.action==='fan')s.chain=1;recover(g,e,s,paralysis?3.4:c.recovery[g.challenge]);
}
export function cancelBossCombat(g:Game,e:Enemy){const s=e.group.userData.bossCombat as BossState|undefined;if(s){clearTell(g,s);s.mode='Dead';s.cloneActive=false;if(s.adds){for(const a of s.adds.actors){a.alive=false;a.group.visible=false;}s.adds=undefined;}for(const clone of s.clones){clone.alive=false;clone.telegraph=0;clone.group.visible=false;}if(s.stars){s.stars.visible=false;}e.group.userData.bossHidden=false;e.telegraph=e.dashUntil=0;}for(const shot of g.shots)if(shot.bossOwner===e){shot.life=0;shot.damage=0;}}
export function clearBossCombat(g:Game){for(const e of g.enemies)if(e.kind==='KING PUNI'&&!e.group.userData.bossClone){cancelBossCombat(g,e);delete e.group.userData.bossCombat;}}
export function updateBoss(g:Game,e:Enemy,dt:number,visible:boolean,allowed=true,attackers?:Set<Enemy>){
 if(!e.alive)return;prepareBossAppearance(e,g.stageIndex);const s=bossState(e);s.nightmare=g.challenge===3;e.group.position.y=e.floorY;if(s.mode==='Windup')e.group.rotation.y=Math.atan2(e.group.position.x-s.aim.x,e.group.position.z-s.aim.z);else if(s.mode==='Attack'&&s.action!=='slash')e.group.rotation.y=Math.atan2(-e.dashX,-e.dashZ);
 const second=bossSecondForm(e.hp,e.maxHp);if(second&&!s.second){s.second=true;clearTell(g,s);if(s.mode!=='Stunned'&&s.mode!=='Recovery'){s.mode='Transition';s.until=g.time+c.transition;}e.telegraph=e.dashUntil=0;s.chain=0;e.group.userData.bossHidden=false;e.body.visible=true;g.sound.effect(260);g.burst(e.group.position.clone().add(new T.Vector3(0,e.baseScale*2,0)),0xb8fff0);}e.group.userData.bossPhase=s.second?1:0;if(s.second)prepareBossAdds(g,e,s);if(s.mode!=='Transition')tickBossAdds(g,s);
 if(s.mode!=='Transition'&&tickIllusions(g,e,s,dt,attackers)){recover(g,e,s,2.5);}
 bossPose(e,s,g.time);
 if(s.mode==='Transition'){e.body.rotation.z=Math.sin(g.time*14)*.07;if(g.time<s.until)return;s.mode='Chase';}
 if(s.mode==='Stunned'){e.stunned=s.until;if(g.time<s.until)return;s.mode='Recovery';s.until=g.time+.6;e.stunned=0;}
 if(s.mode==='Recovery'){if(s.retreatUntil&&g.time<s.retreatUntil)bossWalk(g,e,g.position,dt,6,true);if(g.time<s.until)return;if(s.chain>0){s.chain--;windup(g,e,s,g.stageIndex===2?'advance':'charge');return;}s.mode='Chase';}
 if(s.mode==='Windup'){if(s.action==='warp'&&s.warp&&g.time>s.until-.22){e.group.userData.bossHidden=true;e.body.visible=false;}if(g.time<s.until)return;attack(g,e,s);return;}
 if(s.mode==='Attack'){
  if(s.action==='slash'){if(g.time<s.until)return;clearTell(g,s);e.telegraph=0;if(frontHit(g,e,s,c.ruler.slashReach))g.hurt(c.damage[2]*(g.challenge>=2?1.1:1));g.sound.effect(560);s.remaining--;if(s.remaining>0){s.aim={x:g.position.x,y:g.position.y,z:g.position.z};s.until=g.time+Math.max(.55,c.ruler.slashInterval*c.windup[g.challenge]);floorTell(g,e,s,'circle',c.ruler.slashReach);e.telegraph=s.until;}else{clearTell(g,s);if(s.nightmare&&s.second)s.retreatUntil=g.time+.45;recover(g,e,s,c.recovery[g.challenge]+.4);}return;}
  const steps=Math.max(1,Math.ceil(Math.hypot(e.dashX,e.dashZ)*dt/.2));let blocked=false;for(let n=0;n<steps;n++){const x=e.group.position.x+e.dashX*dt/steps,z=e.group.position.z+e.dashZ*dt/steps;if(!bossCanMove(g,e,x,z)){blocked=true;break;}e.group.position.x=x;e.group.position.z=z;if(!s.hit&&Math.hypot(x-g.position.x,z-g.position.z)<3&&Math.abs(e.floorY-(g.position.y-1.65))<2){s.hit=true;g.hurt(c.damage[g.stageIndex]*(g.challenge>=2?1.1:1));}}
  if(blocked&&g.stageIndex===0){s.mode='Stunned';s.until=g.time+(s.nightmare&&s.second?c.nightmareWallStun:c.wallStun[g.challenge]);s.chain=0;e.telegraph=e.dashUntil=0;e.stunned=s.until;stunnedStars(e,s);g.sound.impact();return;}
  if(blocked||g.time>=s.until){e.dashUntil=0;if(g.stageIndex===0&&s.nightmare&&s.second&&s.chain===0&&e.group.userData.bossDouble!==e.attackCycle){s.chain=1;e.group.userData.bossDouble=e.attackCycle+1;}recover(g,e,s,c.recovery[g.challenge]);}return;
 }
 const distance=Math.hypot(g.position.x-e.group.position.x,g.position.z-e.group.position.z),range=e.radius*e.baseScale+3.2;
 if(!visible){bossWalk(g,e,e.brain.last,dt,3.5*c.speed[g.challenge]);return;}if(!allowed)return;
 if(g.stageIndex===0){const decision=e.group.userData.chargerDecision??0,action=decision%2?'slam':'charge';if(action==='slam'&&distance>c.charger.slamRadius+6){e.group.userData.chargerDecision=decision+1;windup(g,e,s,'charge');return;}if(action==='slam'&&distance>c.charger.slamRadius-1){bossWalk(g,e,g.position,dt,4.5*c.speed[g.challenge]*(s.second?1.2:1));return;}e.group.userData.chargerDecision=decision+1;windup(g,e,s,action);}
 else if(g.stageIndex===1){if(g.time>=s.nextIllusion&&!s.cloneActive&&e.attackCycle%3===1)windup(g,e,s,'illusion');else if(g.time>=s.nextWarp&&e.attackCycle%3===2)windup(g,e,s,'warp');else{if(distance<range-1)bossWalk(g,e,g.position,dt,3,true);windup(g,e,s,'magic');}}
 else{const action=s.second&&s.nightmare&&g.input.weapon===5&&distance>=c.ruler.far&&e.attackCycle%3===1?'advance':rulerAttack(distance,s.second,s.nightmare,e.attackCycle);if(distance<range-1&&action!=='slash')bossWalk(g,e,g.position,dt,3,true);windup(g,e,s,action);}
}
