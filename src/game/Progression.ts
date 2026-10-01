export const areaNames=['01 · TOYBOX CLOISTER','02 · CLOCKWORK CONTROL','03 · LAVA WORKS','04 · TOXIC LABYRINTH','05 · RAINBOW CORE'];
export function areaAt(x:number,z:number){return x>74&&z>30?4:z>32?3:x>64?2:x>28?1:0;}
export const weaponNames=[['ポップバスター','ポップバスター 2'],['あわバスター','あわバスター 2'],['ほしバスター','にじバスター'],['カタナ','カタナ']];
export class Arsenal {unlocked=[true,false,false,false];levels=[0,0,0,0];unlock(n:number){this.unlocked[n]=true;}upgrade(n:number){this.levels[n]=1;}select(n:number,current:number){return this.unlocked[n]?n:current;}next(current:number){for(let n=1;n<=4;n++){const w=(current+n)%4;if(this.unlocked[w])return w;}return current;}reset(){this.unlocked=[true,false,false,false];this.levels=[0,0,0,0];}}
