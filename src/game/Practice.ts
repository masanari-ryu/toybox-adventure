import * as T from 'three';
import type {Game} from './Game';
import {World,mesh} from '../world/World';
import {configureStage} from '../world/layout';
import {practiceStage,practiceLessons} from '../stages/PracticeStage';
import {Enemy} from './Enemy';
import {movePlayer} from './Player';
import {fire,updateShots,updateEnemies} from './Combat';
import {el} from '../ui/Hud';
export class Practice{
 lesson=0;done=false;dodged=0;nextShot=0;private ring?:T.Mesh;
 constructor(private g:Game){}
 begin(lesson:number){const g=this.g;g.card.open=false;el('card').hidden=true;g.loadStage(0);for(const e of g.enemies)g.disposeGroup(e.group);g.enemies=[];g.scene.remove(g.worldScene);g.world.disposed=true;g.disposeGroup(g.worldScene,true);configureStage(0,practiceStage);g.worldScene=new T.Scene();g.scene.add(g.worldScene);g.world=new World(g.worldScene,0,practiceStage);g.position.set(22,1.65,34);g.yaw=g.pitch=0;g.velocity.set(0,0,0);g.hp=100;g.energy=100;g.arsenal.reset();g.input.weapon=0;this.lesson=lesson;this.done=false;this.dodged=0;this.nextShot=g.time+2.5;g.input.touch&&(g.orientationBlocked=innerHeight>innerWidth);document.body.classList.add('practicing');el('practice-hud').hidden=false;el('practice-next').hidden=true;
 if(lesson===0||lesson===2){const ring=mesh(new T.TorusGeometry(1.2,.1,8,32),0x5be8bd,lesson===2?30:22,.2,lesson===2?34:22);ring.rotation.x=-Math.PI/2;this.ring=ring;g.world.group.add(ring);}
 if(lesson===1){const e=new Enemy('BOTTY',22,22);e.baseScale=1.2;e.group.scale.setScalar(1.2);g.enemies.push(e);g.scene.add(e.group);}
 if(lesson===4)for(const [x,z]of [[18,20],[26,18],[22,14]]){const e=new Enemy('PUNI',x,z);e.baseScale=.84;e.group.scale.setScalar(.84);e.tier=0;e.cooldown=2;g.enemies.push(e);g.scene.add(e.group);}
 g.updateHud();this.hud();const info=practiceLessons[lesson];g.card.show(`れんしゅう ${lesson+1} · ${info.name}`,g.input.touch?info.text:info.pc,'🧸');}
 update(dt:number){const g=this.g;movePlayer(g,dt);g.useItems();if(g.input.fire)fire(g);if(this.lesson===4&&!this.done)updateEnemies(g,dt);updateShots(g,dt);g.updateParticles(dt);g.world.update(g.time);g.energy=Math.min(100,g.energy+dt*6);g.hp=Math.max(40,g.hp);if(g.time>g.hudTime){g.hudTime=g.time+.1;g.updateHud();this.hud();}if(this.done)return;
 if((this.lesson===0||this.lesson===2)&&this.ring&&g.position.distanceTo(this.ring.position.clone().setY(1.65))<1.6)this.complete();
 if((this.lesson===1||this.lesson===4)&&g.enemies.every(e=>!e.alive))this.complete();
 if(this.lesson===3){if(g.time>=this.nextShot){this.nextShot=g.time+2.8;const origin=new T.Vector3(g.position.x,1.65,10),m=mesh(new T.SphereGeometry(.3,12,8),0x70dcff);m.position.copy(origin);g.scene.add(m);g.shots.push({m,v:g.position.clone().sub(origin).normalize().multiplyScalar(9),life:5,damage:0,enemy:true,kind:0});g.notify('たまが くるよ！ カニあるきで よけよう');}
 for(const s of g.shots)if(s.enemy&&s.kind===0&&s.m.position.z>g.position.z+1){s.kind=99;this.dodged++;if(this.dodged>=3)this.complete();}}
 if(g.time>g.toastTime)el('toast').textContent='';g.fog.reveal(g.position.x,g.position.z);g.drawMap();}
 private complete(){this.done=true;el('practice-next').hidden=false;el('practice-next').textContent=this.lesson===4?'ほんぺんへ':'つぎの れんしゅう';this.g.notify('できた！ とても じょうず！');this.hud();}
 private hud(){el('area').textContent='れんしゅうじょう';el('objective').textContent=practiceLessons[this.lesson].name;el('practice-instruction').textContent=this.done?'できた！ つぎへ すすもう':(this.g.input.touch?practiceLessons[this.lesson].text:practiceLessons[this.lesson].pc);el('practice-progress').textContent=`${this.lesson+1} / 5${this.lesson===3?` · ${this.dodged} / 3`:''}`;}
 stop(){document.body.classList.remove('practicing');el('practice-hud').hidden=true;this.g.practice=undefined;this.g.reset();el('overlay').style.display='flex';el('hud').style.display='none';this.g.sound.music?.setMode('title');document.exitPointerLock?.();}
}
