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

import {challengeItems} from '../src/game/Challenge';
it('scales supplies, preserves rewards, and caps nightmare at hard supply levels',()=>{
 const kinds=new Set(['POTION','BIG POTION','ANTIDOTE','LAVA CHARM','ARMOR CELL','AMMO CELL','CANDY','RAINBOW']);
 for(const stage of stages){expect(challengeItems(stage,0)).toEqual(stage.items);const count=stage.items.filter(([k])=>kinds.has(k)).length;
 for(let level=1;level<4;level++){const items=challengeItems(stage,level);expect(items.filter(([k])=>kinds.has(k))).toHaveLength(Math.ceil(count*[1,1.5,2,2][level]));expect(items.filter(([k])=>!kinds.has(k))).toEqual(stage.items.filter(([k])=>!kinds.has(k)));for(const [,x,z]of items.slice(stage.items.length)){expect(makeLayout(stage)[Math.floor(z/4)][Math.floor(x/4)]).toBe('.');expect([...stage.pools,...stage.lava].some(p=>Math.abs(x-p.x)<p.rx+.8&&Math.abs(z-p.z)<p.rz+.8)).toBe(false);}}
 expect(challengeItems(stage,3)).toEqual(challengeItems(stage,2));}
});
