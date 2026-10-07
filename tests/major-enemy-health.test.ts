import {it,expect} from 'vitest';
import {enteredMajorRoom,majorHealthTarget} from '../src/ui/MajorEnemyHealth';
import {configureStage} from '../src/world/layout';
import {doors} from '../src/world/Threats';
import type {Game} from '../src/game/Game';
it('does not count the samurai warning or outside corridor as entering its independent room',()=>{
 expect(enteredMajorRoom(1,'SAMURAI',22,30,0)).toBe(false);expect(enteredMajorRoom(1,'SAMURAI',22,22,0)).toBe(true);expect(enteredMajorRoom(0,'SAMURAI',22,22,0)).toBe(false);
});
it('requires entry past the boss doorway and the correct third floor',()=>{
 expect(enteredMajorRoom(0,'KING PUNI',54,34,0)).toBe(false);expect(enteredMajorRoom(0,'KING PUNI',62,22,0)).toBe(true);
 expect(enteredMajorRoom(1,'KING PUNI',66,22,0)).toBe(false);expect(enteredMajorRoom(1,'KING PUNI',82,22,0)).toBe(true);
 expect(enteredMajorRoom(2,'KING PUNI',90,22,0)).toBe(false);expect(enteredMajorRoom(2,'KING PUNI',90,22,12)).toBe(true);
});
it('hides sealed or unentered fights, then tracks the nearby encountered enemy',()=>{
 configureStage(1);const enemy={kind:'SAMURAI',alive:true,encountered:false,floorY:0,group:{position:{x:22,z:14}}};
 const g={stageIndex:1,position:{x:22,z:30,y:1.65},enemies:[enemy],gate:false}as unknown as Game;
 expect(majorHealthTarget(g)).toBeUndefined();doors[5].open=true;expect(majorHealthTarget(g)).toBeUndefined();
 g.position.z=22;expect(majorHealthTarget(g)).toBe(enemy);g.position.z=30;expect(majorHealthTarget(g)).toBe(enemy);
 g.position.x=90;expect(majorHealthTarget(g)).toBeUndefined();configureStage(0);
});
