export const areaNames=['01 · TOYBOX CLOISTER','02 · CLOCKWORK CONTROL','03 · LAVA WORKS','04 · TOXIC LABYRINTH','05 · RAINBOW CORE'];
export function areaAt(x:number,z:number){return x>74&&z>30?4:z>32?3:x>64?2:x>28?1:0;}
export const weaponNames=[['ポップバスター','ポップバスター 2'],['あわバスター','あわバスター 2'],['サンダーボルト','サンダーボルト 2'],['カタナ','カタナ'],['アサルトライフル','アサルトライフル'],['カノンほう','カノンほう'],['サンダーボルト かい','サンダーボルト かい']];
export class Arsenal {
 nightmareOnly=false;justAcquired:number|undefined;nightmareWeapons=new Set<number>();murasame=false;unlocked=[true,false,false,false];levels=[0,0,0,0];
 unlock(n:number){if(n>=4&&n<=6)this.nightmareWeapons.add(n);else if(n>=0&&n<4)this.unlocked[n]=true;}upgrade(n:number){this.levels[n]=1;}
 activateNightmare(){this.nightmareOnly=true;this.nightmareWeapons.add(4);if(this.unlocked[1])this.nightmareWeapons.add(5);if(this.unlocked[2])this.nightmareWeapons.add(6);if(this.unlocked[3])this.murasame=true;}
 bestRanged(){if(this.nightmareOnly){for(let n=6;n>=4;n--)if(this.nightmareWeapons.has(n))return n;}for(let n=2;n>=0;n--)if(this.unlocked[n])return n;return 0;}
 choices(){return [...(this.nightmareOnly?[]:[this.bestRanged()]),...Array.from(this.nightmareWeapons).sort(),...(this.unlocked[3]?[3]:[])];}
 resolve(n:number){if(!this.nightmareOnly&&n===this.justAcquired&&n<4&&this.unlocked[n])return n;this.justAcquired=undefined;const selected=this.nightmareOnly&&n<3?n+4:n;return this.choices().includes(selected)?selected:this.bestRanged();}
 select(n:number,current:number){const selected=this.nightmareOnly&&n<3?n+4:n;return this.choices().includes(selected)?selected:this.resolve(current);}
 next(current:number){this.justAcquired=undefined;const choices=this.choices(),index=choices.indexOf(current);return choices[(index+1)%choices.length];}
 reset(){this.nightmareOnly=false;this.justAcquired=undefined;this.nightmareWeapons.clear();this.murasame=false;this.unlocked=[true,false,false,false];this.levels=[0,0,0,0];}
}
