import {it,expect} from 'vitest';
import {ClearLoadout,clearLoadoutKey} from '../src/game/ClearLoadout';
import {Arsenal} from '../src/game/Progression';
import {Supplies} from '../src/game/Supplies';
function fixture(){const values=new Map<string,string>(),store={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}},arsenal=new Arsenal(),supplies=new Supplies();arsenal.unlock(2);arsenal.unlock(3);arsenal.upgrade(2);supplies.potions=7;supplies.bigPotions=4;supplies.antidotes=2;supplies.armor=43.5;return {values,store,arsenal,supplies};}
it('persists the completed hard weapons, upgrades and remaining supplies across sessions',()=>{
 const f=fixture();new ClearLoadout(f.store).save(2,f.arsenal,f.supplies);f.arsenal.reset();f.supplies.reset();
 const saved=new ClearLoadout(f.store);expect(saved.restore(3,f.arsenal,f.supplies)).toBe(true);expect(f.arsenal.choices()).toEqual([2,3]);expect(f.arsenal.levels[2]).toBe(1);expect(f.supplies).toMatchObject({potions:7,bigPotions:4,antidotes:2,armor:43.5});
 f.supplies.potions=0;f.arsenal.reset();expect(saved.restore(2,f.arsenal,f.supplies)).toBe(true);expect(f.supplies.potions).toBe(7);
});
it('never restores easy or normal and never replaces the hard reward on other clears',()=>{
 const f=fixture(),saved=new ClearLoadout(f.store);saved.save(2,f.arsenal,f.supplies);const expected=f.values.get(clearLoadoutKey);f.arsenal.reset();f.supplies.reset();
 for(const mode of [0,1,3])saved.save(mode,f.arsenal,f.supplies);
 expect(f.values.get(clearLoadoutKey)).toBe(expected);
 for(const mode of [0,1]){expect(saved.restore(mode,f.arsenal,f.supplies)).toBe(false);expect(f.arsenal.unlocked).toEqual([true,false,false,false]);expect(f.supplies.potions).toBe(0);}
});
it('rejects incomplete or corrupted saves and keeps the standard starting potion',()=>{
 const f=fixture();for(const value of ['null','broken',JSON.stringify({version:1}),JSON.stringify({version:2,unlocked:[true,false,true,true]})]){f.values.set(clearLoadoutKey,value);expect(new ClearLoadout(f.store).restore(3,new Arsenal(),new Supplies())).toBe(false);}
 f.supplies.potions=0;const saved=new ClearLoadout(f.store);saved.save(2,f.arsenal,f.supplies);const fresh=new Supplies();fresh.potions=1;saved.restore(3,new Arsenal(),fresh);expect(fresh.potions).toBe(1);
});
it('copies snapshots, does not multiply supplies and tolerates blocked browser storage',()=>{
 const f=fixture(),saved=new ClearLoadout({getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}});saved.save(2,f.arsenal,f.supplies);f.arsenal.reset();f.supplies.reset();expect(saved.restore(3,f.arsenal,f.supplies)).toBe(true);f.arsenal.unlocked[3]=false;f.supplies.bigPotions=0;saved.restore(3,f.arsenal,f.supplies);expect(f.arsenal.unlocked[3]).toBe(true);expect(f.supplies.bigPotions).toBe(4);expect(f.supplies.potions).toBe(7);
});
