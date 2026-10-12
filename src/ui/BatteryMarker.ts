/** Loot is revealed by the defeat event, regardless of fog or the player's current floor. */
export function batteryMarkers(items:{kind:string;taken:boolean;x:number;z:number;mesh:{position:{y:number};userData:Record<string,any>}}[]){return items.filter(i=>i.kind==='BATTERY'&&!i.taken).map(i=>({x:i.x,z:i.z,feet:i.mesh.userData.baseY??i.mesh.position.y-1.3}));}
