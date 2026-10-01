import * as T from 'three';
export class LightningEffects{
 private arcs:{group:T.Group;life:number}[]=[];
 add(scene:T.Scene,from:T.Vector3,to:T.Vector3){const group=new T.Group(),direction=to.clone().sub(from),side=new T.Vector3(0,1,0).cross(direction).normalize();if(side.lengthSq()<.1)side.set(1,0,0);const up=direction.clone().normalize().cross(side);for(let strand=0;strand<3;strand++){const points:T.Vector3[]=[];for(let n=0;n<=24;n++){const p=from.clone().lerp(to,n/24),spread=n===0||n===24?0:.2+strand*.09;p.addScaledVector(side,(Math.random()-.5)*spread*2).addScaledVector(up,(Math.random()-.5)*spread*2);points.push(p);}const curve=new T.CatmullRomCurve3(points);for(const [radius,color,opacity]of [[.035,0xeaffff,1],[.11,0x48bfff,.32]] as const){const tube=new T.Mesh(new T.TubeGeometry(curve,48,radius,4,false),new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));group.add(tube);}}scene.add(group);this.arcs.push({group,life:.3});}
 update(dt:number){for(let n=this.arcs.length-1;n>=0;n--){const arc=this.arcs[n];arc.life-=dt;arc.group.traverse(o=>{if(o instanceof T.Mesh)(o.material as T.MeshBasicMaterial).opacity=(o.geometry.parameters.radius<.05?1:.32)*Math.max(0,arc.life/.3);});if(arc.life<=0){this.dispose(arc.group);this.arcs.splice(n,1);}}}
 private dispose(group:T.Group){group.removeFromParent();group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});}
 clear(){for(const arc of this.arcs)this.dispose(arc.group);this.arcs=[];}
}
