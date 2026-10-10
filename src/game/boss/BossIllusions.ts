import * as T from 'three';import type {Game}from '../Game';import {Enemy}from '../Enemy';import type {BossState}from './BossState';import {bossPositions}from './BossSpace';import {bossVolley}from './BossProjectiles';import {bossSettings as c}from './BossSettings';
export function createIllusions(g:Game,e:Enemy,s:BossState){const points=bossPositions(g,e,s.nightmare&&s.second?c.magician.nightmareCount:c.magician.illusionCount);if(!points.length)return;for(let n=0;n<points.length;n++){
 let clone=s.clones[n];if(!clone){clone=new Enemy('KING PUNI',points[n].x,points[n].z);clone.group.userData.bossClone=true;clone.group.children[1].visible=false;clone.group.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=false;});const ring=new T.Mesh(new T.TorusGeometry(.85,.04,5,20,Math.PI*1.5),new T.MeshStandardMaterial({color:0xbbe9ff,emissive:0x89cce5,emissiveIntensity:.5}));ring.position.y=5.6;ring.rotation.x=Math.PI/2;clone.body.add(ring);s.clones.push(clone);g.enemies.push(clone);g.scene.add(clone.group);}
 clone.alive=true;clone.hp=clone.maxHp=1;clone.floorY=e.floorY;clone.baseScale=e.baseScale*.72;clone.alert=true;clone.brain.hit(g.position.x,g.position.z,g.time);clone.group.position.set(points[n].x,e.floorY,points[n].z);clone.group.scale.setScalar(clone.baseScale);clone.group.visible=clone.body.visible=true;clone.cooldown=1.1+n*.55;clone.telegraph=0;g.burst(clone.group.position.clone().add(new T.Vector3(0,.5,0)),0xb3edff);
 }for(let n=points.length;n<s.clones.length;n++){s.clones[n].alive=false;s.clones[n].group.visible=false;}s.cloneExpires=g.time+c.magician.illusionLife;s.cloneActive=true;s.nextIllusion=g.time+c.magician.illusionCooldown;
}
export function destroyIllusion(g:Game,clone:Enemy){clone.alive=false;clone.hp=0;clone.group.visible=clone.body.visible=false;clone.telegraph=0;g.burst(clone.group.position.clone().add(new T.Vector3(0,clone.baseScale,0)),0xc2e7ff);g.sound.effect(880);}
export function tickIllusions(g:Game,e:Enemy,s:BossState,dt:number,allowed?:Set<Enemy>){
 if(!s.cloneActive)return false;if(g.time>=s.cloneExpires){for(const clone of s.clones)if(clone.alive)destroyIllusion(g,clone);s.cloneActive=false;return false;}
 if(s.clones.every(a=>!a.alive)){s.cloneActive=false;return true;}
 let casting=s.clones.filter(a=>a.alive&&a.telegraph>0).length;
 for(const [n,clone]of s.clones.entries()){if(!clone.alive)continue;clone.cooldown-=dt;clone.animate(g.time+n*.3,false);clone.body.rotation.z=Math.sin(g.time*2+n)*.1;clone.group.rotation.y=Math.atan2(clone.group.position.x-g.position.x,clone.group.position.z-g.position.z);
  if(clone.telegraph>0){if(g.time>=clone.telegraph){clone.telegraph=0;casting--;const aim=clone.group.userData.cloneAim;bossVolley(g,clone,[0],aim,c.magician.cloneDamage,0,e);clone.cooldown=2.3+n*.3;}continue;}
  if(clone.cooldown<=0&&casting<2&&(!allowed||allowed.has(clone))){clone.telegraph=g.time+.9;clone.group.userData.cloneAim={x:g.position.x,y:g.position.y,z:g.position.z};casting++;g.sound.effect(520);}
 }
 return false;
}
