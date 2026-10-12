import {canMoveAt,layout,navigationRevision} from '../world/layout';
import {supportHeight,topHeight} from '../world/CastleFloors';
import {canTraverseCastle} from '../world/Navigation';
import {doors,bossEntranceClosed} from '../world/Threats';
export type Waypoint={x:number;y:number;z:number};
const edges=new Map<string,Waypoint[]>();let version='';
/** Debug-only route retention. Uses the same collision and supported-floor rules as actors. */
export function walkingPath(start:Waypoint,x:number,z:number,stageIndex:number,gate:boolean):Waypoint[]|null{
 const signature=`${navigationRevision}/${stageIndex}/${gate}/${bossEntranceClosed}/${doors.map(d=>+d.open).join('')}`;
 if(version!==signature){version=signature;edges.clear();}
 const castle=stageIndex===2,target={x,z,y:castle?topHeight(x,z):0};
 const traverse=(a:Waypoint,b:Waypoint)=>{
  if(castle){
   if(!canTraverseCastle(a.x,a.z,a.y,b.x,b.z,gate))return false;
   let y=a.y;const count=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.15));
   for(let n=1;n<=count;n++)y=supportHeight(a.x+(b.x-a.x)*n/count,a.z+(b.z-a.z)*n/count,y);
   // The legacy predicate permits walking UNDER a deck; that is not an edge to its upper surface.
   return Math.abs(y-b.y)<.15;
  }
  const count=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.3));
  for(let n=1;n<=count;n++)if(!canMoveAt(a.x+(b.x-a.x)*n/count,a.z+(b.z-a.z)*n/count,1.65,gate))return false;
  return true;
 };
 if(!canMoveAt(x,z,target.y+1.65,gate))return null;
 if(Math.abs(start.y-target.y)<.55&&traverse(start,target))return [target];
 const key=(p:Waypoint)=>`${p.x}/${p.z}/${Math.round(p.y*100)}`;
 const queue:Waypoint[]=[],parents=new Map<string,string>(),points=new Map<string,Waypoint>();
 const roots:Waypoint[]=[];
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
  const px=Math.round(start.x/2)*2+dx*2,pz=Math.round(start.z/2)*2+dz*2;
  const p={x:px,z:pz,y:castle?supportHeight(px,pz,start.y):0};
  if(traverse(start,p))roots.push(p);
 }
 roots.sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z));
 for(const p of roots){const id=key(p);if(parents.has(id))continue;queue.push(p);parents.set(id,'');points.set(id,p);}
 for(let n=0;n<queue.length&&n<12000;n++){
  const p=queue[n],id=key(p);
  if(Math.hypot(x-p.x,z-p.z)<=2.1&&Math.abs(p.y-target.y)<.55&&traverse(p,target)){
   const result:Waypoint[]=[target];let cursor=id;
   while(cursor){result.unshift(points.get(cursor)!);cursor=parents.get(cursor)!;}
   return result;
  }
  let neighbors=edges.get(id);
  if(!neighbors){neighbors=[];
   for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]]){
    const px=p.x+dx,pz=p.z+dz;if(px<2||pz<2||px>layout[0].length*4-4||pz>layout.length*4-4)continue;
    const q={x:px,z:pz,y:castle?supportHeight(px,pz,p.y,1.05):0};
    if(traverse(p,q))neighbors.push(q);
   }
   if(edges.size<16000)edges.set(id,neighbors);
  }
  for(const q of neighbors){const next=key(q);if(parents.has(next))continue;parents.set(next,id);points.set(next,q);queue.push(q);}
 }
 return null;
}
