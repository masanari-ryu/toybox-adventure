import {it,expect} from 'vitest';
import * as T from 'three';
import {NightmareReinforcements,nightmareSpawnWarning} from '../src/game/NightmareReinforcements';
import {Brain} from '../src/ai/Brain';
import {configureStage} from '../src/world/layout';
import type {Game} from '../src/game/Game';
function fixture(stage=0){configureStage(stage);const items:any[]=[];const g={challenge:3,stageIndex:stage,state:'playing',stageTime:0,time:10,position:new T.Vector3(26,1.65,stage?38:26),gate:false,scene:new T.Scene(),enemies:Array.from({length:6},(_,n)=>({kind:n%2?'BOTTY':'PUNI',home:{x:20+n,z:stage?38:26},alive:false,hp:0,maxHp:570,baseScale:1.2,floorY:0,group:new T.Group(),body:new T.Group(),brain:new Brain()})),world:{items,item(){items.push({mesh:new T.Group()});}},defeat:{entries:[]},routes:new Map(),routeTimes:new Map(),sound:{effect:()=>{}},notify:()=>{},burst:()=>{},dispose:(m:T.Mesh)=>{m.removeFromParent();m.geometry.dispose();(m.material as T.Material).dispose();}}as unknown as Game;return g;}
it('has two total waves in stage one and three thereafter, then permanently rewards and clears the room',()=>{
 for(const stage of [0,1]){const g=fixture(stage),waves=new NightmareReinforcements();waves.update(g);const room=[...waves.rooms.values()][0];expect(room.limit).toBe(stage?3:2);
  while(room.wave<room.limit){g.stageTime=room.nextAt;waves.update(g);expect(waves.pending).not.toBeNull();expect(g.enemies.every(e=>!e.alive)).toBe(true);g.stageTime+=nightmareSpawnWarning+.01;waves.update(g);expect(g.enemies.filter(e=>e.alive).length).toBeGreaterThan(0);for(const e of g.enemies.filter(e=>e.alive)){expect(e.hp).toBe(570);expect(e.group.position.distanceTo(g.position)).toBeGreaterThan(6);e.alive=false;}}
  waves.update(g);expect(room.cleared).toBe(true);expect(g.world.items).toHaveLength(2);for(let n=0;n<10;n++){g.stageTime+=100;waves.update(g);}expect(waves.pending).toBeNull();expect(g.enemies.every(e=>!e.alive)).toBe(true);expect(g.world.items).toHaveLength(2);expect(g.scene.children).toHaveLength(0);
 }
});
it('pauses with gameplay and reset removes every pending spawn marker',()=>{const g=fixture(),waves=new NightmareReinforcements();g.challenge=2;waves.update(g);expect(waves.rooms.size).toBe(0);g.challenge=3;waves.update(g);g.stageTime=8;g.state='paused';waves.update(g);expect(waves.pending).toBeNull();g.state='playing';waves.update(g);expect(waves.pending).not.toBeNull();waves.reset(g);expect(waves.pending).toBeNull();expect(waves.rooms.size).toBe(0);expect(g.scene.children).toHaveLength(0);});
it('does not revive bosses, samurai or actors still in a defeat animation',()=>{for(const kind of ['KING PUNI','SAMURAI','PUNI']){const g=fixture(),waves=new NightmareReinforcements();for(const e of g.enemies)e.kind=kind as never;if(kind==='PUNI')g.defeat.entries=g.enemies.map(enemy=>({enemy}))as never;waves.update(g);g.stageTime=100;waves.update(g);expect(waves.pending).toBeNull();}});
