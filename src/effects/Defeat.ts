import * as T from 'three';
import type {Game} from '../game/Game';
import type {Enemy} from '../game/Enemy';
type Defeat={enemy:Enemy;elapsed:number;rings:T.Mesh[];scale:number;sparks:T.Points;velocities:Float32Array;origin:T.Vector3};
let sparkle:T.CanvasTexture|undefined;
function sparkleMap(){if(!sparkle){const a=document.createElement('canvas');a.width=a.height=32;const c=a.getContext('2d')!;c.fillStyle='#ffffff';c.beginPath();c.moveTo(16,1);c.quadraticCurveTo(18,13,31,16);c.quadraticCurveTo(18,18,16,31);c.quadraticCurveTo(14,18,1,16);c.quadraticCurveTo(14,14,16,1);c.fill();sparkle=new T.CanvasTexture(a);}return sparkle;}
export class DefeatEffects {
 entries:Defeat[]=[];
 prewarm(){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([0,0,0],3));geometry.setAttribute('color',new T.Float32BufferAttribute([1,1,1],3));const points=new T.Points(geometry,new T.PointsMaterial({map:sparkleMap(),transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending}));points.visible=false;return points;}
 add(g:Game,e:Enemy){e.group.visible=true;const color=e.kind==='TOX MUNCHER'?0xa7ee6f:e.kind==='LAVA HOPPER'?0xffb26f:e.kind==='BOTTY'?0x6eeeff:0xff94da,origin=e.group.position.clone().add(new T.Vector3(0,e.baseScale,0));
 const rings=[0,1].map(n=>{const m=new T.Mesh(new T.TorusGeometry(.8,n?.012:.032,5,48),new T.MeshBasicMaterial({color:n?0xffdf83:color,transparent:true,opacity:n?.55:.65,depthWrite:false}));m.position.copy(origin);m.rotation.set(n?.7:Math.PI/2,n?.4:0,0);g.scene.add(m);return m;});
 const count=g.input.touch?24:40,positions=new Float32Array(count*3),velocities=new Float32Array(count*3),colors=new Float32Array(count*3),palette=[new T.Color(color),new T.Color(0xffe59c),new T.Color(0xa3fff1),new T.Color(0xfff6e8)];for(let n=0;n<count;n++){const angle=n*2.399,speed=2.5+Math.random()*3;velocities[n*3]=Math.cos(angle)*speed;velocities[n*3+1]=2.5+Math.random()*4;velocities[n*3+2]=Math.sin(angle)*speed;palette[n%4].toArray(colors,n*3);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('color',new T.BufferAttribute(colors,3));const sparks=new T.Points(geometry,new T.PointsMaterial({map:sparkleMap(),size:e.kind==='KING PUNI'?.4:.22,transparent:true,opacity:.9,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending}));sparks.position.copy(origin);sparks.frustumCulled=false;g.scene.add(sparks);this.entries.push({enemy:e,elapsed:0,rings,scale:e.baseScale,sparks,velocities,origin});
 g.sound.tone(1250,.22,'triangle',.08);g.sound.tone(620,.32,'sine',.055);
 }
 update(g:Game,dt:number){for(let n=this.entries.length-1;n>=0;n--){const v=this.entries[n];v.elapsed+=dt;const t=v.elapsed,pop=Math.sin(Math.min(1,t/.23)*Math.PI);v.enemy.group.scale.set(v.scale*Math.max(.01,1+pop*.26-t*1.7),v.scale*Math.max(.01,1-pop*.24-t*1.15),v.scale*Math.max(.01,1+pop*.26-t*1.7));v.enemy.body.rotation.z=Math.sin(t*15)*.16;v.enemy.body.position.y=t*1.1;
 for(let k=0;k<v.rings.length;k++){const ring=v.rings[k];ring.scale.setScalar(1+t*(k?5.5:7));(ring.material as T.MeshBasicMaterial).opacity=Math.max(0,(k?.55:.65)*(1-t/.8));}const positions=v.sparks.geometry.attributes.position as T.BufferAttribute;for(let k=0;k<positions.count;k++){const o=k*3;positions.setXYZ(k,v.velocities[o]*t,v.velocities[o+1]*t-4*t*t,v.velocities[o+2]*t);}positions.needsUpdate=true;const material=v.sparks.material as T.PointsMaterial;material.opacity=Math.max(0,.9-t);material.size=(v.enemy.kind==='KING PUNI'?.4:.22)*(1+t*.4);
 if(t>.8){v.enemy.group.visible=false;this.dispose(g,v);this.entries.splice(n,1);}}}
 private dispose(g:Game,v:Defeat){for(const r of v.rings)g.dispose(r);v.sparks.removeFromParent();v.sparks.geometry.dispose();(v.sparks.material as T.Material).dispose();}
 clear(g:Game){for(const v of this.entries){v.enemy.group.visible=false;this.dispose(g,v);}this.entries=[];}
}
