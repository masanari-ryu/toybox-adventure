import {it,expect} from 'vitest';
import {stages} from '../src/stages/Stages';
import {configureStage,wall,layout,canMove,canMoveAt,lineOfSight} from '../src/world/layout';
import {doors,switches} from '../src/world/Threats';
import {Brain} from '../src/ai/Brain';
import {names,itemInfo,visibleTextValid} from '../src/ui/Text';
import {readFileSync} from 'node:fs';
function reachable(x:number,z:number){const start=`${Math.floor(x/4)},${Math.floor(z/4)}`,known=new Set([start]),q=[start];for(let n=0;n<q.length;n++){const [c,r]=q[n].split(',').map(Number);for(const [a,b]of [[1,0],[-1,0],[0,1],[0,-1]]){const key=`${c+a},${r+b}`;if(!known.has(key)&&canMove((c+a)*4+2,(r+b)*4+2,true)){known.add(key);q.push(key);}}}return known;}
const known=(s:Set<string>,x:number,z:number)=>s.has(`${Math.floor(x/4)},${Math.floor(z/4)}`);
for(let n=0;n<3;n++)it(`stage ${n+1} has a solvable switch order and connected collectibles`,()=>{configureStage(n);const s=stages[n];for(let round=0;round<10;round++){const cells=reachable(...s.start);for(const sw of switches)if(sw.door>=0&&known(cells,sw.x,sw.z))doors[sw.door].open=true;}const before=reachable(...s.start);if(n===2){expect(canMoveAt(98,18,13.65,true)).toBe(false);expect(known(before,...s.key)).toBe(true);}else expect(known(before,...s.key)).toBe(false);expect(known(before,s.boss.x,s.boss.z)).toBe(true);doors[s.boss.exitDoor].open=true;if(n===2)expect(canMoveAt(98,18,13.65,true)).toBe(true);const cells=reachable(...s.start);expect(known(cells,...s.key)).toBe(true);expect(known(cells,...s.exit)).toBe(true);for(const [kind,x,z]of s.items)expect(known(cells,x,z),`${kind} ${x},${z}`).toBe(true);for(const sw of switches)expect(known(cells,sw.x,sw.z),`${sw.kind} ${sw.x},${sw.z}`).toBe(true);expect(s.w*s.h).toBeGreaterThan(n?stages[n-1].w*stages[n-1].h:0);configureStage(0);});
it('wakes on one remote hit, searches last known position and remembers around corners',()=>{const b=new Brain();b.hit(50,20,1);expect(b.state).toBe('Alert');expect(b.update(10,20,false,{x:90,z:90},1.4,0)).toEqual({x:50,z:20});expect(b.state).toBe('Search');b.update(15,20,true,{x:18,z:20},2,0);b.update(16,20,false,{x:90,z:90},3,0);expect(b.last).toEqual({x:18,z:20});expect(b.state).toBe('Search');b.update(16,20,false,{x:90,z:90},13,0);expect(b.state).toBe('Idle');});
it('rejects all visible Latin letters and Han characters in UI data',()=>{for(const s of [...Object.values(names),...Object.values(itemInfo).flatMap(x=>[x.effect,x.use]),...stages.flatMap(s=>[s.name,s.story])])expect(visibleTextValid(s),s).toBe(true);const source=readFileSync('src/main.ts','utf8');for(const text of source.matchAll(/>([^<>]+)</g)){if(!text[1].includes('${'))expect(visibleTextValid(text[1]),text[1]).toBe(true);}expect(visibleTextValid('たいりょく 100')).toBe(true);expect(visibleTextValid('HP')).toBe(false);expect(visibleTextValid('体力')).toBe(false);});

it('increases density by stage while keeping spawns clear of the entrance and walls',()=>{const s=stages[0];const opening=s.enemies.filter(([kind,x])=>kind!=='KING PUNI'&&x<38),later=s.enemies.filter(([kind,x,z])=>kind!=='KING PUNI'&&x>38&&z>30),final=s.enemies.filter(([kind,x,z])=>kind!=='KING PUNI'&&x>38&&z<30);expect([opening.length,later.length,final.length]).toEqual([8,9,10]);expect(s.enemies.every(([,x,z])=>Math.hypot(x-s.start[0],z-s.start[1])>14)).toBe(true);for(let n=0;n<3;n++){configureStage(n);for(const [,x,z]of stages[n].enemies)expect(canMove(x,z,true),`stage ${n} enemy ${x},${z}`).toBe(true);}configureStage(0);expect(stages.map(s=>s.enemies.filter(([kind])=>kind!=='KING PUNI'&&kind!=='SAMURAI').length)).toEqual([27,42,62]);expect(stages.map(s=>s.boss.hp)).toEqual([420,950,2800]);});

it('makes each playable dungeon larger, with a locked reward room beyond its boss',()=>{const sizes:number[]=[];for(let n=0;n<3;n++){configureStage(n);for(const d of doors)d.open=true;sizes.push(reachable(...stages[n].start).size);expect(stages[n].enemies.filter(([k])=>k==='KING PUNI')).toHaveLength(1);expect(stages[n].switches.some(s=>s.door===stages[n].boss.exitDoor)).toBe(false);}expect(sizes[1]).toBeGreaterThan(sizes[0]);expect(sizes[2]).toBeGreaterThan(sizes[1]);configureStage(0);});

it('seals the optional samurai room on every side while the normal route remains playable',()=>{
 configureStage(1);for(const d of doors)d.open=true;doors[5].open=false;
 const s=stages[1],outside=reachable(...s.start),samurai=s.enemies.find(([k])=>k==='SAMURAI')!;
 expect(known(outside,samurai[1],samurai[2])).toBe(false);
 expect(known(outside,s.boss.x,s.boss.z)).toBe(true);
 for(const sw of s.switches)expect(known(outside,sw.x,sw.z)).toBe(true);
 const inside=reachable(samurai[1],samurai[2]);expect(known(inside,...s.start)).toBe(false);
 expect(known(inside,s.boss.x,s.boss.z)).toBe(false);
 for(const cell of inside)expect(outside.has(cell)).toBe(false);
 expect(lineOfSight(22,30,samurai[1],samurai[2],true)).toBe(false);doors[5].open=true;expect(known(reachable(...s.start),samurai[1],samurai[2])).toBe(true);expect(lineOfSight(22,30,samurai[1],samurai[2],true)).toBe(true);expect(lineOfSight(34,14,samurai[1],samurai[2],true)).toBe(false);expect(lineOfSight(22,-2,samurai[1],samurai[2],true)).toBe(false);
 doors[5].open=false;configureStage(0);
});
