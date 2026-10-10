import type {Arsenal} from './Progression';
import type {Supplies} from './Supplies';

export const clearLoadoutKey='toybox-hard-clear-loadout';
type Loadout={version:1;unlocked:boolean[];levels:number[];potions:number;bigPotions:number;antidotes:number;armor:number;murasame?:boolean;elixirs?:number;parupuns?:number};
type StorageAccess=Pick<Storage,'getItem'|'setItem'>;
const storage=():StorageAccess|undefined=>{try{return localStorage;}catch{return undefined;}};

/** Only a completed hard campaign supplies the starting equipment for hard and nightmare. */
export class ClearLoadout {
 private completed?:Loadout;
 constructor(private store:StorageAccess|undefined=storage()){}
 save(challenge:number,arsenal:Arsenal,supplies:Supplies){
  if(challenge!==2)return;
  this.completed={version:1,unlocked:[...arsenal.unlocked],levels:[...arsenal.levels],potions:supplies.potions,bigPotions:supplies.bigPotions,antidotes:supplies.antidotes,armor:supplies.armor,murasame:arsenal.murasame,elixirs:supplies.elixirs,parupuns:supplies.parupuns};
  try{this.store?.setItem(clearLoadoutKey,JSON.stringify(this.completed));}catch{/* This session can still use its completed equipment when storage is unavailable. */}
 }
 restore(challenge:number,arsenal:Arsenal,supplies:Supplies){
  if(challenge!==2&&challenge!==3)return false;
  let saved=this.completed;
  if(!saved){try{saved=this.valid(JSON.parse(this.store?.getItem(clearLoadoutKey)??'null'));}catch{return false;}}
  if(!saved)return false;
  arsenal.justAcquired=undefined;arsenal.nightmareWeapons.clear();arsenal.murasame=saved.murasame??false;arsenal.unlocked=[...saved.unlocked];arsenal.levels=[...saved.levels];
  if(challenge===3)arsenal.activateNightmare();else arsenal.nightmareOnly=false;
  supplies.elixirs=saved.elixirs??0;supplies.parupuns=saved.parupuns??0;supplies.potions=Math.max(supplies.potions,saved.potions);supplies.bigPotions=saved.bigPotions;supplies.antidotes=saved.antidotes;supplies.armor=saved.armor;
  return true;
 }
 private valid(value:unknown):Loadout|undefined{
  if(!value||typeof value!=='object')return;
  const s=value as Loadout;
  if(s.version!==1||!Array.isArray(s.unlocked)||s.unlocked.length!==4||s.unlocked[0]!==true||!s.unlocked.every(n=>typeof n==='boolean'))return;
  if(!Array.isArray(s.levels)||s.levels.length!==4||!s.levels.every(n=>n===0||n===1))return;
  if(![s.potions,s.bigPotions,s.antidotes].every(n=>Number.isSafeInteger(n)&&n>=0)||!Number.isFinite(s.armor)||s.armor<0||s.armor>100)return;
  if(s.murasame!==undefined&&typeof s.murasame!=='boolean'||s.murasame&&!s.unlocked[3])return;
  if(![s.elixirs??0,s.parupuns??0].every(n=>Number.isSafeInteger(n)&&n>=0))return;
  return s;
 }
}
