/** Local patrol targets keep monsters moving without revealing the player through walls. */
export function patrolTarget(x:number,z:number,time:number,phase:number){const angle=Math.floor((time+phase)/3)*2.399;return{x:x+Math.cos(angle)*2,z:z+Math.sin(angle)*2};}
