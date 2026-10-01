export type AiState='Idle'|'Detect'|'Alert'|'Chase'|'Attack'|'Cooldown'|'Search';
export class Brain {
 state:AiState='Idle';last={x:0,z:0};until=0;surprisedUntil=0;nextReaction=0;
 hit(x:number,z:number,now:number){this.last={x,z};this.until=now+16;this.state='Alert';if(now>=this.nextReaction){this.surprisedUntil=now+.22;this.nextReaction=now+1;}}
 update(x:number,z:number,visible:boolean,player:{x:number,z:number},now:number,cooldown:number){
 if(visible){this.last={...player};this.until=now+9;if(this.state==='Idle'){this.state='Detect';this.surprisedUntil=now+.8;}}
 if(now<this.surprisedUntil)return this.last;
 if(!visible&&now>=this.until){this.state='Idle';return null;}
 const d=Math.hypot(this.last.x-x,this.last.z-z);
 this.state=visible?(cooldown>0?'Cooldown':d<5?'Attack':'Chase'):'Search';
 if(!visible&&d<1){const phase=Math.floor(now*1.5)%4;return{x:this.last.x+Math.cos(phase*Math.PI/2)*3,z:this.last.z+Math.sin(phase*Math.PI/2)*3};}
 return this.last;
 }
 reset(){this.state='Idle';this.until=this.surprisedUntil=this.nextReaction=0;}
}
