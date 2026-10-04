import {supportHeight} from './CastleFloors';
import {activeStage} from '../stages/Stages';
import {canMoveAt} from './layout';
import {layout,wall,cell,canMove} from './layout';
export function route(x:number,z:number,tx:number,tz:number,gate:boolean,feet?:number,targetFeet?:number):{x:number,z:number}|null {
 if(activeStage===2&&feet!==undefined)return elevatedRoute(x,z,feet,tx,tz,gate,targetFeet);
 const start=[Math.floor(x/cell),Math.floor(z/cell)],end=[Math.floor(tx/cell),Math.floor(tz/cell)];if(start[0]===end[0]&&start[1]===end[1])return{x:tx,z:tz};
 const queue:[number,number][]=[[start[0],start[1]]],parents=new Map<string,string>();const first=start.join(',');parents.set(first,'');let target='';for(let n=0;n<queue.length&&n<600;n++){const [a,b]=queue[n];if(a===end[0]&&b===end[1]){target=`${a},${b}`;break;}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,r=b+dz,id=`${c},${r}`;if(!parents.has(id)&&layout[r]?.[c]&&canMove(c*4+2,r*4+2,gate)){parents.set(id,`${a},${b}`);queue.push([c,r]);}}}if(!target)return null;while(parents.get(target)!==first&&parents.get(target))target=parents.get(target)!;const [a,b]=target.split(',').map(Number);return{x:a*4+2,z:b*4+2};
}

export function elevatedRoute(x:number,z:number,feet:number,tx:number,tz:number,gate:boolean,targetFeet=feet):{x:number,z:number}|null {
 const key=(x:number,z:number,y:number)=>`${x},${z},${Math.round(y*2)}`;
 const sx=Math.round(x/2)*2,sz=Math.round(z/2)*2,start={x:sx,z:sz,y:feet},first=key(sx,sz,feet),parents=new Map<string,string>([[first,'']]),points=new Map([[first,start]]),queue=[first];let found='';
 for(let n=0;n<queue.length&&n<7000;n++){const id=queue[n],p=points.get(id)!;if(Math.hypot(tx-p.x,tz-p.z)<2.1&&Math.abs(targetFeet-p.y)<.65){found=id;break;}
 for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]]){const nx=p.x+dx,nz=p.z+dz,ny=supportHeight(nx,nz,p.y,1.05),nid=key(nx,nz,ny);if(parents.has(nid)||p.y-ny>1.3||!canTraverseCastle(p.x,p.z,p.y,nx,nz,gate))continue;parents.set(nid,id);points.set(nid,{x:nx,z:nz,y:ny});queue.push(nid);}}
 if(!found)return null;if(found===first)return canTraverseCastle(x,z,feet,tx,tz,gate)?{x:tx,z:tz}:null;while(parents.get(found)!==first&&parents.get(found))found=parents.get(found)!;const next=points.get(found)!;return{x:next.x,z:next.z};
}

/** Follow supported floors throughout each edge; never cut corners across a drop. */
export function canTraverseCastle(x:number,z:number,feet:number,tx:number,tz:number,gate:boolean){let y=feet;const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.3));for(let n=1;n<=steps;n++){const px=x+(tx-x)*n/steps,pz=z+(tz-z)*n/steps,ny=supportHeight(px,pz,y);if(Math.abs(ny-y)>.55||!canMoveAt(px,pz,ny+1.65,gate))return false;y=ny;}return true;}
