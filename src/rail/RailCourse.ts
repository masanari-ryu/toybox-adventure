import * as T from 'three';
export const railLengthMultiplier=4;
export const railSpeedMultiplier=1.5;
export const originalRideDurations=[20,23,24] as const;
export const rideDurations=originalRideDurations.map(duration=>duration*railLengthMultiplier/railSpeedMultiplier);
export function railCurve(stage:number){const bend=stage===1?-1:1,height=stage===2?1.3:1;return new T.CatmullRomCurve3([
 new T.Vector3(0,5,0),new T.Vector3(0,11,-65),new T.Vector3(35*bend,30*height,-135),new T.Vector3(65*bend,8,-205),new T.Vector3(-22*bend,17,-275),new T.Vector3(-65*bend,35*height,-345),new T.Vector3(0,7,-430),new T.Vector3(16*bend,5,-510),
 ].map(p=>p.sub(new T.Vector3(0,5,0)).multiplyScalar(railLengthMultiplier).add(new T.Vector3(0,5,0))),false,'centripetal');}
export class RailProgress {
 elapsed=0;arrived=false;
 constructor(public stage:number){}
 get fraction(){return Math.min(1,this.elapsed/rideDurations[this.stage]);}
 update(dt:number){if(this.arrived)return false;this.elapsed=Math.min(rideDurations[this.stage],this.elapsed+Math.max(0,dt));if(this.fraction>=1){this.arrived=true;return true;}return false;}
 restart(){this.elapsed=0;this.arrived=false;}
}
export function canBoard(bossClear:boolean,fragment:boolean,battery:boolean){return bossClear&&fragment&&battery;}
