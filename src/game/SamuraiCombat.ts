import {enemyPressure,enemyWindup,enemyRecovery} from './EnemyPressure';
import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {canMove,lineOfSight} from '../world/layout';
/** A committed charge can be sidestepped; it never tracks after launch. */
export function updateSamurai(g:Game,e:Enemy,dt:number,visible:boolean,dist:number){
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
