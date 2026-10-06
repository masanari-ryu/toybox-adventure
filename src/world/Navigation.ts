import {supportHeight} from './CastleFloors';
import {activeStage} from '../stages/Stages';
import {bossEntranceClosed,doors} from './Threats';
import {canMoveAt} from './layout';
import {layout,cell,canMove,navigationRevision} from './layout';
type CastlePoint={x:number;z:number;y:number;id:string};
const castleEdges=new Map<string,CastlePoint[]>();let edgeVersion='';
function prepareEdges(gate:boolean){const version=`${navigationRevision}/${gate}/${bossEntranceClosed}/${doors.map(d=>d.open?1:0).join('')}`;if(version!==edgeVersion){edgeVersion=version;castleEdges.clear();}}
const directions=[[2,0],[-2,0],[0,2],[0,-2]] as const;
/** Cache collision-tested graph edges, preserving BFS order and every floor rule. */
function adjacent(p:{x:number;z:number;y:number},gate:boolean){const key=`${p.x}/${p.z}/${p.y}`;const cached=castleEdges.get(key);if(cached)return cached;const edges:CastlePoint[]=[];for(const [dx,dz]of directions){const x=p.x+dx,z=p.z+dz,y=supportHeight(x,z,p.y,1.05);if(p.y-y>1.3||!canTraverseCastle(p.x,p.z,p.y,x,z,gate))continue;edges.push({x,z,y,id:`${x},${z},${Math.round(y*2)}`});}if(castleEdges.size<16000)castleEdges.set(key,edges);return edges;}
export function route(x:number,z:number,tx:number,tz:number,gate:boolean,feet?:number,targetFeet?:number):{x:number,z:number}|null {
 if(activeStage===2&&feet!==undefined)return elevatedRoute(x,z,feet,tx,tz,gate,targetFeet);
 const start=[Math.floor(x/cell),Math.floor(z/cell)],end=[Math.floor(tx/cell),Math.floor(tz/cell)];if(start[0]===end[0]&&start[1]===end[1])return{x:tx,z:tz};
 const queue:[number,number][]=[[start[0],start[1]]],parents=new Map<string,string>();const first=start.join(',');parents.set(first,'');let target='';for(let n=0;n<queue.length&&n<600;n++){const [a,b]=queue[n];if(a===end[0]&&b===end[1]){target=`${a},${b}`;break;}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,r=b+dz,id=`${c},${r}`;if(!parents.has(id)&&layout[r]?.[c]&&canMove(c*4+2,r*4+2,gate)){parents.set(id,`${a},${b}`);queue.push([c,r]);}}}if(!target)return null;while(parents.get(target)!==first&&parents.get(target))target=parents.get(target)!;const [a,b]=target.split(',').map(Number);return{x:a*4+2,z:b*4+2};
}

export function elevatedRoute(x:number,z:number,feet:number,tx:number,tz:number,gate:boolean,targetFeet=feet):{x:number,z:number}|null {
 prepareEdges(gate);
 const key=(x:number,z:number,y:number)=>`${x},${z},${Math.round(y*2)}`;
 const sx=Math.round(x/2)*2,sz=Math.round(z/2)*2,start={x:sx,z:sz,y:feet},first=key(sx,sz,feet),parents=new Map<string,string>([[first,'']]),points=new Map([[first,start]]),queue=[first];let found='';
 for(let n=0;n<queue.length&&n<7000;n++){const id=queue[n],p=points.get(id)!;if(Math.hypot(tx-p.x,tz-p.z)<2.1&&Math.abs(targetFeet-p.y)<.65){found=id;break;}
 for(const next of adjacent(p,gate)){if(parents.has(next.id))continue;parents.set(next.id,id);points.set(next.id,next);queue.push(next.id);}}
 if(!found)return null;if(found===first)return canTraverseCastle(x,z,feet,tx,tz,gate)?{x:tx,z:tz}:null;while(parents.get(found)!==first&&parents.get(found))found=parents.get(found)!;const next=points.get(found)!;return{x:next.x,z:next.z};
}

/** Follow supported floors throughout each edge; never cut corners across a drop. */
export function canTraverseCastle(x:number,z:number,feet:number,tx:number,tz:number,gate:boolean){let y=feet;const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.3));for(let n=1;n<=steps;n++){const px=x+(tx-x)*n/steps,pz=z+(tz-z)*n/steps,ny=supportHeight(px,pz,y);if(Math.abs(ny-y)>.55||!canMoveAt(px,pz,ny+1.65,gate))return false;y=ny;}return true;}
