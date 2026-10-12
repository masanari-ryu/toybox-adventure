import {it,expect}from 'vitest';
import * as T from 'three';
import {beginHardCastleOpening,easyDormant,wakeEasyEnemy,hardCastleOpening}from '../src/game/EasyMode';
import type {Game}from '../src/game/Game';
import type {Enemy}from '../src/game/Enemy';
const enemy=(x:number,z:number,kind='PUNI')=>{const group=new T.Group();group.position.set(x,0,z);return {kind,alive:true,group,cooldown:.3}as Enemy;};
it('hard castle entry sleeps only actors within 24 map cells for exactly five seconds',()=>{const g={challenge:2,stageIndex:2,stageTime:0,enemies:[enemy(10,78),enemy(10+hardCastleOpening.radius,78),enemy(10+hardCastleOpening.radius+.1,78),enemy(30,60,'KING PUNI')]}as Game;beginHardCastleOpening(g);expect(g.enemies.map(e=>easyDormant(e))).toEqual([true,true,false,false]);g.stageTime=4.999;expect(wakeEasyEnemy(g,g.enemies[0])).toBe(false);g.stageTime=5;expect(wakeEasyEnemy(g,g.enemies[0])).toBe(true);expect(g.enemies[0].cooldown).toBe(.3);});
it('other stages and modes retain their existing opening behavior',()=>{for(const challenge of [0,1,2,3])for(const stageIndex of [0,1,2]){if(challenge===2&&stageIndex===2)continue;const g={challenge,stageIndex,stageTime:0,enemies:[enemy(10,78)]}as Game;beginHardCastleOpening(g);expect(easyDormant(g.enemies[0])).toBe(false);}});
