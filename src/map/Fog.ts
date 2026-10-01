import {layout,cell,wall} from '../world/layout';
export class Fog {
 visited=new Set<string>();
 reveal(x:number,z:number,gate=false){const c=Math.floor(x/cell),r=Math.floor(z/cell);for(let b=r-3;b<=r+3;b++)for(let a=c-3;a<=c+3;a++){if(!layout[b]?.[a]||Math.hypot(a-c,b-r)>3)continue;const tx=a*cell+2,tz=b*cell+2,d=Math.hypot(tx-x,tz-z);let seen=true;for(let n=.5;n<d-1.8;n+=.5)if(wall(x+(tx-x)*n/d,z+(tz-z)*n/d,gate)){seen=false;break;}if(seen)this.visited.add(`${a},${b}`);}}
 known(x:number,z:number){return this.visited.has(`${Math.floor(x/cell)},${Math.floor(z/cell)}`);}reset(){this.visited.clear();}
}
