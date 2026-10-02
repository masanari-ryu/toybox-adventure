import {castleWall,surfaces} from './CastleFloors';
import {doors,obstacles,pools,lavaPools,switches} from './Threats';
import type {Stage} from '../stages/Stages';
import {stages,setActiveStage,activeStage,makeLayout} from '../stages/Stages';
export const cell=4;
export const layout:string[]=[];
export const keys:{x:number,z:number}[]=[];
export function configureStage(n:number,override?:Stage){setActiveStage(n);const s=override??stages[n];layout.splice(0,layout.length,...makeLayout(s));keys.splice(0,keys.length,{x:s.key[0],z:s.key[1]});doors.splice(0,doors.length,...s.doors.map(d=>({...d,open:false})));switches.splice(0,switches.length,...s.switches);pools.splice(0,pools.length,...s.pools);lavaPools.splice(0,lavaPools.length,...s.lava);obstacles.splice(0,obstacles.length,...(n===1?[{x:50,z:54,r:1.8},{x:58,z:18,r:1.8},{x:86,z:42,r:1.8},{x:54,z:14,r:1.25},{x:64,z:46,r:1.35}]:n===2?[{x:96,z:20,r:1.35}]:[]));}
configureStage(0);
export function wall(x:number,z:number,gate=false):boolean {const c=Math.floor(x/cell),r=Math.floor(z/cell),b=stages[activeStage].bossGate;return !layout[r]?.[c]||layout[r][c]==='#'||(!gate&&!!b&&c===b[0]&&r===b[1])||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r)||doors.some(d=>!d.open&&d.cells.some(([a,b])=>a===c&&b===r));}
export function canMove(x:number,z:number,gate=false){return [[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]].every(([a,b])=>!wall(x+a,z+b,gate))&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.55);}
export function lineOfSight(x:number,z:number,tx:number,tz:number,gate:boolean){const d=Math.hypot(tx-x,tz-z);for(let n=1;n<d/.5;n++){const t=n*.5/d;if(wall(x+(tx-x)*t,z+(tz-z)*t,gate))return false;}return true;}

/** Height-aware collision used by actors and projectiles in the third stage. */
export function wallAt(x:number,z:number,y:number,gate=false){if(activeStage!==2)return wall(x,z,gate);const feet=y-1.65;if(surfaces(x,z).some(h=>h>0&&Math.abs(y-h)<.15))return true;if(castleWall(x,z,feet,gate,!!doors[3]?.open))return true;if(feet>5.05){const c=Math.floor(x/4),r=Math.floor(z/4);return !layout[r]?.[c]||c<=0||r<=0||c>=layout[0].length-1||r>=layout.length-1; }return wall(x,z,gate);}
export function canMoveAt(x:number,z:number,y:number,gate=false){if(activeStage!==2)return canMove(x,z,gate);return [[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]].every(([dx,dz])=>!wallAt(x+dx,z+dz,y,gate));}
export function sightAt(x:number,z:number,y:number,tx:number,tz:number,ty:number,gate:boolean){const d=Math.hypot(tx-x,tz-z,ty-y);for(let n=.5;n<d-.8;n+=.5){const t=n/d;if(wallAt(x+(tx-x)*t,z+(tz-z)*t,y+(ty-y)*t,gate))return false;}return true;}
