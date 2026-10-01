import * as T from 'three';
import type {Game} from './Game';
import {canMove} from '../world/layout';
export function movePlayer(g:Game,dt:number){const i=g.input;g.yaw-=i.lookX;g.pitch=T.MathUtils.clamp(g.pitch-i.lookY,-1.15,1.15);i.lookX=i.lookY=0;
 const x=(i.keys.has('KeyD')?1:0)-(i.keys.has('KeyA')?1:0)+i.mx,z=(i.keys.has('KeyW')?1:0)-(i.keys.has('KeyS')?1:0)+i.my;
 const frozen=g.time<g.paralyzedUntil;const wish=new T.Vector3(frozen?0:x,0,frozen?0:-z);if(frozen)g.velocity.set(0,0,0);if(wish.length()>1)wish.normalize();wish.applyAxisAngle(new T.Vector3(0,1,0),g.yaw);const speed=(i.dash||i.keys.has('ShiftLeft')?10:6.5)*(g.buffs.has('CANDY')?1.3:1);g.velocity.lerp(wish.multiplyScalar(speed),1-Math.exp(-dt*12));
 const nx=g.position.x+g.velocity.x*dt,nz=g.position.z+g.velocity.z*dt;if(canMove(nx,g.position.z,g.gate))g.position.x=nx;if(canMove(g.position.x,nz,g.gate))g.position.z=nz;
 let ground=1.65;for(const p of [g.world.platform,...g.world.bridges])if(p.visible&&Math.abs(g.position.x-p.position.x)<1.7&&Math.abs(g.position.z-p.position.z)<1.7&&g.position.y>=p.position.y+1.3)ground=Math.max(ground,p.position.y+1.9);
 const pad=g.world.pad.position;if(Math.hypot(g.position.x-pad.x,g.position.z-pad.z)<1.5&&g.position.y<2&&g.vy<=0)g.vy=10;
 if(!frozen&&i.jump&&g.position.y<=ground+.18)g.vy=8+Math.min(1,g.failures*.25);i.jump=false;g.vy-=18*dt;g.position.y+=g.vy*dt;if(g.position.y<=ground){g.position.y=ground;g.vy=0;g.safe.copy(g.position);}
 if(g.position.y<-3){g.position.copy(g.safe);g.vy=0;g.hp=Math.max(15,g.hp-5);}
 g.camera.position.copy(g.position);g.camera.rotation.order='YXZ';const shake=Math.max(0,(g.shakeUntil-g.time)/.24)*.026;g.camera.rotation.set(g.pitch+Math.sin(g.time*95)*shake,g.yaw+Math.cos(g.time*83)*shake,Math.sin(g.time*110)*shake*.6);g.recoil=Math.max(0,g.recoil-dt*.7);if(g.input.weapon===3)g.gun.rotation.z=-.03+g.recoil*12;else g.gun.rotation.z=-.03;g.gun.position.set(0,-.18+Math.sin(g.time*9)*.005*g.velocity.length(),-.6+g.recoil);
}
