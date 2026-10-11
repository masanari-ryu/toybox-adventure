import {it,expect} from 'vitest';
import * as T from 'three';
import type {Game} from '../src/game/Game';
import type {Enemy} from '../src/game/Enemy';
import {bossWalk,bossCanMove} from '../src/game/boss/BossSpace';
import {configureStage} from '../src/world/layout';
import {doors,setBossEntranceClosed} from '../src/world/Threats';
function chase(stage:number,start:number[],target:number[],open=true){
 configureStage(stage);for(const d of doors)d.open=open;setBossEntranceClosed(false);
 const e={group:new T.Group(),floorY:stage===2?12:0} as Enemy;e.group.position.set(start[0],e.floorY,start[1]);
 const g={stageIndex:stage,position:new T.Vector3(target[0],e.floorY+1.65,target[1]),gate:true,time:0,lastPlayerFloor:e.floorY} as Game;
 for(let n=0;n<1200;n++){g.time+=1/60;bossWalk(g,e,g.position,1/60,3.5);expect(bossCanMove(g,e,e.group.position.x,e.group.position.z)).toBe(true);if(e.group.position.distanceTo(new T.Vector3(target[0],e.floorY,target[1]))<.2)break;}
 return e.group.position;
}
it('first boss can pursue through its entrance and around a corridor corner',()=>{expect(chase(0,[62,22],[54,34]).distanceTo(new T.Vector3(54,0,34))).toBeLessThan(.2);});
it('second boss can leave the room through the door and route around factory props',()=>{expect(chase(1,[82,22],[50,22]).distanceTo(new T.Vector3(50,0,22))).toBeLessThan(.2);});
it('boss pursuit also works when starting against the edge of an open doorway',()=>{expect(chase(0,[58.8,27.4],[54,34]).distanceTo(new T.Vector3(54,0,34))).toBeLessThan(.2);});
it('boss pursuit never crosses a closed door',()=>{expect(chase(0,[62,22],[54,34],false).z).toBeLessThan(28);});
it('final boss stays on its supported floor while pursuing',()=>{const p=chase(2,[90,18],[86,27]);expect(p.distanceTo(new T.Vector3(86,12,27))).toBeLessThan(.2);});
