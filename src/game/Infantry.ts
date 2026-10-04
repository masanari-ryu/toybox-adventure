import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mesh} from '../world/World';
import {creatureSkin} from './CreatureSkin';
/** Molded plastic soldier, with hinged arms and boots instead of a gun. */
export function buildInfantry(body:T.Group){
 const torso=mesh(new RoundedBoxGeometry(.85,.95,.48,3,.12),0xffffff,0,1.35,0);
 const material=torso.material as T.MeshStandardMaterial;material.map=creatureSkin('INFANTRY');material.roughness=.27;material.metalness=.05;body.add(torso);
 const head=mesh(new T.SphereGeometry(.32,20,14),0xffd5a0,0,2.05,0);body.add(head);
 const helmet=mesh(new T.SphereGeometry(.4,20,14,0,Math.PI*2,0,Math.PI/2),0x53a980,0,2.18,0);body.add(helmet);
 const brim=mesh(new T.CylinderGeometry(.43,.43,.08,20),0x286d5a,0,2.17,-.05);body.add(brim);
 for(const side of [-1,1]){body.add(mesh(new T.SphereGeometry(.045,10,8),0x273c45,side*.12,2.06,-.295));}
 const smile=mesh(new T.TorusGeometry(.1,.018,6,16,Math.PI),0x273c45,0,1.93,-.31);smile.rotation.z=Math.PI;body.add(smile);
 body.add(mesh(new RoundedBoxGeometry(1,.2,.57,2,.05),0x286d5a,0,.89,0));
 const legs:T.Object3D[]=[],arms:T.Object3D[]=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.23,.86,0);leg.add(mesh(new T.CapsuleGeometry(.16,.43,4,12),0x4f9575,0,-.31,0));leg.add(mesh(new RoundedBoxGeometry(.34,.2,.55,2,.06),0x275d50,0,-.73,-.09));body.add(leg);legs.push(leg);
  const arm=new T.Group();arm.position.set(side*.57,1.72,0);arm.add(mesh(new T.CapsuleGeometry(.15,.4,4,12),0x4f9575,0,-.3,0));arm.add(mesh(new T.SphereGeometry(.2,16,12),0xffd5a0,0,-.64,-.04));body.add(arm);arms.push(arm);
 }
 body.add(mesh(new T.CircleGeometry(.12,5),0xffdf72,0,1.5,-.25));
 const base=mesh(new RoundedBoxGeometry(1.12,.075,.7,2,.06),0x39775f,0,.02,0);body.add(base);
 return{legs,arms};
}

/** Bright toy katana, attached to an articulated hand rather than the merged body. */
export function infantryKatana(hand:T.Object3D){const sword=new T.Group();const blade=new T.Shape();blade.moveTo(-.07,0);blade.lineTo(.08,0);blade.quadraticCurveTo(.3,1.55,.16,2.05);blade.quadraticCurveTo(-.03,1.6,-.07,0);const m=new T.Mesh(new T.ExtrudeGeometry(blade,{depth:.055,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025}),new T.MeshStandardMaterial({color:0xc8fff5,metalness:.75,roughness:.22}));sword.add(m);const grip=new T.Mesh(new T.CylinderGeometry(.075,.075,.5,10),new T.MeshStandardMaterial({color:0xe99342,roughness:.55}));grip.position.y=-.25;sword.add(grip);const guard=new T.Mesh(new T.TorusGeometry(.18,.045,8,20),new T.MeshStandardMaterial({color:0xffd470,metalness:.5,roughness:.35}));guard.rotation.x=Math.PI/2;sword.add(guard);for(let n=0;n<4;n++){const ring=new T.Mesh(new T.TorusGeometry(.077,.012,6,12),grip.material);ring.rotation.x=Math.PI/2;ring.position.y=-.07-n*.1;sword.add(ring);}sword.position.set(0,-.4,-.2);sword.rotation.z=-.5;hand.add(sword);return sword;}
