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
