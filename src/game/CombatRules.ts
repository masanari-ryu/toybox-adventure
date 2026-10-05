/** Difficulty-specific additions leave ordinary health and other movement unchanged. */
export function infantrySpeed(challenge:number){return challenge>=3?1.5:challenge>=2?1.2:1;}
export function puniShoots(challenge:number){return challenge>=2;}
export function inBossArena(x:number,z:number,floorY:number){return floorY>=10&&x>80&&x<98&&z>8&&z<30;}
