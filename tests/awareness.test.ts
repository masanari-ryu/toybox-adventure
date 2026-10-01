import {it,expect} from 'vitest';
import {roomAt,facingPlayer,noticesPlayer} from '../src/ai/Awareness';
import {configureStage} from '../src/world/layout';
import {doors} from '../src/world/Threats';
import {Brain} from '../src/ai/Brain';
it('detects a front-facing player across the same floor beyond the old short range',()=>{
 configureStage(0);expect(noticesPlayer(26,30,Math.PI,26,42,7,false,false)).toBe(true);
 const brain=new Brain();brain.update(26,30,true,{x:26,z:42},1,0);expect(brain.state).toBe('Chase');brain.update(26,30,true,{x:26,z:42},2,0);expect(brain.state).toBe('Chase');
});
it('detects a player behind an idle enemy through unobstructed sight',()=>{
 configureStage(0);expect(facingPlayer(26,30,0,26,34)).toBe(false);expect(noticesPlayer(26,30,0,26,34,7,false,false)).toBe(true);
 const brain=new Brain();brain.hit(26,34,1);expect(noticesPlayer(26,30,0,26,34,7,brain.state!=='Idle',false)).toBe(true);expect(brain.state).toBe('Alert');
});
it('keeps other rooms and closed doors or machine cover from revealing a player',()=>{
 configureStage(0);expect(roomAt(0,26,30)).not.toBe(roomAt(0,26,10));expect(noticesPlayer(26,30,0,26,10,7,false,false)).toBe(false);
 expect(noticesPlayer(34,38,-Math.PI/2,42,38,12,false,false)).toBe(false);doors[0].open=true;expect(noticesPlayer(34,38,-Math.PI/2,42,38,12,false,false)).toBe(true);
 configureStage(1);expect(noticesPlayer(50,50,Math.PI,50,60,12,false,false)).toBe(false);configureStage(0);
});
it('honors cardinal facings and continues an alerted pursuit after turning away',()=>{
 expect(facingPlayer(0,0,Math.PI/2,-10,0)).toBe(true);expect(facingPlayer(0,0,Math.PI/2,10,0)).toBe(false);
 const brain=new Brain();brain.hit(10,20,1);expect(brain.update(10,30,false,{x:80,z:80},2,0)).toEqual({x:10,z:20});expect(brain.state).toBe('Search');
});
