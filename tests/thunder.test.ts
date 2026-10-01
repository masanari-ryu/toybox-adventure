import {katanaDamage} from '../src/game/Katana';
import {describe,it,expect,vi} from 'vitest';
import * as T from 'three';
import {thunderbolt,beamDistance,thunderDamage} from '../src/game/Thunderbolt';
import {configureStage} from '../src/world/layout';
import type {Game} from '../src/game/Game';
describe('thunder beam',()=>{
 it('uses a forward ray with perpendicular hit distance',()=>{const origin=new T.Vector3(0,1,0),direction=new T.Vector3(0,0,-1);expect(beamDistance(origin,direction,new T.Vector3(1,1,-8))).toEqual({along:8,distance:1});expect(beamDistance(origin,direction,new T.Vector3(0,1,8)).along).toBe(-8);expect(thunderDamage).toBe(95*2);expect(katanaDamage).toBeGreaterThan(thunderDamage*1.5);});
 it('pierces visible enemies but stops at a wall and excludes targets behind the player',()=>{configureStage(0);const enemies=[30,26,18,42].map(z=>({alive:true,kind:'PUNI',group:{position:new T.Vector3(26,0,z)},baseScale:1.65,radius:.6,stunned:0}));const damage=vi.fn(),lightning={add:vi.fn()};const g={position:new T.Vector3(26,1.65,38),gate:false,enemies,scene:new T.Scene(),camera:new T.PerspectiveCamera(),lightning,sound:{thunder:vi.fn()},damage,burst:vi.fn(),arsenal:{levels:[0,0,0]},buffs:new Map(),input:{touch:false},time:1} as unknown as Game;thunderbolt(g,new T.Vector3(0,0,-1));expect(damage.mock.calls.map(c=>c[0])).toEqual(enemies.slice(0,2));expect(damage.mock.calls.every(c=>c[1]===190)).toBe(true);expect(lightning.add).toHaveBeenCalledOnce();});
});
