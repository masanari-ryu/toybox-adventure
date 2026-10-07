import {it,expect} from 'vitest';
import {stages} from '../src/stages/Stages';
import {inside} from '../src/world/Threats';
it('expands poison and lava by about 70 percent without increasing their damage or flooding critical switches',()=>{
 const oldAreas=[[5*3,4*3],[7*3,4*3]],lists=[stages[1].pools,stages[2].lava];
 for(let i=0;i<2;i++)for(let n=0;n<lists[i].length;n++)expect(lists[i][n].rx*lists[i][n].rz/oldAreas[i][n]).toBeGreaterThan(1.7);
 for(const [stage,hazards]of [[stages[1],stages[1].pools],[stages[2],stages[2].lava]]as const)for(const s of stage.switches)expect(inside(hazards,s.x,s.z)).toBe(false);
});
