import {it,expect} from 'vitest';
import * as T from 'three';
import {updateSamurai} from '../src/game/SamuraiCombat';
import {configureStage} from '../src/world/layout';
import type {Game} from '../src/game/Game';
import type {Enemy} from '../src/game/Enemy';
function fixture(pattern:number){configureStage(1);const hits:number[]=[];const g={time:10,position:new T.Vector3(22,1.65,18),gate:true,hurt:(n:number)=>hits.push(n),burst:()=>{},notify:()=>{},sound:{effect:()=>{}}} as unknown as Game;const e={group:new T.Group(),body:new T.Group(),sword:new T.Group(),attackCycle:pattern,cooldown:0,telegraph:0,dashUntil:0,dashHit:false} as unknown as Enemy;e.group.position.set(22,0,14);return{g,e,hits};}
it('heavy swing gives a warning, deals large damage and can be escaped',()=>{const {g,e,hits}=fixture(2);updateSamurai(g,e,.016,true,4);expect(hits).toEqual([]);expect(e.telegraph).toBeGreaterThan(g.time+1);g.time=12;updateSamurai(g,e,.016,true,4);expect(hits).toEqual([46]);const f=fixture(2);updateSamurai(f.g,f.e,.016,true,4);f.g.time=12;updateSamurai(f.g,f.e,.016,true,8);expect(f.hits).toEqual([]);});
it('charge locks direction after stance and hits only once',()=>{const {g,e,hits}=fixture(1);updateSamurai(g,e,.016,true,4);g.time=11;updateSamurai(g,e,.016,true,4);expect(e.dashZ).toBe(19);g.position.x=26;updateSamurai(g,e,.05,true,5);expect(e.dashX).toBe(0);g.position.set(22,1.65,18);updateSamurai(g,e,.05,true,3);updateSamurai(g,e,.05,true,2);expect(hits).toEqual([34]);});
