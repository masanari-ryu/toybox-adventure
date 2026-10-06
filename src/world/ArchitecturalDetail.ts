import {toySheet} from './ToyIllustration';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {surfaceMaterial} from './PBRMaterial';

type Part={matrix:T.Matrix4;color?:T.ColorRepresentation};
type Chunk={x:number;z:number;group:T.Group;parts:Part[][]};
const cube=new RoundedBoxGeometry(1,1,1,2,.08);
const screw=new T.CylinderGeometry(.065,.065,.045,8);
let shadowTexture:T.CanvasTexture|undefined;
export function contactShadow(width:number,depth=width,opacity=.28){if(!shadowTexture){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!,radial=c.createRadialGradient(64,64,8,64,64,64);radial.addColorStop(0,'rgba(34,30,43,.68)');radial.addColorStop(.45,'rgba(34,30,43,.36)');radial.addColorStop(1,'rgba(34,30,43,0)');c.fillStyle=radial;c.fillRect(0,0,128,128);shadowTexture=new T.CanvasTexture(canvas);shadowTexture.userData.sharedSurface=true;}
 const m=new T.Mesh(new T.PlaneGeometry(width,depth),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));m.rotation.x=-Math.PI/2;m.position.y=.007;m.renderOrder=1;return m;
}
function starGeometry(){const shape=new T.Shape();for(let n=0;n<10;n++){const a=n*Math.PI/5+Math.PI/2,r=n%2?.18:.4;n?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSegments:2,bevelSize:.024,bevelThickness:.02,steps:1});g.computeVertexNormals();return g;}
const star=starGeometry();
/** Facade moulding and floor joints are rendered in compact batches, never colliders. */
export class ArchitecturalDetail {
 group=new T.Group();private chunks:Chunk[]=[];
 constructor(layout:string[],stage:number){const body=surfaceMaterial(stage===0?0xf9dca4:stage===1?0xffc9d7:0x8499c4,stage===0?'wood':'plastic',{map:toySheet(stage===0?'wood':'panel')}),trim=surfaceMaterial(stage===0?0xeac781:stage===1?0xd29ea2:0xcab878,'metal'),badge=surfaceMaterial(stage===1?0xdffcf2:0xffe399,'plastic'),joints=surfaceMaterial(stage===0?0xb19a70:stage===1?0xaabbc2:0x667da0,'rubber');const shadowTemplate=contactShadow(1,1,.48),shadowMaterial=shadowTemplate.material;shadowTemplate.geometry.dispose();const materials=[body,trim,badge,joints],geometries=[cube,cube,star,screw,new T.BoxGeometry(1,1,1),new T.PlaneGeometry(1,1)];const map=new Map<string,Chunk>(),pose=new T.Object3D(),face=new T.Matrix4();
  const chunk=(x:number,z:number)=>{const cx=Math.floor(x/24)*24+12,cz=Math.floor(z/24)*24+12,key=`${cx}:${cz}`;let ch=map.get(key);if(!ch){ch={x:cx,z:cz,group:new T.Group(),parts:[[],[],[],[],[],[]]};ch.group.position.set(cx,0,cz);map.set(key,ch);this.chunks.push(ch);this.group.add(ch.group);}return ch;};
  const part=(ch:Chunk,bucket:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,color?:T.ColorRepresentation,rotationX=0)=>{pose.position.set(x,y,z);pose.rotation.set(rotationX,0,0);pose.scale.set(sx,sy,sz);pose.updateMatrix();ch.parts[bucket].push({matrix:new T.Matrix4().multiplyMatrices(face,pose.matrix),color});};
  for(let r=0;r<layout.length;r++)for(let c=0;c<layout[r].length;c++){
   const x=c*4+2,z=r*4+2,ch=chunk(x,z);
   if(layout[r][c]==='#'){for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){if(layout[r+dz]?.[c+dx]!=='.')continue;const yaw=dx?dx*Math.PI/2:dz<0?Math.PI:0;face.makeRotationY(yaw);face.setPosition(x+dx*2-ch.x,0,z+dz*2-ch.z);
    // Recessed body, raised moulding, then bevelled badges and bolt caps.
    part(ch,0,0,3.05,.075,1.45,1.6,.12);part(ch,5,0,.009,.2,3.95,.6,1,undefined,-Math.PI/2);
    for(const side of [-1,1]){part(ch,1,side*1.72,2.5,.17,.1,4.08,.1);part(ch,1,0,2.5+side*2.01,.17,3.54,.1,.1);part(ch,0,side*.9,2.5,.17,.045,3.38,.08);}
    const stripeColor=stage===0?0x98dfd4:stage===1?0xffe3a5:0xa5c4e3;for(const y of [1.12,3.86])part(ch,0,0,y,.17,2.95,.065,.095,stripeColor);
    part(ch,2,0,3.06,.245,1.1,1.1,1);part(ch,1,0,1.92,.195,1.25,.075,.07);for(const bx of [-1.56,1.56])for(const by of [.65,4.35])part(ch,3,bx,by,.245,1,1,1,undefined,Math.PI/2);
   }}else{face.identity();face.setPosition(x-ch.x,0,z-ch.z);for(const p of [-1,0,1]){part(ch,4,p,-.015,0,.023,.018,3.85);part(ch,4,0,-.015,p,3.85,.018,.023);}}
  }
  for(const ch of this.chunks)for(let b=0;b<6;b++){const parts=ch.parts[b];if(!parts.length)continue;const mat=b===3?trim:b===4?joints:b===5?shadowMaterial:materials[b],mesh=new T.InstancedMesh(geometries[b],mat,parts.length);for(let n=0;n<parts.length;n++){mesh.setMatrixAt(n,parts[n].matrix);if(parts[n].color)mesh.setColorAt(n,new T.Color(parts[n].color));else mesh.setColorAt(n,new T.Color(0xffffff));}mesh.userData.detailBucket=b;mesh.castShadow=b<4;mesh.receiveShadow=b!==5;if(b===5)mesh.renderOrder=1;mesh.computeBoundingSphere();ch.group.add(mesh);ch.parts[b]=[];}
 }
 update(position:T.Vector3,quality='high'){const range=quality==='low'?18:quality==='medium'?27:36;for(const ch of this.chunks){ch.group.visible=Math.hypot(position.x-ch.x,position.z-ch.z)<range+17;for(const mesh of ch.group.children){const bucket=mesh.userData.detailBucket;mesh.visible=quality!=='low'||bucket!==3&&bucket!==4;}}}
}
