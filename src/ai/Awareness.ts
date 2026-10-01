import {lineOfSight} from '../world/layout';
import {activeStage} from '../stages/Stages';

/** Partition floors at structural walls; opening a door does not merge rooms. */
export function roomAt(stage:number,x:number,z:number){
 if(stage===0)return x<38?(z<18?'west-upper':'west-plaza'):(z<14?'reward-room':z<30?'east-upper':'east-plaza');
 if(stage===1)return x<38?(z<26?'west-upper':'west-lower'):x<70?(z<30?'factory-upper':'factory-lower'):(z<14?'reward-room':z<38?'east-upper':'east-lower');
 return x<38?(z<30?'west-upper':'west-lower'):x<74?(z<38?'castle-upper':'castle-lower'):(x>=98?'reward-room':z<30?'boss-floor':'east-lower');
}
export function facingPlayer(x:number,z:number,yaw:number,px:number,pz:number){
 const dx=px-x,dz=pz-z;
 return dx*dx+dz*dz<.0001||(-Math.sin(yaw)*dx-Math.cos(yaw)*dz)>=0;
}
export function noticesPlayer(x:number,z:number,_yaw:number,px:number,pz:number,range:number,_alert:boolean,gate:boolean){
 const sameRoom=roomAt(activeStage,x,z)===roomAt(activeStage,px,pz);
 return (sameRoom||Math.hypot(px-x,pz-z)<range)&&lineOfSight(x,z,px,pz,gate);
}
