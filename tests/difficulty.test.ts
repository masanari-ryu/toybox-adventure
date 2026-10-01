import {it,expect} from 'vitest';
import {difficulty} from '../src/game/Difficulty';
it('gives beginners an isolated forgiving encounter and ramps each region',()=>{
 const first=difficulty[0];
 expect(first.ambush).toBe(0);
 expect(Math.ceil(55*first.hp/18)).toBe(2);
 expect(first.detect).toBeLessThan(Math.hypot(19-14,13-26));
 for(let i=1;i<difficulty.length;i++){
  for(const key of ['hp','speed','detect','damage','ambush'] as const)expect(difficulty[i][key]).toBeGreaterThan(difficulty[i-1][key]);
  expect(difficulty[i].warning).toBeLessThan(difficulty[i-1].warning);
 }
});
