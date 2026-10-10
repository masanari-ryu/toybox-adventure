import type {Game} from './Game';
import {pickupWeaponIndex,nightmareWeaponIndex,nightmareReplacement} from './WeaponSettings';
/** A pickup equips a new weapon once; duplicate pickups never steal the player's choice. */
export function acquireWeapon(g:Pick<Game,'arsenal'|'input'|'challenge'>,kind:string){
 if(g.challenge===3)kind=nightmareReplacement[kind]??kind;const index=pickupWeaponIndex[kind];if(index===undefined)return false;
 if(kind in nightmareWeaponIndex&&g.challenge!==3)return true;
 const upgrade=kind.includes('UPGRADE'),wasOwned=index>=4?g.arsenal.nightmareWeapons.has(index):g.arsenal.unlocked[index];
 const newVariant=kind==='MURASAME'&&!g.arsenal.murasame,newUpgrade=upgrade&&!g.arsenal.levels[index];
 g.arsenal.unlock(index);if(upgrade)g.arsenal.upgrade(index);if(kind==='MURASAME')g.arsenal.murasame=true;
 if(!wasOwned||newVariant||newUpgrade){g.arsenal.justAcquired=index;g.input.weapon=index;}
 return true;
}
