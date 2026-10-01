import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {toyMaterial,toyPart,toyLandmark,batchToy} from './ToyIllustration';
import {layout} from './layout';
/** Decoration stays above walls or outside the walkable layout. */
export function dressToyWorld(root:T.Group,stage:number,w:number,h:number){const pale=toyMaterial(0xffffff),gold=toyMaterial(0xffcf79,'wood'),trim=toyMaterial(stage===0?0x88d9de:stage===1?0xf7a9cb:0xc1b1ee,'armor'),sticker=toyMaterial(0xffffff,'sticker');
 for(let r=1;r<h-1;r++)for(let c=1;c<w-1;c++){if(layout[r]?.[c]!=='#'||(c+r)%5!==0)continue;const room=new T.Group();room.position.set(c*4+2,0,r*4+2);toyPart(room,new RoundedBoxGeometry(3.5,.28,3.5,2,.1),gold,0,5.12);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){if(!layout[r+dz]?.[c+dx]||layout[r+dz][c+dx]==='#')continue;const sign=toyPart(room,new T.PlaneGeometry(1.4,1.4),sticker,dx*2.02,3.3,dz*2.02);sign.rotation.y=dx?dx*Math.PI/2:dz>0?0:Math.PI;const canopy=toyPart(room,new RoundedBoxGeometry(2.6,.26,.75,2,.1),trim,dx*2.13,4.65,dz*2.13);if(dx)canopy.rotation.y=Math.PI/2;}
 if(stage===1){const pipe=toyPart(room,new T.TorusGeometry(1.6,.18,10,24,Math.PI),gold,0,5.5);pipe.rotation.x=Math.PI/2;toyPart(room,new T.CylinderGeometry(.5,.6,1,20),trim,0,5.75);toyPart(room,new T.SphereGeometry(.4,20,16),pale,0,6.5);}else{toyPart(room,new T.ConeGeometry(1.7,2.1,28),trim,0,6.3);toyPart(room,new T.SphereGeometry(.25,16,12),gold,0,7.5);}batchToy(room);root.add(room);}
 for(let n=0;n<12;n++){const g=toyLandmark(stage===0?0:1,n);g.position.set(6+n*(w*4/12),0,n%2?-18:h*4+18);g.scale.setScalar(1.1+n%3*.35);root.add(g);}
 const balloons=new T.InstancedMesh(new T.SphereGeometry(1,24,16),pale,54),d=new T.Object3D();for(let n=0;n<54;n++){d.position.set(-22+(n*23)%(w*4+42),18+n%6*3,n%2?-26:h*4+26);d.scale.set(1.5,2,1.5);d.updateMatrix();balloons.setMatrixAt(n,d.matrix);balloons.setColorAt(n,new T.Color([0xffa8cf,0x94e2e0,0xffdd84,0xbcb7fa][n%4]));}root.add(balloons);
}
