import * as T from 'three';
import type {Enemy} from './Enemy';
export type CreatureEye={pupil:T.Object3D;lid:T.Object3D;highlight:T.Object3D;group:T.Object3D};
/** Observes existing gameplay state only; animation never changes the AI clock. */
export class CreatureMotion {
 private hp=NaN;private hitUntil=0;private previousCooldown=0;private strikeUntil=0;private lastTime=-1;
 constructor(private enemy:Enemy){}
 update(t:number,moving:boolean){
  const e=this.enemy;if(Number.isNaN(this.hp))this.hp=e.hp;
  if(e.hp<this.hp)this.hitUntil=t+.3;this.hp=e.hp;
  if(e.cooldown>this.previousCooldown+.16)this.strikeUntil=t+.24;this.previousCooldown=e.cooldown;
  const hit=Math.max(0,(this.hitUntil-t)/.3),strike=Math.max(0,(this.strikeUntil-t)/.24),windup=e.telegraph>t;
  const phase=t*(moving?9:2.6)+e.home.x*.37+e.home.z*.11;
  const jelly=e.kind==='PUNI'||e.kind==='KING PUNI';
  e.body.position.y=Math.sin(phase)*(moving?.065:.025);
  e.body.rotation.x=windup?.065:strike?-.1*strike:0;e.body.rotation.z=hit?Math.sin(t*42)*hit*.07:0;
  if(jelly){const breath=Math.sin(phase)*.025,pulse=windup?.11:0,squash=hit*.19+Math.sin(strike*Math.PI)*.1;
   e.body.scale.set(1+breath+pulse*.35+squash*.28,1-breath-pulse-squash,1+breath+strike*.14+squash*.22);
   e.body.position.y=Math.max(0,Math.sin(phase))*(moving?.11:.025);
  }else{e.body.scale.set(1,1-hit*.045,1);}
  for(let n=0;n<e.legs.length;n++){const gait=Math.sin(t*(e.kind==='INFANTRY'?10:11)+n*Math.PI+e.home.x*.09);e.legs[n].rotation.x=moving?gait*.28:windup?.09:0;}
  for(let n=0;n<e.arms.length;n++)e.arms[n].rotation.x=windup?-1.5:strike?-.7*strike:moving?Math.sin(t*7+n*Math.PI)*.35:0;
  if(e.kind==='LAVA HOPPER'){e.body.position.y=Math.abs(Math.sin(t*4))*1.1;e.body.scale.y=1-Math.max(0,.16-Math.abs(Math.sin(t*4))*.3);}
  if(e.kind==='BALLOONER'){e.body.rotation.z=Math.sin(t*3)*.12;for(const wing of e.visualWings)wing.rotation.z=Math.sin(t*3+e.home.x)*.08;}
  const blink=Math.sin(t*.7+e.home.z)> .997?1:0,aware=e.state!=='Idle';
  for(let n=0;n<e.eyes.length;n++){const eye=e.eyes[n];eye.pupil.scale.set(aware?.92:1,windup?.73:aware?1.17:1,1);eye.pupil.position.x=Math.sin(t*.9+e.home.x)*.018;eye.lid.scale.y=blink||hit>0?.25:windup?.55:aware?1.2:.86;eye.lid.position.y=blink?-.025:hit?-.015:.015;eye.highlight.visible=e.visualDetail;}
  if(e.kind==='SAMURAI'){e.body.rotation.x=e.dashUntil>t?-.17:windup?-.05:0;for(const plate of e.visualWings)plate.rotation.x=windup?-.09:Math.sin(phase)*.025;}
  if(this.lastTime!==t){for(const rotor of e.visualRotors)rotor.rotation.y+=Math.min(.04,Math.max(0,t-this.lastTime))*(aware?3:1);this.lastTime=t;}
 }
}
