import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {CreatureMotion} from '../src/game/CreatureMotion';
import type {Enemy} from '../src/game/Enemy';
function actor(){return {kind:'PUNI',hp:55,baseScale:1.2,radius:.85,state:'Idle',telegraph:0,cooldown:0,dashUntil:0,home:{x:10,z:14},group:new T.Group(),body:new T.Group(),legs:[new T.Group()],arms:[],eyes:[],visualWings:[],visualRotors:[],visualDetail:true} as unknown as Enemy;}
describe('creature animation is visual only',()=>{
 it('keeps the combat transform, dimensions and warning clock unchanged',()=>{const e=actor(),motion=new CreatureMotion(e);e.group.position.set(8,6,10);e.group.scale.setScalar(e.baseScale);e.telegraph=3;const position=e.group.position.clone(),scale=e.group.scale.clone();motion.update(2.5,true);expect(e.body.scale.y).toBeLessThan(1);expect(e.group.position.equals(position)).toBe(true);expect(e.group.scale.equals(scale)).toBe(true);expect([e.hp,e.radius,e.baseScale,e.telegraph,e.cooldown]).toEqual([55,.85,1.2,3,0]);});
 it('observes hit and attack pulses without changing cooldown or health',()=>{const e=actor(),motion=new CreatureMotion(e);motion.update(1,false);e.hp=30;motion.update(1.01,false);expect(e.body.scale.y).toBeLessThan(.85);expect(e.hp).toBe(30);e.cooldown=1.4;motion.update(1.4,false);expect(e.body.scale.z).toBeGreaterThan(1.1);expect(e.cooldown).toBe(1.4);expect(e.state).toBe('Idle');});
 it('returns the visible body to its original scale after a hit pulse',()=>{const e=actor(),motion=new CreatureMotion(e);motion.update(1,false);e.hp=30;motion.update(1.01,false);motion.update(2,false);expect(Math.abs(e.body.scale.x-1)).toBeLessThan(.026);expect(Math.abs(e.body.scale.y-1)).toBeLessThan(.026);});
});
