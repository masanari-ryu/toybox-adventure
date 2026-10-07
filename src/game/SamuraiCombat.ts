import {enemyPressure,enemyWindup,enemyRecovery} from './EnemyPressure';
import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {canMove,lineOfSight} from '../world/layout';
/** A committed charge can be sidestepped; it never tracks after launch. */
export function updateSamurai(g:Game,e:Enemy,dt:number,visible:boolean,dist:number,allowed=true){
 if(g.challenge===3)return updateNightmareSamurai(g,e,dt,visible,dist,allowed);
 const p=e.group.position,pattern=e.attackCycle%3;
 if(g.time<e.dashUntil){
  const nx=p.x+e.dashX*dt*enemyPressure,nz=p.z+e.dashZ*dt*enemyPressure;
  if(canMove(nx,nz,g.gate)){p.x=nx;p.z=nz;}else e.dashUntil=0;
  if(!e.dashHit&&Math.hypot(p.x-g.position.x,p.z-g.position.z)<3.3&&lineOfSight(p.x,p.z,g.position.x,g.position.z,g.gate)){g.hurt(34);e.dashHit=true;g.burst(p,0x99ffee);}
  e.body.rotation.x=.3;if(e.sword)e.sword.rotation.z=-1.7;return true;
 }
 e.body.rotation.x=0;
 if(e.telegraph){
  const remaining=e.telegraph-g.time;
  if(e.sword)e.sword.rotation.z=pattern===2?.3+Math.max(0,remaining)*1.2:1.3;
  e.body.rotation.x=pattern===1?-.18:-.08;
  if(remaining>0)return true;
  e.telegraph=0;
  if(pattern===1){const dx=g.position.x-p.x,dz=g.position.z-p.z,d=Math.max(.01,Math.hypot(dx,dz));e.dashX=dx/d*19;e.dashZ=dz/d*19;e.dashUntil=g.time+enemyWindup(Math.min(.9,d/19+.12));e.dashHit=false;}
  else if(dist<(pattern===2?4.8:3.8)&&visible){g.hurt(pattern===2?46:24);g.burst(p,0x99ffee);}
  e.attackCycle++;e.cooldown=enemyRecovery(pattern===2?1.25:.65,pattern===2?1.15:pattern===1?.75:.4);g.sound.effect(190);return true;
 }
 if(e.sword)e.sword.rotation.z=-.45;
 if(visible&&e.cooldown<=0&&(pattern===1?dist<24:dist<5.2)){
  e.telegraph=g.time+(pattern===2?1.15:pattern===1?.75:.4);
  g.notify(pattern===1?'さむらいが かまえた！ よこへ よけよう':pattern===2?'おおきく ふりかぶった！ はなれよう':'さむらいが きる！');return true;
 }
 // Close the gap faster than a backward walk; use normal navigation around walls.
 return false;
}

export function samuraiCanStrike(px:number,pz:number,x:number,z:number,aimX:number,aimZ:number,reach:number,wide=false){const dx=x-px,dz=z-pz,d=Math.hypot(dx,dz),ax=aimX-px,az=aimZ-pz;return d<reach&&(d<.1||(dx*ax+dz*az)/(d*Math.max(.01,Math.hypot(ax,az)))>(wide?.12:.5));}
function updateNightmareSamurai(g:Game,e:Enemy,dt:number,visible:boolean,dist:number,allowed:boolean){
 const p=e.group.position,data=e.group.userData,pattern=e.attackCycle%3;
 if(g.time<e.dashUntil){const nx=p.x+e.dashX*dt,nz=p.z+e.dashZ*dt;if(canMove(nx,nz,g.gate)){p.x=nx;p.z=nz;}else e.dashUntil=0;if(!e.dashHit&&Math.hypot(p.x-g.position.x,p.z-g.position.z)<3.2&&lineOfSight(p.x,p.z,g.position.x,g.position.z,g.gate)){g.hurt(48);e.dashHit=true;}e.body.rotation.x=.3;if(e.sword)e.sword.rotation.z=-1.7;return true;}
 if(g.time<(data.samuraiRecoveryUntil??0)){e.body.rotation.x=.12;if(e.sword)e.sword.rotation.z=-1;return true;}
 e.body.rotation.x=0;
 if(e.telegraph){const aim=data.samuraiAim as {x:number;z:number};e.group.rotation.y=Math.atan2(p.x-aim.x,p.z-aim.z);if(e.sword)e.sword.rotation.z=pattern===2?.4+Math.max(0,e.telegraph-g.time):1.3;e.body.rotation.x=pattern===1?-.2:-.1;if(g.time<e.telegraph)return true;e.telegraph=0;
  if(pattern===1){const dx=aim.x-p.x,dz=aim.z-p.z,d=Math.max(.01,Math.hypot(dx,dz));e.dashX=dx/d*23;e.dashZ=dz/d*23;e.dashUntil=g.time+Math.min(.75,d/23+.12);e.dashHit=false;data.samuraiRecoveryUntil=e.dashUntil+1.05;}
  else{if(visible&&samuraiCanStrike(p.x,p.z,g.position.x,g.position.z,aim.x,aim.z,pattern===2?5.6:4.2,pattern===2))g.hurt(pattern===2?60:38);data.samuraiRecoveryUntil=g.time+(pattern===2?1.35:.75);}
  e.attackCycle++;e.cooldown=(data.samuraiRecoveryUntil-g.time)*1.2+.25;g.sound.effect(190);return true;
 }
 if(e.sword)e.sword.rotation.z=-.45;
 if(allowed&&visible&&e.cooldown<=0&&(pattern===1?dist<28:dist<5.8)){data.samuraiAim={x:g.position.x,z:g.position.z};e.telegraph=g.time+(pattern===2?1.05:pattern===1?.7:.45);g.notify(pattern===1?'さむらいが かまえた！ よこへ よけよう':pattern===2?'ふりかぶった！ はなれよう':'さむらいが きる！');return true;}
 return false;
}
