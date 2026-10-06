import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {Enemy} from './Enemy';
import {toyPart} from '../world/ToyIllustration';
import {creatureMaterial} from './CreatureSurface';
import {creatureSkin} from './CreatureSkin';
const starShape=()=>{const s=new T.Shape();for(let n=0;n<10;n++){const a=n*Math.PI/5+Math.PI/2,r=n%2?.45:1;n?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();return s;};
function badge(parent:T.Group,material:T.Material,x:number,y:number,z:number,scale:number){const m=toyPart(parent,new T.ExtrudeGeometry(starShape(),{depth:.08,bevelEnabled:true,bevelSize:.06,bevelThickness:.035,bevelSegments:2}),material,x,y,z);m.scale.setScalar(scale);m.rotation.y=Math.PI;return m;}
function bolt(parent:T.Group,material:T.Material,x:number,y:number,z:number,r=.045){const m=toyPart(parent,new T.CylinderGeometry(r,r,.028,8),material,x,y,z);m.rotation.x=Math.PI/2;return m;}
/** Articulated toy detailing only; combat dimensions and state stay owned by Enemy. */
export function dressCreature(e:Enemy){
 const b=e.body,gold=creatureMaterial(0xffd18b,'metal'),steel=creatureMaterial(0xa7cedc,'metal'),ivory=creatureMaterial(0xfff3dd,'enamel'),ink=creatureMaterial(0x20384f,'rubber'),rubber=creatureMaterial(0x627195,'rubber');
 if(e.kind==='KING PUNI'){
  const armor=creatureMaterial(0xffffff,'enamel',creatureSkin('SAMURAI'));
  for(const side of [-1,1]){
   const arm=new T.Group();arm.position.set(side*2.2,2.9,0);b.add(arm);e.arms.push(arm);
   const pauldron=toyPart(arm,new RoundedBoxGeometry(1.4,1.1,1.15,3,.25),armor);pauldron.rotation.z=side*.3;
   const trim=toyPart(arm,new T.TorusGeometry(.4,.08,8,24),gold,side*.05,-.04,-.61);trim.scale.y=.78;badge(arm,ivory,0,-.08,-.67,.23);
   toyPart(arm,new T.CapsuleGeometry(.37,1.1,6,16),gold,side*.16,-1.1,-.2);toyPart(arm,new T.SphereGeometry(.43,20,16),rubber,side*.35,-1.95,-.4);
   for(let n=0;n<3;n++)toyPart(arm,new T.CapsuleGeometry(.075,.24,4,8),ivory,side*(.12+n*.15),-2.03,-.73);
   for(const dx of [-.4,.4])bolt(arm,steel,dx,.2,-.57,.065);
  }
  const front=toyPart(b,new T.TorusGeometry(.55,.085,8,28),gold,0,2.24,-2.25);front.scale.y=.75;badge(b,ivory,0,2.24,-2.36,.34);
  const crown=toyPart(b,new T.TorusGeometry(.75,.11,8,28),gold,0,4.82,0);crown.rotation.x=Math.PI/2;
  for(let n=0;n<5;n++){const gem=toyPart(b,new T.OctahedronGeometry(.13),creatureMaterial(n%2?0x73dfe3:0xff8abc,'enamel'),(n-2)*.31,5.05,-.42);gem.scale.y=1.35;}
  for(let n=0;n<7;n++){const a=n*Math.PI/3.5;toyPart(b,new T.SphereGeometry(.13,12,8),ivory,Math.cos(a)*2.1,1.5,Math.sin(a)*2.1);}
 }else if(e.kind==='SAMURAI'){
  const armor=creatureMaterial(0xffffff,'enamel',creatureSkin('SAMURAI'));
  for(const side of [-1,1]){
   const shoulder=new T.Group();shoulder.position.set(side*.86,2.2,-.1);b.add(shoulder);e.visualWings.push(shoulder);
   for(let n=0;n<3;n++){const plate=toyPart(shoulder,new RoundedBoxGeometry(.7,.25,.67,2,.05),armor,0,-n*.26);plate.rotation.z=side*.22;for(const dx of [-.22,.22])bolt(shoulder,gold,dx,-n*.26,-.36);}
   const flap=toyPart(b,new RoundedBoxGeometry(.37,.83,.17,2,.07),gold,side*.58,2.48,-.23);flap.rotation.z=side*.12;
   for(let n=0;n<3;n++){const thigh=toyPart(b,new RoundedBoxGeometry(.36,.18,.16,2,.04),armor,side*.4,.64-n*.17,-.17);for(const dx of [-.12,.12])bolt(b,gold,side*.4+dx,.64-n*.17,-.26,.026);thigh.rotation.z=side*.03;}
  }
  for(let n=0;n<3;n++){toyPart(b,new RoundedBoxGeometry(.8,.22,.11,2,.04),armor,0,1.84-n*.25,-.61);for(const x of [-.29,.29])bolt(b,gold,x,1.84-n*.25,-.68,.028);}
  const belt=toyPart(b,new T.TorusGeometry(.7,.06,8,28),gold,0,1.06,0);belt.rotation.x=Math.PI/2;badge(b,gold,0,1.54,-.73,.13);
  const crest=new T.Shape();crest.moveTo(-.65,0);crest.quadraticCurveTo(-.7,.7,-.9,1);crest.quadraticCurveTo(-.15,.85,0,.3);crest.quadraticCurveTo(.15,.85,.9,1);crest.quadraticCurveTo(.7,.7,.65,0);crest.closePath();toyPart(b,new T.ExtrudeGeometry(crest,{depth:.12,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:2}),gold,0,2.9,-.5);badge(b,ivory,0,3.13,-.69,.14);
  toyPart(b,new RoundedBoxGeometry(.5,.27,.25,2,.06),ink,0,2.27,-.45);
  if(e.sword){const sword=e.sword as T.Mesh;sword.geometry.dispose();sword.geometry=new RoundedBoxGeometry(.18,3.3,.09,3,.045);sword.material=creatureMaterial(0xd8fff6,'metal');const hilt=toyPart(b,new T.CapsuleGeometry(.09,.5,6,12),rubber);hilt.removeFromParent();hilt.position.set(0,-1.8,0);sword.add(hilt);const guard=toyPart(b,new T.TorusGeometry(.24,.065,10,24),gold);guard.removeFromParent();guard.rotation.x=Math.PI/2;guard.position.y=-1.5;sword.add(guard);for(let n=0;n<5;n++){const band=toyPart(b,new T.TorusGeometry(.092,.014,5,12),gold);band.removeFromParent();band.rotation.x=Math.PI/2;band.position.set(0,-1.58-n*.095,0);sword.add(band);}}
 }else if(e.kind==='BOTTY'){
  const armor=creatureMaterial(0x67c2c5,'enamel');
  for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.7,1.4,-.48);b.add(arm);e.arms.push(arm);const housing=toyPart(arm,new T.CylinderGeometry(.2,.24,.43,16),armor,0,0,-.1);housing.rotation.x=Math.PI/2;const ring=toyPart(arm,new T.TorusGeometry(.17,.04,8,20),gold,0,0,-.34);toyPart(arm,new T.CylinderGeometry(.09,.09,.05,12),ink,0,0,-.35).rotation.x=Math.PI/2;for(let n=0;n<3;n++)bolt(b,steel,side*.55,1.15+n*.18,-.67,.035);ring.rotation.z=.3;}
  for(let n=0;n<4;n++)toyPart(b,new RoundedBoxGeometry(.34,.04,.07,1,.015),ink,0,1.07+n*.1,.83);
  badge(b,gold,0,1.1,-1.07,.13);const rotor=toyPart(b,new T.TorusGeometry(.26,.045,8,24),steel,0,1.87,.22);rotor.rotation.x=Math.PI/2;e.visualRotors.push(rotor);
 }else if(e.kind==='BALLOONER'){
  const felt=creatureMaterial(0xedd8fb,'cloth');for(const side of [-1,1]){const edge=toyPart(b,new T.TorusGeometry(.3,.045,8,24,Math.PI*1.5),felt,side*1.1,1.4,-.1);edge.rotation.z=side*.4;e.visualWings.push(edge);const knot=toyPart(b,new T.CapsuleGeometry(.1,.14,4,12),ivory,side*.48,.87,-.03);knot.rotation.z=side*.7;}
  badge(b,gold,0,.86,-.22,.11);for(let n=-1;n<=1;n++){const bell=toyPart(b,new T.TorusGeometry(.085,.025,6,12),gold,n*.9,-.73,.06);bell.rotation.x=.3;}
 }else if(e.kind==='TOX MUNCHER'){
  const green=creatureMaterial(0x8dbb62,'rubber');for(const side of [-1,1]){toyPart(b,new T.SphereGeometry(.17,16,12),ivory,side*.6,1.5,.3);toyPart(b,new T.TorusGeometry(.16,.035,8,20),gold,side*.6,1.5,.1);const sole=toyPart(b,new RoundedBoxGeometry(.38,.12,.51,2,.08),green,side*1.17,.12,-.22);sole.rotation.y=side*.2;for(let n=0;n<3;n++)toyPart(b,new T.SphereGeometry(.065,8,6),ivory,side*1.17+(n-1)*.1,.13,-.46);}
  badge(b,gold,0,.65,-.8,.12);for(let n=0;n<4;n++)toyPart(b,new T.SphereGeometry(.06+n%2*.025,12,8),green,(n-1.5)*.2,1.53,-.26);
 }else if(e.kind==='LAVA HOPPER'){
  const armor=creatureMaterial(0x9f6174,'metal');for(const side of [-1,1]){toyPart(b,new T.CylinderGeometry(.16,.2,.5,16),armor,side*.42,1.8,.15);const lip=toyPart(b,new T.TorusGeometry(.19,.045,8,20),gold,side*.42,2.06,.15);lip.rotation.x=Math.PI/2;const points=Array.from({length:49},(_,n)=>new T.Vector3(side*.68+Math.cos(n/48*Math.PI*8)*.12,.31+n/48*.36,Math.sin(n/48*Math.PI*8)*.12));toyPart(b,new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.025,5,false),steel);const boot=toyPart(b,new RoundedBoxGeometry(.34,.14,.46,2,.06),rubber,side*.7,.11,-.3);boot.rotation.y=side*.14;}
 }else if(e.kind==='INFANTRY'){
  const paint=creatureMaterial(0x5d9d81,'enamel');toyPart(b,new RoundedBoxGeometry(.48,.73,.25,2,.08),paint,0,1.35,.42);for(const x of [-.2,.2]){const strap=toyPart(b,new T.CapsuleGeometry(.024,.69,3,8),ivory,x,1.32,-.29);strap.rotation.z=x>0?.09:-.09;bolt(b,gold,x,1.64,-.32,.023);}badge(b,gold,0,1.48,-.31,.095);
 }else{
  badge(b,gold,0,.55,-.85,.12);for(const side of [-1,1]){toyPart(b,new T.SphereGeometry(.075,12,8),gold,side*.64,2.15,0);const cheek=toyPart(b,new T.SphereGeometry(.065,12,8),creatureMaterial(0xfab6c9,'gel'),side*.52,1.05,-.67);cheek.scale.set(1.5,.65,.3);}
 }
}
