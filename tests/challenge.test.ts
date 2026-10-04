import {it,expect} from 'vitest';
import {challenges,challengeSpawns} from '../src/game/Challenge';
import {stages,makeLayout} from '../src/stages/Stages';
it('preserves easy and applies exact regular enemy multipliers without cloning bosses',()=>{
 for(const stage of stages){expect(challengeSpawns(stage,0)).toEqual(stage.enemies);
  const normal=stage.enemies.filter(([k])=>!['KING PUNI','SAMURAI'].includes(k)).length;
  for(let level=1;level<4;level++){const enemies=challengeSpawns(stage,level),layout=makeLayout(stage);
   expect(enemies.filter(([k])=>!['KING PUNI','SAMURAI'].includes(k))).toHaveLength(Math.ceil(normal*challenges[level].count));
   expect(enemies.filter(([k])=>k==='KING PUNI')).toHaveLength(1);
   expect(enemies.filter(([k])=>k==='SAMURAI').length).toBe(stage.enemies.filter(([k])=>k==='SAMURAI').length);
   for(const [,x,z]of enemies)expect(layout[Math.floor(z/4)][Math.floor(x/4)]).toBe('.');
  }
 }
});
it('uses requested HP multipliers',()=>expect(challenges.map(c=>c.hp)).toEqual([1,1.3,1.5,2]));
it('keeps reinforcements separated and the tutorial entrance safe',()=>{
 for(const stage of stages){const enemies=challengeSpawns(stage,3),extra=enemies.slice(stage.enemies.length);
  for(const [,x,z]of extra){expect(Math.hypot(x-stage.start[0],z-stage.start[1])).toBeGreaterThanOrEqual(14);for(const [,a,b]of stage.enemies)expect(Math.hypot(x-a,z-b)).toBeGreaterThanOrEqual(1.7);}
 }
});

import {challengeItems,enemySupplyDrops,consumableKinds} from '../src/game/Challenge';
it('moves only hard consumables to guaranteed enemy drops with twice the easy budget',()=>{
 for(const stage of stages){
  const easy=stage.items.filter(([k])=>consumableKinds.has(k));
  expect(challengeItems(stage,0)).toEqual(stage.items);
  expect(challengeItems(stage,1).filter(([k])=>consumableKinds.has(k))).toHaveLength(Math.ceil(easy.length*1.5));
  for(const level of [2,3]){
   expect(challengeItems(stage,level)).toEqual(stage.items.filter(([k])=>!consumableKinds.has(k)));
   const total=challengeSpawns(stage,level).filter(([k])=>!['KING PUNI','SAMURAI'].includes(k)).length;
   const drops=Array.from({length:total},(_,i)=>enemySupplyDrops(stage,level,i+1,total)).flat();
   expect(drops).toHaveLength(easy.length*2);
   for(const [kind]of drops)expect(consumableKinds.has(kind)).toBe(true);
   for(const [kind]of easy)expect(drops.filter(([k])=>k===kind)).toHaveLength(easy.filter(([k])=>k===kind).length*2);
  }
  expect(enemySupplyDrops(stage,0,1,10)).toEqual([]);
 }
});
