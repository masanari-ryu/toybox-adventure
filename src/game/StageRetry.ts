import type {Game}from './Game';
type Entry={challenge:number;stageIndex:number;hp:number;energy:number;score:number;selectedItem:number;weapon:number;supplies:{potions:number;bigPotions:number;antidotes:number;armor:number;elixirs:number;parupuns:number};arsenal:{unlocked:boolean[];levels:number[];murasame:boolean;justAcquired:number|undefined}};
/** Session-only entry equipment. ClearLoadout's persistent save format remains unchanged. */
export class StageRetry{
 private dungeon?:Entry;private rail?:Entry;private restoring=false;
 reset(){this.dungeon=this.rail=undefined;}
 capture(g:Game,rail=false){if(this.restoring||g.challenge===3||g.practice||g.railTest)return;const value:Entry={challenge:g.challenge,stageIndex:g.stageIndex,hp:g.hp,energy:g.energy,score:g.score,selectedItem:g.selectedItem,weapon:g.input.weapon,supplies:{...g.supplies},arsenal:{unlocked:[...g.arsenal.unlocked],levels:[...g.arsenal.levels],murasame:g.arsenal.murasame,justAcquired:g.arsenal.justAcquired}};if(rail)this.rail=value;else{this.dungeon=value;this.rail=undefined;}}
 restore(g:Game,reload:()=>void,rail=false){const value=rail?this.rail:this.dungeon;if(g.challenge===3||!value||value.challenge!==g.challenge||value.stageIndex!==g.stageIndex)return false;this.restoring=true;try{this.apply(g,value);reload();this.apply(g,value);g.updateHud();}finally{this.restoring=false;}return true;}
 private apply(g:Game,e:Entry){g.hp=e.hp;g.energy=e.energy;g.score=e.score;g.selectedItem=e.selectedItem;g.input.weapon=e.weapon;Object.assign(g.supplies,e.supplies);g.arsenal.unlocked=[...e.arsenal.unlocked];g.arsenal.levels=[...e.arsenal.levels];g.arsenal.murasame=e.arsenal.murasame;g.arsenal.justAcquired=e.arsenal.justAcquired;g.arsenal.nightmareOnly=false;g.arsenal.nightmareWeapons.clear();g.gunStamp='';}
}
