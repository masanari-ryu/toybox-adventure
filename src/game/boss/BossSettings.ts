/** Boss-only controls; regular actors, weapons and waves use their existing settings. */
export const bossSettings={
 hpMultiplier:[1,1,1.5,1.5],windup:[1.25,1,.85,.75],recovery:[1.6,1.3,1.1,.95],speed:[.8,1,1.15,1.25],
 wallStun:[3.1,2.7,2.3,2.6],nightmareWallStun:3.5,transition:.9,maxProjectiles:24,
 charger:{speed:14,enragedSpeed:18,nightmareSpeed:22,duration:1.1,slamRadius:5.8,enragedRadius:7.2},
 magician:{warpCooldown:7,enragedWarpCooldown:5,warpWarning:1,warpRecovery:1.25,illusionLife:10,illusionCooldown:12,illusionCount:2,nightmareCount:4,cloneDamage:5},
 ruler:{near:7,far:16,slashes:2,nightmareSlashes:3,slashInterval:.6,slashReach:7.5},
 damage:[20,24,30],projectileSpeed:[7,9,11,12],
}as const;
export function bossHealth(challenge:number,current:number){return current*bossSettings.hpMultiplier[challenge];}
export function bossSecondForm(hp:number,max:number){return hp<=max*.5;}
export function rulerAttack(distance:number,second:boolean,nightmare:boolean,cycle:number){return distance<bossSettings.ruler.near?'slash':distance>=bossSettings.ruler.far?'fan':nightmare&&second&&cycle%2?'advance':'aim';}
