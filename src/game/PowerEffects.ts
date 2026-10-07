export const referenceThunderDamage=190*1.5;
export function nightmareHealth(kind:string,challenge:number,current:number){
 if(challenge!==3)return current;
 return kind==='SAMURAI'?referenceThunderDamage*20:kind==='KING PUNI'?Math.max(current,referenceThunderDamage*3):referenceThunderDamage*3;
}
type Effects={buffs:Map<string,number>;time:number};
const has=(g:Effects,key:string)=>g.buffs.has(key)&&(g.buffs.get(key)??0)>g.time;
export function attackPower(g:Effects){return (has(g,'RAINBOW')?1.6:1)*(has(g,'POWER UP')?1.7:has(g,'POWER DOWN')?.55:1);}
export function defensePower(g:Effects){return has(g,'DEFENSE UP')?.5:has(g,'DEFENSE DOWN')?1.5:1;}
export function movementPower(g:Effects){return (has(g,'CANDY')?1.3:1)*(has(g,'SPEED UP')?1.5:has(g,'SPEED DOWN')?.6:1);}
export function invincible(g:Effects){return has(g,'INVINCIBLE');}
export function rareDrop(challenge:number,roll=Math.random()):'ELIXIR'|'PARUPUN'|undefined{return challenge<2?undefined:roll<.015?'ELIXIR':roll<.03?'PARUPUN':undefined;}
export const parupunOutcomes=['room','power-up','power-down','defense-up','defense-down','slow','fast','invincible','warp']as const;
export type ParupunOutcome=typeof parupunOutcomes[number];
export function randomOutcome(roll=Math.random()){return parupunOutcomes[Math.min(8,Math.max(0,Math.floor(roll*9)))];}
