import * as T from 'three';
export const railLengthMultiplier=4;
export const railSpeedMultiplier=1.5;
export const originalRideDurations=[20,23,24] as const;
export const rideDurations=originalRideDurations.map(duration=>duration*railLengthMultiplier/railSpeedMultiplier);
export function railCurve(stage:number){const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);const points=stage===1?[v(0,5,0),v(0,12,-55),v(35,14,-110),v(35,14,-150)]:[v(0,5,0),v(0,12,-55),v(55,20,-90),v(85,18,-120),v(90,16,-145),v(60,14,-165),v(20,15,-150),v(-25,23,-185),v(-70,26,-220),v(-95,24,-250),v(-90,18,-280),v(-50,14,-290),v(0,18,-265),v(35,24,-235),v(50,26,-220),v(70,28,-245),v(50,22,-310)];
 if(stage>0){const base=points[points.length-1];for(let n=1;n<=24;n++){const a=n/24*Math.PI*2;points.push(v(base.x+n/24*8,base.y+35*(1-Math.cos(a)),base.z-35*Math.sin(a)-n/24*8));}}
 const last=points[points.length-1];if(stage===1)points.push(v(20,20,-250),v(-35,28,-310),v(0,14,-390));else if(stage===0)points.push(v(0,16,-350),v(-40,12,-400));else points.push(v(0,18,-400),v(-45,12,-450));points.push(v(0,8,-480),v(16,5,-540));
 const curve=new T.CatmullRomCurve3(points.map(p=>p.sub(v(0,5,0)).multiplyScalar(railLengthMultiplier).add(v(0,5,0))),false,'centripetal');curve.arcLengthDivisions=2400;curve.updateArcLengths();return curve;}
const frameCache=new WeakMap<T.CatmullRomCurve3,{up:T.Vector3;right:T.Vector3;t:T.Vector3}[]>();
/** Parallel transport keeps train, sleepers and camera continuous through a full inversion. */
export function railFrame(curve:T.CatmullRomCurve3,f:number){let frames=frameCache.get(curve);if(!frames){frames=[];let previous=curve.getTangentAt(0),up=new T.Vector3(0,1,0).projectOnPlane(previous).normalize();for(let n=0;n<=1440;n++){const t=curve.getTangentAt(n/1440);up.applyQuaternion(new T.Quaternion().setFromUnitVectors(previous,t)).projectOnPlane(t).normalize();const right=new T.Vector3().crossVectors(t,up).normalize();frames.push({up:up.clone(),right,t});previous=t;}frameCache.set(curve,frames);}const index=Math.min(1440,Math.max(0,Math.round(f*1440))),frame=frames[index];const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(frame.right,frame.up,frame.t.clone().negate()));return {...frame,q};}
export class RailProgress {
 elapsed=0;arrived=false;
 constructor(public stage:number){}
 get fraction(){return Math.min(1,this.elapsed/rideDurations[this.stage]);}
 update(dt:number){if(this.arrived)return false;this.elapsed=Math.min(rideDurations[this.stage],this.elapsed+Math.max(0,dt));if(this.fraction>=1){this.arrived=true;return true;}return false;}
 restart(){this.elapsed=0;this.arrived=false;}
}
export function canBoard(bossClear:boolean,fragment:boolean,battery:boolean){return bossClear&&fragment&&battery;}
