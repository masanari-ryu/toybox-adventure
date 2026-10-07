export const areaNames=['01 · TOYBOX CLOISTER','02 · CLOCKWORK CONTROL','03 · LAVA WORKS','04 · TOXIC LABYRINTH','05 · RAINBOW CORE'];
export function areaAt(x:number,z:number){return x>74&&z>30?4:z>32?3:x>64?2:x>28?1:0;}
export const weaponNames=[['ポップバスター','ポップバスター 2'],['あわバスター','あわバスター 2'],['サンダーボルト','サンダーボルト 2'],['カタナ','カタナ']];
export class Arsenal {
 unlocked=[true,false,false,false];levels=[0,0,0,0];
 unlock(n:number){this.unlocked[n]=true;}upgrade(n:number){this.levels[n]=1;}
 bestRanged(){for(let n=2;n>=0;n--)if(this.unlocked[n])return n;return 0;}
 choices(){return this.unlocked[3]?[this.bestRanged(),3]:[this.bestRanged()];}
 resolve(n:number){return this.choices().includes(n)?n:this.bestRanged();}
 select(n:number,current:number){return this.choices().includes(n)?n:this.resolve(current);}
 next(current:number){const choices=this.choices(),index=choices.indexOf(current);return choices[(index+1)%choices.length];}
 reset(){this.unlocked=[true,false,false,false];this.levels=[0,0,0,0];}
}
