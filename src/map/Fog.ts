import {activeStage} from '../stages/Stages';
import {floorNumber} from '../world/CastleFloors';
import {layout,cell,wall,wallAt} from '../world/layout';
export class Fog {
 visited=new Set<string>();floorVisited=[new Set<string>(),new Set<string>(),new Set<string>()];currentFloor=1;
 reveal(x:number,z:number,gate=false,y=1.65){this.currentFloor=activeStage===2?floorNumber(y-1.65):1;this.visited=this.floorVisited[this.currentFloor-1];const c=Math.floor(x/cell),r=Math.floor(z/cell);for(let b=r-3;b<=r+3;b++)for(let a=c-3;a<=c+3;a++){if(!layout[b]?.[a]||Math.hypot(a-c,b-r)>3)continue;const tx=a*cell+2,tz=b*cell+2,d=Math.hypot(tx-x,tz-z);let seen=true;for(let n=.5;n<d-1.8;n+=.5)if(activeStage===2?wallAt(x+(tx-x)*n/d,z+(tz-z)*n/d,y,gate):wall(x+(tx-x)*n/d,z+(tz-z)*n/d,gate)){seen=false;break;}if(seen)this.visited.add(`${a},${b}`);}}
 known(x:number,z:number){return this.visited.has(`${Math.floor(x/cell)},${Math.floor(z/cell)}`);}reset(){for(const set of this.floorVisited)set.clear();this.currentFloor=1;this.visited=this.floorVisited[0];}
}
