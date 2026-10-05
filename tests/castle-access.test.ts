import {it,expect} from 'vitest';
import {configureStage} from '../src/world/layout';
import {route} from '../src/world/Navigation';
import {doors} from '../src/world/Threats';
it('can reach every ground floor room with its doors open',()=>{configureStage(2);for(const d of doors)d.open=true;for(const [x,z]of [[14,14],[30,22],[42,18],[66,14],[26,58],[62,58]])expect(route(10,78,x,z,true),`${x},${z}`).not.toBeNull();configureStage(0);});
import {elevatedRoute,canTraverseCastle} from '../src/world/Navigation';
import {supportHeight} from '../src/world/CastleFloors';
import {canMoveAt,sightAt,wallAt} from '../src/world/layout';
it('targets the correct floor and descends by the staircase, never an edge',()=>{configureStage(2);for(const d of doors)d.open=true;let x=62,z=38,y=6,usedRamp=false;for(let n=0;n<600&&Math.hypot(x-26,z-58)>1.5;n++){const p=elevatedRoute(x,z,y,26,58,true,0);expect(p,`${x},${z},${y}`).not.toBeNull();const dx=p!.x-x,dz=p!.z-z,d=Math.hypot(dx,dz),step=Math.min(.3,d);const nx=x+dx/d*step,nz=z+dz/d*step;expect(canTraverseCastle(x,z,y,nx,nz,true)).toBe(true);const ny=supportHeight(nx,nz,y);expect(Math.abs(ny-y)).toBeLessThan(.55);if(ny>0&&ny<6)usedRamp=true;x=nx;z=nz;y=ny;}expect(y).toBe(0);expect(usedRamp).toBe(true);expect(Math.hypot(x-26,z-58)).toBeLessThan(1.5);configureStage(0);},15000);
it('allows open-air shots in both directions but blocks actual floors and walls',()=>{configureStage(2);expect(sightAt(48,54,1.65,48,38,8,true)).toBe(true);expect(sightAt(48,38,8,48,54,1.65,true)).toBe(true);expect(sightAt(48,38,1.65,48,38,8,true)).toBe(false);expect(wallAt(38,42,5.8,true)).toBe(false);expect(wallAt(38,42,3,true)).toBe(true);configureStage(0);});
it('walks into the reward room through its opened doorway',()=>{configureStage(2);doors[3].open=true;for(let x=90;x<=106;x+=.1)expect(canMoveAt(x,18,13.65,true),`room entrance ${x}`).toBe(true);for(let z=18;z>=10;z-=.1)expect(canMoveAt(106,z,13.65,true)).toBe(true);configureStage(0);});

it('provides wider supported stair lanes on both ascents',()=>{configureStage(2);for(const x of [26,30,34])expect(supportHeight(x,48,3)).toBe(3);for(const z of [29,32,35])expect(supportHeight(72,z,9)).toBe(9);configureStage(0);});
it('keeps east ground rooms reachable before the third-floor boss gate opens',()=>{configureStage(2);expect(doors[3].open).toBe(false);expect(canMoveAt(74,18,1.65,false)).toBe(true);expect(canMoveAt(98,18,1.65,false)).toBe(true);for(const [x,z]of [[86,18],[106,10]]){expect(route(66,18,x,z,false,0,0)).not.toBeNull();expect(route(x,z,66,18,false,0,0)).not.toBeNull();}expect(canMoveAt(90,30,13.65,false)).toBe(true);expect(canMoveAt(98,18,13.65,true)).toBe(false);configureStage(0);});
