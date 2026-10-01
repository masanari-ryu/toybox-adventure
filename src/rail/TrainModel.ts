import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mesh} from '../world/World';
import {trainTexture} from './TrainTextures';
export function toyTrain(withBattery=false){const g=new T.Group();
 const part=(geo:T.BufferGeometry,color:number,x:number,y:number,z:number,finish:'body'|'roof'|'window'|'wheel'|'battery'='body')=>{const m=mesh(geo,color,x,y,z);const mat=m.material as T.MeshStandardMaterial;mat.map=trainTexture(finish);mat.roughness=.28;mat.metalness=.08;g.add(m);return m;};
 part(new RoundedBoxGeometry(1.8,.55,3.2,3,.15),0xffffff,0,.58,0);
 part(new RoundedBoxGeometry(1.65,.8,1.35,3,.18),0xffffff,0,1.18,-.67);
 part(new RoundedBoxGeometry(1.65,1.4,1.1,3,.12),0xffffff,0,1.48,.78);
 part(new RoundedBoxGeometry(1.85,.22,1.25,2,.07),0xffffff,0,2.25,.78,'roof');
 part(new RoundedBoxGeometry(1.25,.65,.05,2,.03),0xffffff,0,1.76,.19,'window');
 const lamp=part(new T.CylinderGeometry(.22,.22,.11,20),0xffefbb,0,1.18,-1.4);lamp.rotation.x=Math.PI/2;(lamp.material as T.MeshStandardMaterial).emissive.setHex(0xffd574);
 for(const side of [-1,1])for(const z of [-.9,.9]){const wheel=part(new T.CylinderGeometry(.37,.37,.14,20),0xffffff,side*.91,.35,z,'wheel');wheel.rotation.z=Math.PI/2;const hub=part(new T.CylinderGeometry(.15,.15,.16,12),0xffd578,side*.98,.35,z);hub.rotation.z=Math.PI/2;}
 const stack=part(new T.CylinderGeometry(.2,.25,.7,16),0xe27c98,0,1.86,-.6);
 part(new T.TorusGeometry(.22,.045,6,16),0xffd578,0,2.22,-.6).rotation.x=Math.PI/2;
 part(new RoundedBoxGeometry(.48,.08,.7,2,.04),0x31516a,.55,1.64,-.65);
 for(const side of [-1,1])part(new RoundedBoxGeometry(.1,.3,1.3,2,.025),0xffffff,side*.83,1.06,-.65);
 if(withBattery){part(new T.CylinderGeometry(.14,.14,.48,16),0xffffff,.55,1.91,-.65,'battery');part(new T.CylinderGeometry(.07,.07,.07,12),0xffe8a2,.55,2.18,-.65);}
 for(const side of [-1,1]){
  const window=part(new RoundedBoxGeometry(.05,.65,.75,2,.025),0xffffff,side*.84,1.76,.78,'window');(window.material as T.MeshStandardMaterial).metalness=.48;
  part(new RoundedBoxGeometry(.13,.1,2.9,2,.025),0xffffff,side*.96,.8,0,'roof');
  const headlight=part(new T.SphereGeometry(.12,16,10),0xfff3cb,side*.57,1.13,-1.4);const mat=headlight.material as T.MeshStandardMaterial;mat.map=null;mat.emissive.setHex(0xffdba1);mat.emissiveIntensity=1.6;
 }
 part(new RoundedBoxGeometry(1.9,.2,.22,2,.06),0xffffff,0,.48,-1.68,'roof');
 part(new RoundedBoxGeometry(1.4,.32,.12,2,.04),0xffffff,0,.9,-1.41,'roof');
 stack.castShadow=true;g.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});return g;
}
export function stationTrack(parent:T.Object3D,x:number,z:number){const g=new T.Group();g.position.set(x,0,z);for(const side of [-1,1])g.add(mesh(new T.BoxGeometry(.16,.12,5.8),0x57b4e0,side*.66,.12,0));for(let n=0;n<9;n++)g.add(mesh(new RoundedBoxGeometry(1.7,.1,.23,1,.03),0x448dc9,0,.06,(n-4)*.63));parent.add(g);return g;}
