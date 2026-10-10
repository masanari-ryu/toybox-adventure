import * as T from 'three';
import type {Game,Shot} from './Game';
import {nightmareWeapons as config,specialDamage} from './WeaponSettings';
import {attackPower} from './PowerEffects';
import {beamDistance} from './Thunderbolt';
import {mesh} from '../world/World';
import {sightAt,wallAt} from '../world/layout';
function center(e:Game['enemies'][number]){return e.group.position.clone().add(new T.Vector3(0,e.kind==='KING PUNI'?2.2*e.baseScale:e.baseScale,0));}
function attackable(g:Game,e:Game['enemies'][number]){return e.alive&&!e.group.userData?.bossHidden&&(e.kind!=='KING PUNI'||g.gate)&&(e.kind!=='SAMURAI'||e.alert);}
/** Fast weapons cannot repeatedly postpone an already-alert elite's attack schedule. */
export function applySpecialHit(g:Game,e:Game['enemies'][number],damage:number,weapon:number){
 const elite=e.kind==='KING PUNI'||e.kind==='SAMURAI',saved=elite&&e.alert?{cooldown:e.cooldown,surprise:e.brain.surprisedUntil}:undefined;
 g.damage(e,damage,weapon);if(saved&&e.alive){e.cooldown=saved.cooldown;e.brain.surprisedUntil=saved.surprise;}
}
export function fireNightmareWeapon(g:Game,direction:T.Vector3){
 const index=g.input.weapon;
 if(index===6){tripleThunder(g,direction);return;}
 const settings=index===4?config.rifle:config.cannon,m=mesh(new T.SphereGeometry(index===4?.11:.32,12,8),index===4?0xc8ff93:0xffb770);const mat=m.material as T.MeshStandardMaterial;mat.emissive.setHex(index===4?0x9fed7c:0xff953d);mat.emissiveIntensity=1;
 // Start inside the camera's collision space so nearby walls also trigger the cannon blast.
 m.position.copy(g.position);g.scene.add(m);g.shots.push({m,v:direction.clone().multiplyScalar(settings.speed),life:settings.range/settings.speed,damage:settings.damage*attackPower(g),bossDamage:settings.bossDamage*attackPower(g),enemy:false,kind:index});g.sound.effect(index===4?780:240);
}
export function cannonSelfDamage(distance:number){return distance>=config.cannon.selfRadius?0:config.cannon.selfDamage*(1-distance/config.cannon.selfRadius);}
export function cannonExplosion(g:Game,origin:T.Vector3,s:Pick<Shot,'damage'|'bossDamage'>){
 const c=config.cannon;
 for(const e of g.enemies){if(!attackable(g,e))continue;const target=center(e),distance=target.distanceTo(origin);if(distance>c.radius+e.radius*e.baseScale||!sightAt(origin.x,origin.z,origin.y,target.x,target.z,target.y,g.gate))continue;applySpecialHit(g,e,specialDamage(e.kind,s.damage,s.bossDamage??c.bossDamage),5);g.burst(target,0xffc781);}
 const self=cannonSelfDamage(g.position.distanceTo(origin));if(self>0&&sightAt(origin.x,origin.z,origin.y,g.position.x,g.position.z,g.position.y,g.gate))g.hurt(self);
 g.burst(origin,0xffb660);g.sound.effect(150);const ring=mesh(new T.TorusGeometry(1,.08,6,40),0xffc577,origin.x,origin.y,origin.z);ring.rotation.x=Math.PI/2;ring.userData.maxRadius=c.radius;g.scene.add(ring);g.shockwaves.push({m:ring,r:1,hit:true});
}
/** Swept collision stops a shell on the near face, never allowing blast damage through a wall. */
export function updateNightmareShot(g:Game,s:Shot,previous:T.Vector3){
 const delta=s.m.position.clone().sub(previous),steps=Math.max(1,Math.ceil(delta.length()/.18));let impact:T.Vector3|undefined,target:Game['enemies'][number]|undefined;
 for(let n=1;n<=steps;n++){
  const p=previous.clone().addScaledVector(delta,n/steps);
  if(wallAt(p.x,p.z,p.y,g.gate)||!sightAt(previous.x,previous.z,previous.y,p.x,p.z,p.y,g.gate)){impact=previous.clone().addScaledVector(delta,(n-1)/steps);break;}
  target=g.enemies.find(e=>attackable(g,e)&&p.distanceTo(center(e))<e.radius*e.baseScale+(s.kind===5?.32:g.input.touch?.4:.2)&&sightAt(p.x,p.z,p.y,center(e).x,center(e).z,center(e).y,g.gate));
  if(target){impact=p;break;}
 }
 if(s.kind===5&&(impact||s.life<=0)){cannonExplosion(g,impact??s.m.position,s);return true;}
 if(impact){if(target){applySpecialHit(g,target,specialDamage(target.kind,s.damage,s.bossDamage??config.rifle.bossDamage),4);if(!['KING PUNI','SAMURAI'].includes(target.kind))target.stunned=g.time+.08;g.burst(impact,0xccff96);}return true;}
 return s.life<=0;
}
export function tripleThunder(g:Game,direction:T.Vector3){
 const c=config.thunder,origin=g.position.clone(),hitTargets=new Set<Game['enemies'][number]>();
 for(const angle of [-c.angle,0,c.angle]){
  const d=direction.clone().applyAxisAngle(new T.Vector3(0,1,0),angle);let reach:number=c.range;
  for(let n=.25;n<=reach;n+=.25){const p=origin.clone().addScaledVector(d,n);if(wallAt(p.x,p.z,p.y,g.gate)){reach=Math.max(0,n-.25);break;}}
  const end=origin.clone().addScaledVector(d,reach),muzzle=new T.Vector3(.42+angle,-.3,-1.2).applyQuaternion(g.camera.quaternion).add(origin);g.lightning.add(g.scene,muzzle,end);
  for(const e of g.enemies){if(!attackable(g,e)||hitTargets.has(e))continue;const target=center(e),hit=beamDistance(origin,d,target);if(hit.along<0||hit.along>reach||hit.distance>e.radius*e.baseScale+.48+(g.input.touch?.3:0)||!sightAt(origin.x,origin.z,origin.y,target.x,target.z,target.y,g.gate))continue;
   // A large boss intersecting multiple beams still receives one boss-sized hit per trigger.
   hitTargets.add(e);applySpecialHit(g,e,specialDamage(e.kind,c.damage,c.bossDamage,attackPower(g)),6);if(!['KING PUNI','SAMURAI'].includes(e.kind))e.stunned=g.time+.2;g.burst(target,0xa7eaff);
  }
 }
 g.sound.thunder();
}
