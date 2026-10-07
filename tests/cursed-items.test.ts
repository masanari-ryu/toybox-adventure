import {beforeEach,describe,it,expect,vi} from 'vitest';
import * as T from 'three';
import type {Game} from '../src/game/Game';
import {Arsenal} from '../src/game/Progression';
import {Supplies} from '../src/game/Supplies';
import {Fog} from '../src/map/Fog';
import {configureStage} from '../src/world/layout';
import {doors,setBossEntranceClosed} from '../src/world/Threats';
import {slash,katanaDamage} from '../src/game/Katana';
import {attackPower,defensePower,movementPower,invincible,nightmareHealth,rareDrop,randomOutcome,referenceThunderDamage,parupunOutcomes} from '../src/game/PowerEffects';
import {roomTargets,safeWarpTargets,useElixir,useParupun} from '../src/game/RareItems';
import {itemInfo,names,visibleTextValid} from '../src/ui/Text';
import {ClearLoadout,clearLoadoutKey} from '../src/game/ClearLoadout';

// Geometry is real; only canvas-based surface generation is replaced in Node tests.
vi.mock('../src/world/World',async()=>{const t=await import('three');return {mesh:(geometry:InstanceType<typeof t.BufferGeometry>,color:number,x=0,y=0,z=0)=>{const m=new t.Mesh(geometry,new t.MeshBasicMaterial({color}));m.position.set(x,y,z);return m;}};});
function enemy(kind='PUNI',x=26,z=34,hp=855){const group=new T.Group();group.position.set(x,0,z);return {kind,group,alive:true,hp,floorY:0,radius:.6,baseScale:1,alert:true,stunned:0};}
function fixture(){const supplies=new Supplies(),arsenal=new Arsenal();arsenal.unlock(3);arsenal.murasame=true;
 const g={stageIndex:0,bossRoomEntered:false,position:new T.Vector3(26,1.65,38),safe:new T.Vector3(),camera:new T.PerspectiveCamera(),velocity:new T.Vector3(),vy:0,time:10,hp:60,shotTime:0,recoil:0,gate:true,arsenal,supplies,buffs:new Map<string,number>(),enemies:[] as ReturnType<typeof enemy>[],scene:new T.Scene(),shockwaves:[],sound:{effect:vi.fn()},burst:vi.fn(),notify:vi.fn(),finishBossArena:vi.fn(),input:{tapAim:null,reset:vi.fn()},fog:new Fog(),routes:new Map(),routeTimes:new Map(),poisonUntil:30,paralyzedUntil:13,paralysisImmuneUntil:0,poisonTick:0};
 return g as unknown as Game;
}
beforeEach(()=>configureStage(0));
describe('nightmare health and rare loot',()=>{
 it('uses exactly three upgraded thunder hits for all ordinary species, twenty for samurai',()=>{
  for(const kind of ['PUNI','BOTTY','BALLOONER','TOX MUNCHER','LAVA HOPPER','INFANTRY'])expect(nightmareHealth(kind,3,100)).toBe(referenceThunderDamage*3);
  expect(nightmareHealth('SAMURAI',3,1800)).toBe(referenceThunderDamage*20);expect(nightmareHealth('KING PUNI',3,5600)).toBe(5600);
  for(const mode of [0,1,2])expect(nightmareHealth('PUNI',mode,120)).toBe(120);
 });
 it('drops rare items only on hard and nightmare, with distinct rare ranges',()=>{for(const mode of [0,1])expect(rareDrop(mode,0)).toBeUndefined();for(const mode of [2,3]){expect(rareDrop(mode,.014)).toBe('ELIXIR');expect(rareDrop(mode,.015)).toBe('PARUPUN');expect(rareDrop(mode,.03)).toBeUndefined();}expect(parupunOutcomes.map((_,n)=>randomOutcome((n+.5)/9))).toEqual(parupunOutcomes);});
});
describe('murasame life cost',()=>{
 it('charges a missed swing once; cooldown does not charge another point',()=>{const g=fixture();slash(g);expect(g.hp).toBe(59);slash(g);expect(g.hp).toBe(59);g.time+=.5;slash(g);expect(g.hp).toBe(58);});
 it('cannot kill the player at one health and does not start a swing',()=>{const g=fixture();g.hp=1;slash(g);expect(g.hp).toBe(1);expect(g.shotTime).toBe(0);expect(g.shockwaves).toHaveLength(0);expect(g.notify).toHaveBeenCalledWith(expect.stringContaining('たりない'));});
 it('life cost ignores armor and invulnerability, while regular katana is free',()=>{const g=fixture();g.supplies.armor=100;g.buffs.set('INVINCIBLE',30);slash(g);expect(g.hp).toBe(59);expect(g.supplies.armor).toBe(100);g.arsenal.murasame=false;g.time+=1;slash(g);expect(g.hp).toBe(59);});
 it('one-shots ordinary targets regardless of attack debuff, but deals regular damage to the boss',()=>{const g=fixture(),puni=enemy(),boss=enemy('KING PUNI',27,34,5600);g.enemies=[puni,boss] as never;g.buffs.set('POWER DOWN',25);g.damage=vi.fn();slash(g);expect(g.damage).toHaveBeenCalledWith(puni,856);expect(g.damage).toHaveBeenCalledWith(boss,katanaDamage*.55);});
 it('preserves range and wall blocking',()=>{const g=fixture(),far=enemy('PUNI',26,20),wall=enemy('PUNI',42,38);g.enemies=[far,wall] as never;g.damage=vi.fn();slash(g);expect(g.damage).not.toHaveBeenCalled();});
});
describe('rare consumables cannot softlock progress',()=>{
 it('elixir fully heals, cures poison, paralysis and negative ability changes',()=>{const g=fixture();g.supplies.elixirs=1;for(const key of ['POWER DOWN','DEFENSE DOWN','SPEED DOWN'])g.buffs.set(key,30);expect(useElixir(g)).toBe(true);expect(g.hp).toBe(100);expect(g.poisonUntil).toBe(0);expect(g.paralyzedUntil).toBe(0);expect(attackPower(g)).toBe(1);expect(defensePower(g)).toBe(1);expect(movementPower(g)).toBe(1);expect(g.supplies.elixirs).toBe(0);expect(useElixir(g)).toBe(false);});
 it.each(['power-up','power-down','defense-up','defense-down','slow','fast','invincible'] as const)('limits %s to its announced duration and restores normal values',outcome=>{
  const g=fixture();g.supplies.parupuns=1;useParupun(g,outcome);const expiry=outcome==='invincible'?18:25;expect([...g.buffs.values()]).toEqual([expiry]);expect(g.supplies.parupuns).toBe(0);
  const expected={ 'power-up':[1.7,1,1,false],'power-down':[.55,1,1,false],'defense-up':[1,.5,1,false],'defense-down':[1,1.5,1,false],slow:[1,1,.6,false],fast:[1,1,1.5,false],invincible:[1,1,1,true] }[outcome];
  expect([attackPower(g),defensePower(g),movementPower(g),invincible(g)]).toEqual(expected);g.time=expiry;expect([attackPower(g),defensePower(g),movementPower(g),invincible(g)]).toEqual([1,1,1,false]);
 });
 it('replaces opposite ability changes instead of stacking contradictory effects',()=>{const g=fixture();g.supplies.parupuns=2;useParupun(g,'slow');useParupun(g,'fast');expect(g.buffs.has('SPEED DOWN')).toBe(false);expect(movementPower(g)).toBe(1.5);});
 it('room wipe excludes the boss, other rooms and other floors and defeats resistant lava enemies',()=>{
  const g=fixture(),ordinary=enemy('LAVA HOPPER'),boss=enemy('KING PUNI',26,34),otherRoom=enemy('PUNI',50,38),upper=enemy();upper.floorY=6;g.enemies=[ordinary,boss,otherRoom,upper] as never;expect(roomTargets(g)).toEqual([ordinary]);g.supplies.parupuns=1;g.damage=vi.fn((e,n)=>{e.hp-=n*.7;});useParupun(g,'room');expect(g.damage).toHaveBeenCalledOnce();expect(ordinary.hp).toBeLessThan(0);expect(boss.hp).toBe(855);expect(otherRoom.hp).toBe(855);
 });
 it('warp uses discovered cells in a different reachable room; closed doors exclude destinations',()=>{
  const g=fixture();g.position.set(26,1.65,30);g.fog.floorVisited[0].add('6,3');expect(safeWarpTargets(g)).toEqual([]);doors[1].open=true;expect(safeWarpTargets(g)).toEqual([{x:26,z:14,floor:0}]);g.fog.reset();expect(safeWarpTargets(g)).toEqual([]);
 });
 it('warp has a safe timed fallback when no destination exists or the boss arena is sealed',()=>{const g=fixture();g.supplies.parupuns=2;const before=g.position.clone();useParupun(g,'warp');expect(g.position.equals(before)).toBe(true);expect(g.buffs.get('INVINCIBLE')).toBe(18);setBossEntranceClosed(true);g.bossRoomEntered=true;expect(safeWarpTargets(g)).toEqual([]);useParupun(g,'warp');expect(g.position.equals(before)).toBe(true);setBossEntranceClosed(false);});
 it('successful warp moves the camera and safe point and cancels carried motion',()=>{const g=fixture();g.position.set(26,1.65,30);g.fog.floorVisited[0].add('6,3');doors[1].open=true;g.supplies.parupuns=1;g.velocity.set(4,0,1);useParupun(g,'warp');expect(g.position.toArray()).toEqual([26,1.65,14]);expect(g.safe.equals(g.position)).toBe(true);expect(g.camera.position.equals(g.position)).toBe(true);expect(g.velocity.length()).toBe(0);expect(g.input.reset).toHaveBeenCalledOnce();});
 it('does not use items with empty inventory',()=>{const g=fixture();expect(useParupun(g,'room')).toBe(false);expect(g.burst).not.toHaveBeenCalled();});
});
it('restores rare inventory and accepts older saves without new fields',()=>{
 const values=new Map<string,string>(),store={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}},g=fixture();g.supplies.elixirs=2;g.supplies.parupuns=3;new ClearLoadout(store).save(2,g.arsenal,g.supplies);const a=new Arsenal(),s=new Supplies();expect(new ClearLoadout(store).restore(3,a,s)).toBe(true);expect(a.murasame).toBe(true);expect(s.elixirs).toBe(2);expect(s.parupuns).toBe(3);
 const old=JSON.parse(values.get(clearLoadoutKey)!);delete old.murasame;delete old.elixirs;delete old.parupuns;values.set(clearLoadoutKey,JSON.stringify(old));expect(new ClearLoadout(store).restore(3,a,s)).toBe(true);expect(a.murasame).toBe(false);expect(s.elixirs+s.parupuns).toBe(0);
});
it('uses kana-only labels and explains the cursed weapon cost',()=>{for(const text of [...Object.values(names),...Object.values(itemInfo).flatMap(i=>[i.effect,i.use])])expect(visibleTextValid(text)).toBe(true);expect(itemInfo.MURASAME.use).toContain('たいりょくを 1');});
