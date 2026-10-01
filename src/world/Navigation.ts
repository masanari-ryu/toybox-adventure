import {layout,wall,cell,canMove} from './layout';
export function route(x:number,z:number,tx:number,tz:number,gate:boolean):{x:number,z:number}|null {
 const start=[Math.floor(x/cell),Math.floor(z/cell)],end=[Math.floor(tx/cell),Math.floor(tz/cell)];if(start[0]===end[0]&&start[1]===end[1])return{x:tx,z:tz};
 const queue:[number,number][]=[[start[0],start[1]]],parents=new Map<string,string>();const first=start.join(',');parents.set(first,'');let target='';for(let n=0;n<queue.length&&n<600;n++){const [a,b]=queue[n];if(a===end[0]&&b===end[1]){target=`${a},${b}`;break;}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,r=b+dz,id=`${c},${r}`;if(!parents.has(id)&&layout[r]?.[c]&&canMove(c*4+2,r*4+2,gate)){parents.set(id,`${a},${b}`);queue.push([c,r]);}}}if(!target)return null;while(parents.get(target)!==first&&parents.get(target))target=parents.get(target)!;const [a,b]=target.split(',').map(Number);return{x:a*4+2,z:b*4+2};
}
