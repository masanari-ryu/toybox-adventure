import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {weaponFinish,weaponGlow} from './WeaponFinish';
/** Additional toy housings share original PBR sheets and the existing recoil animation. */
export function decorateNightmareWeapon(g:T.Group,index:number){
 const shell=weaponFinish(index===4?0x63bb8c:index===5?0xe89652:0x598bd0),metal=weaponFinish(0xf2d795,'metal'),rubber=weaponFinish(0x293748,'rubber'),glow=weaponGlow(index===4?0xb6ff85:index===5?0xffc35d:0xb9dfff);
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
 if(index===4){add(new RoundedBoxGeometry(.27,.19,.42,2,.04),shell,.42,-.32,-.27);add(new RoundedBoxGeometry(.18,.15,.16,2,.04),rubber,.42,-.32,-.01);const cell=add(new RoundedBoxGeometry(.16,.3,.15,2,.03),shell,.42,-.59,-.7);cell.rotation.x=-.13;for(let n=0;n<3;n++)add(new T.BoxGeometry(.17,.012,.11),metal,.42,-.49-n*.07,-.695);for(const x of [.24,.60])add(new T.BoxGeometry(.024,.04,.4),glow,x,-.23,-.78);}
 if(index===5){add(new RoundedBoxGeometry(.58,.35,.4,2,.07),shell,.42,-.32,-.75);const barrel=add(new T.CylinderGeometry(.27,.23,.55,28),shell,.42,-.32,-1.01);barrel.rotation.x=Math.PI/2;for(const z of [-.82,-1.02,-1.26])add(new T.TorusGeometry(.277,.028,8,28),metal,.42,-.32,z);add(new T.TorusGeometry(.225,.012,6,24),glow,.42,-.32,-1.29);const drum=add(new T.CylinderGeometry(.2,.2,.55,24),shell,.42,-.59,-.66);drum.rotation.z=Math.PI/2;for(const x of [.14,.7])add(new T.TorusGeometry(.203,.025,6,24),metal,x,-.59,-.66).rotation.y=Math.PI/2;}
 if(index===6){for(const side of [-1,1]){const arm=add(new RoundedBoxGeometry(.09,.08,.43,2,.018),metal,.42+side*.33,-.32,-.91);arm.rotation.y=side*.22;const nozzle=add(new T.CylinderGeometry(.13,.11,.24,20),shell,.42+side*.36,-.32,-1.1);nozzle.rotation.x=Math.PI/2;add(new T.TorusGeometry(.13,.022,7,24),glow,.42+side*.37,-.32,-1.22);}add(new T.TorusGeometry(.185,.013,7,28),glow,.42,-.32,-1.25);for(const side of [-1,1])add(new T.CapsuleGeometry(.055,.2,4,12),glow,.42+side*.2,-.04,-.65);}
}
