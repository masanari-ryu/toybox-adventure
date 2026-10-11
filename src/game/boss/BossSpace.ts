import type {Game}from '../Game';import type {Enemy}from '../Enemy';import {canMoveAt,navigationRevision}from '../../world/layout';import {supportHeight}from '../../world/CastleFloors';import {enteredMajorRoom}from '../../ui/MajorEnemyHealth';import {doors,bossEntranceClosed}from '../../world/Threats';
export function bossCanMove(g:Game,e:Enemy,x:number,z:number){return canMoveAt(x,z,e.floorY+1.65,g.gate)&&(g.stageIndex!==2||Math.abs(supportHeight(x,z,e.floorY)-e.floorY)<.5);}
export function safeBossDestination(g:Game,e:Enemy,x:number,z:number,separation=5){return Math.hypot(x-g.position.x,z-g.position.z)>=separation&&enteredMajorRoom(g.stageIndex,'KING PUNI',x,z,e.floorY)&&[[0,0],[.8,0],[-.8,0],[0,.8],[0,-.8]].every(([dx,dz])=>bossCanMove(g,e,x+dx,z+dz))&&!g.enemies.some(other=>other!==e&&other.alive&&Math.abs(other.floorY-e.floorY)<2&&Math.hypot(other.group.position.x-x,other.group.position.z-z)<3.5);}
export function bossPositions(g:Game,e:Enemy,count:number){const result:{x:number;z:number}[]=[];for(let n=0;n<180&&result.length<count;n++){const angle=n*2.399963+e.attackCycle*.73,r=5+n%8*1.4,x=e.home.x+Math.sin(angle)*r,z=e.home.z+Math.cos(angle)*r;if(safeBossDestination(g,e,x,z)&&result.every(p=>Math.hypot(p.x-x,p.z-z)>5))result.push({x,z});}return result;}
type Point={x:number;z:number};
type Pursuit={version:string;target:Point;at:number;path:Point[];next:number};
const pursuits=new WeakMap<Enemy,Pursuit>(),edges=new Map<string,Point[]>();let edgeVersion='';
function version(g:Game,e:Enemy){return `${navigationRevision}/${g.stageIndex}/${e.floorY}/${g.gate}/${bossEntranceClosed}/${doors.map(d=>+d.open).join('')}`;}
/** A visible ray is not sufficient: the actor's whole collision footprint must fit. */
export function bossClearPath(g:Game,e:Enemy,from:Point,to:Point){
 const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.35));
 for(let n=1;n<=steps;n++)if(!bossCanMove(g,e,from.x+(to.x-from.x)*n/steps,from.z+(to.z-from.z)*n/steps))return false;
 return true;
}
function neighbors(g:Game,e:Enemy,p:Point){
 const key=`${p.x},${p.z}`,known=edges.get(key);if(known)return known;
 const found:Point[]=[];for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]]){const next={x:p.x+dx,z:p.z+dz};if(bossClearPath(g,e,p,next))found.push(next);}
 edges.set(key,found);return found;
}
/** Boss-only, collision-tested waypoints. Keep them until reached instead of cutting corners each frame. */
function findPath(g:Game,e:Enemy,target:Point){
 const p=e.group.position,candidates:Point[]=[];
 for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const next={x:Math.round(p.x/2)*2+dx*2,z:Math.round(p.z/2)*2+dz*2};if(bossCanMove(g,e,next.x,next.z)&&bossClearPath(g,e,p,next))candidates.push(next);}
 candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));if(!candidates.length)return [];
 const first=candidates[0],id=(v:Point)=>`${v.x},${v.z}`,queue=[first],parents=new Map<string,Point|null>([[id(first),null]]);let found:Point|undefined;
 for(let n=0;n<queue.length&&n<5000;n++){const current=queue[n];if(Math.hypot(current.x-target.x,current.z-target.z)<3&&bossClearPath(g,e,current,target)){found=current;break;}
  for(const next of neighbors(g,e,current))if(!parents.has(id(next))){parents.set(id(next),current);queue.push(next);}
 }
 if(!found)return [];const path:Point[]=[{x:target.x,z:target.z}];for(let current:Point|null=found;current;current=parents.get(id(current))??null)path.push(current);return path.reverse();
}
export function bossWalk(g:Game,e:Enemy,target:Point,dt:number,speed:number,retreat=false){
 const p=e.group.position;let next:Point=target;
 if(!retreat&&!bossClearPath(g,e,p,target)){
  const stamp=version(g,e);if(edgeVersion!==stamp){edgeVersion=stamp;edges.clear();}
  let plan=pursuits.get(e);
  if(!plan||plan.version!==stamp||Math.hypot(plan.target.x-target.x,plan.target.z-target.z)>=2||(!plan.path.length||plan.next>=plan.path.length)&&g.time>=plan.at){plan={version:stamp,target:{...target},at:g.time+.6,path:findPath(g,e,target),next:0};pursuits.set(e,plan);}
  while(plan.next<plan.path.length&&Math.hypot(plan.path[plan.next].x-p.x,plan.path[plan.next].z-p.z)<.12)plan.next++;
  const waypoint=plan.path[plan.next];if(!waypoint)return;next=waypoint;
 }else if(!retreat)pursuits.delete(e);
 const dx=next.x-p.x,dz=next.z-p.z,d=Math.hypot(dx,dz),sign=retreat?-1:1,step=Math.min(speed*dt,d);if(d<.001)return;
 const destination={x:p.x+dx/d*step*sign,z:p.z+dz/d*step*sign};
 if(bossClearPath(g,e,p,destination)){p.x=destination.x;p.z=destination.z;}else if(retreat){if(bossCanMove(g,e,destination.x,p.z))p.x=destination.x;if(bossCanMove(g,e,p.x,destination.z))p.z=destination.z;}else pursuits.delete(e);
 p.y=e.floorY;e.group.rotation.y=Math.atan2(p.x-target.x,p.z-target.z);
}
