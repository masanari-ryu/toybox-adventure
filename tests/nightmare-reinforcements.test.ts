import {it,expect} from 'vitest';
import * as T from 'three';
import {NightmareReinforcements,nightmareWaveInterval,nightmareSpawnWarning,nightmareWaveSize} from '../src/game/NightmareReinforcements';
import {Brain} from '../src/ai/Brain';
import {configureStage} from '../src/world/layout';
import type {Game} from '../src/game/Game';
function fixture(){configureStage(0);const g={challenge:3,stageIndex:0,state:'playing',stageTime:0,time:10,position:new T.Vector3(26,1.65,26),gate:false,scene:new T.Scene(),enemies:Array.from({length:6},()=>({kind:'PUNI',alive:false,hp:0,maxHp:71,baseScale:1.2,floorY:0,group:new T.Group(),body:new T.Group(),brain:new Brain()})),defeat:{entries:[]},routes:new Map(),routeTimes:new Map(),sound:{effect:()=>{}},notify:()=>{},burst:()=>{},dispose:(m:T.Mesh)=>{m.removeFromParent();m.geometry.dispose();(m.material as T.Material).dispose();}}as unknown as Game;return g;}
it('returns 1–3 enemies repeatedly, including after the whole stage has been defeated',()=>{
 const g=fixture(),waves=new NightmareReinforcements();expect([0,1,2,3].map(nightmareWaveSize)).toEqual([1,2,3,1]);
 for(let n=0;n<3;n++){for(const e of g.enemies)e.alive=false;g.stageTime=waves.nextAt;waves.update(g);expect(waves.pending?.spawns).toHaveLength(n+1);
  expect(g.enemies.every(e=>!e.alive)).toBe(true);g.stageTime+=nightmareSpawnWarning+.01;waves.update(g);
  const alive=g.enemies.filter(e=>e.alive);expect(alive).toHaveLength(n+1);for(const e of alive){expect(e.hp).toBe(71);expect(e.brain.state).toBe('Alert');expect(e.cooldown).toBeGreaterThanOrEqual(1);expect(e.group.position.distanceTo(g.position)).toBeGreaterThan(6);}
  expect(g.enemies).toHaveLength(6);expect(g.scene.children).toHaveLength(0);
 }
});
it('waits for the warning, skips other difficulties and suspended gameplay, and clears a pending stage wave',()=>{
 const g=fixture(),waves=new NightmareReinforcements();g.stageTime=nightmareWaveInterval;g.challenge=2;waves.update(g);expect(waves.pending).toBeNull();g.challenge=3;g.state='paused';waves.update(g);expect(waves.pending).toBeNull();g.state='playing';waves.update(g);expect(waves.pending).not.toBeNull();waves.reset(g);expect(waves.pending).toBeNull();expect(waves.nextAt).toBe(nightmareWaveInterval);expect(g.scene.children).toHaveLength(0);
});
it('never resurrects bosses, samurai or enemies whose defeat animation is still running',()=>{
 const g=fixture(),waves=new NightmareReinforcements();for(const e of g.enemies)e.kind='KING PUNI';g.stageTime=nightmareWaveInterval;waves.update(g);expect(waves.pending).toBeNull();for(const e of g.enemies)e.kind='SAMURAI';g.stageTime=waves.nextAt;waves.update(g);expect(waves.pending).toBeNull();for(const e of g.enemies)e.kind='PUNI';g.defeat.entries=g.enemies.map(enemy=>({enemy}))as typeof g.defeat.entries;g.stageTime=waves.nextAt;waves.update(g);expect(waves.pending).toBeNull();
});
