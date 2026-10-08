import {stages,makeLayout,type Stage} from '../stages/Stages';
import {floorNumber,topHeight} from '../world/CastleFloors';
const roomMaps=new WeakMap<Stage,Map<string,string>>();
/** Doors separate encounters, even while open. Discovery and collision remain unchanged. */
export function roomIdForStage(stage:Stage,x:number,z:number,feet=0):string{
 if(stage===stages[2]&&floorNumber(feet)>1){if(feet>=10)return x>98?'reward':z<30?'boss':'landing';return z>=45?'gallery-side':z<=26?'gallery-secret':'gallery-main';}
 let rooms=roomMaps.get(stage);if(!rooms){rooms=new Map();const map=makeLayout(stage),blocked=new Set(stage.doors.flatMap(d=>d.cells.map(c=>c.join(','))));if(stage.bossGate)blocked.add(stage.bossGate.join(','));
  for(let r=1;r<stage.h-1;r++)for(let c=1;c<stage.w-1;c++){const first=`${c},${r}`;if(rooms.has(first)||blocked.has(first)||map[r][c]!=='.')continue;const queue=[[c,r]];rooms.set(first,first);for(let n=0;n<queue.length;n++){const [a,b]=queue[n];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const key=`${a+dx},${b+dz}`;if(!rooms.has(key)&&!blocked.has(key)&&map[b+dz]?.[a+dx]==='.'){rooms.set(key,first);queue.push([a+dx,b+dz]);}}}}
  roomMaps.set(stage,rooms);
 }
 return rooms.get(`${Math.floor(x/4)},${Math.floor(z/4)}`)??'door';
}
export function nightmareRoom(stage:number,x:number,z:number,feet=0){return roomIdForStage(stages[stage],x,z,feet);}
export function introRoom(stage:Stage){return roomIdForStage(stage,...stage.start);}
export function spawnRoom(stage:Stage,x:number,z:number){return roomIdForStage(stage,x,z,stage===stages[2]?topHeight(x,z):0);}
export const nightmareRoomCap=(stage:Stage,room:string,multiplier=2)=>(room===introRoom(stage)?8:stage===stages[0]?12:14)*multiplier;
