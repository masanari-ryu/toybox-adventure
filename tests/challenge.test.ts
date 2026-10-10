import {spawnRoom,introRoom,nightmareRoomCap} from '../src/game/NightmareRooms';
import {it,expect} from 'vitest';
import {challenges,challengeSpawns} from '../src/game/Challenge';
import {stages,makeLayout} from '../src/stages/Stages';
it('preserves easy and applies exact regular enemy multipliers without cloning bosses',()=>{
 for(const stage of stages){expect(challengeSpawns(stage,0)).toEqual(stage.enemies);
  const normal=stage.enemies.filter(([k])=>!['KING PUNI','SAMURAI'].includes(k)).length;
  for(let level=1;level<4;level++){const enemies=challengeSpawns(stage,level),layout=makeLayout(stage);
   if(level!==3)expect(enemies.filter(([k])=>!['KING PUNI','SAMURAI'].includes(k))).toHaveLength(Math.ceil(normal*challenges[level].count));else{expect(enemies.length).toBeLessThan(Math.ceil(normal*2.5)*2);const rooms=new Map<string,number>();for(const [kind,x,z]of enemies)if(!['KING PUNI','SAMURAI'].includes(kind)){const room=spawnRoom(stage,x,z);rooms.set(room,(rooms.get(room)??0)+1);}for(const [room,count]of rooms)expect(count).toBeLessThanOrEqual(nightmareRoomCap(stage,room));}
   expect(enemies.filter(([k])=>k==='KING PUNI')).toHaveLength(1);
   expect(enemies.filter(([k])=>k==='SAMURAI').length).toBe(stage.enemies.filter(([k])=>k==='SAMURAI').length);
   for(const [,x,z]of enemies)expect(layout[Math.floor(z/4)][Math.floor(x/4)]).toBe('.');
  }
 }
});
it('uses requested HP multipliers',()=>expect(challenges.map(c=>c.hp)).toEqual([1,1.3,1.5,2]));
it('keeps reinforcements separated and the tutorial entrance safe',()=>{
 for(const stage of stages){const enemies=challengeSpawns(stage,3),extra=enemies.filter(e=>!stage.enemies.some(b=>b[1]===e[1]&&b[2]===e[2])&&!(stage===stages[1]&&e[1]<28&&e[2]<24));
  for(const [,x,z]of extra){expect(Math.hypot(x-stage.start[0],z-stage.start[1])).toBeGreaterThanOrEqual(14);for(const [,a,b]of stage.enemies)expect(Math.hypot(x-a,z-b)).toBeGreaterThanOrEqual(1.7);}
 }
});

import {challengeItems,enemySupplyDrops,consumableKinds} from '../src/game/Challenge';
it('retains hard supplies and gives nightmare two-thirds drops with extra antidotes',()=>{
 for(const stage of stages){
  const easy=stage.items.filter(([k])=>consumableKinds.has(k));
  expect(challengeItems(stage,0)).toEqual(stage.items);
  expect(challengeItems(stage,1).filter(([k])=>consumableKinds.has(k))).toHaveLength(Math.ceil(easy.length*1.5));
  for(const level of [2,3]){
   expect(challengeItems(stage,level).map(([,x,z])=>[x,z])).toEqual(stage.items.filter(([k])=>!consumableKinds.has(k)).map(([,x,z])=>[x,z]));
   const total=challengeSpawns(stage,level).filter(([k])=>!['KING PUNI','SAMURAI'].includes(k)).length;
   const drops=Array.from({length:total},(_,i)=>enemySupplyDrops(stage,level,i+1,total)).flat();
   expect(drops).toHaveLength(level===3?Math.round(easy.length*2*2/3):easy.length*2);
   for(const [kind]of drops)expect(consumableKinds.has(kind)).toBe(true);
   if(level===3)expect(drops.filter(([k])=>k==='ANTIDOTE').length).toBeGreaterThanOrEqual(Math.round(drops.length*(stage.pools.length?.28:.18)));
   if(level===2)for(const [kind]of easy)expect(drops.filter(([k])=>k===kind)).toHaveLength(easy.filter(([k])=>k===kind).length*2);
  }
  expect(enemySupplyDrops(stage,0,1,10)).toEqual([]);
 }
});

it('doubles the previous nightmare first wave while keeping elite counts unique',()=>{for(const [index,previous]of [44,53,106].entries()){const enemies=challengeSpawns(stages[index],3);expect(enemies.filter(([kind])=>!['KING PUNI','SAMURAI'].includes(kind))).toHaveLength(previous*2);}});
