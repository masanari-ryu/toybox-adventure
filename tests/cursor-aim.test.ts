import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {shotDirection} from '../src/input/Aim';

describe('screen-space shooting',()=>{
 it('aims at the cursor on either side and above or below the camera center',()=>{
  const camera=new T.PerspectiveCamera(65,16/9,.1,200);camera.position.set(4,7,12);camera.rotation.set(.2,.4,0,'YXZ');camera.updateProjectionMatrix();
  for(const aim of [{x:-.7,y:.3},{x:.65,y:-.4}]){
   const input={tapAim:null,mouseAim:aim};const direction=shotDirection(camera,input);
   const screen=camera.position.clone().addScaledVector(direction,10).project(camera);
   expect(screen.x).toBeCloseTo(aim.x,8);expect(screen.y).toBeCloseTo(aim.y,8);expect(direction.length()).toBeCloseTo(1);
  }
 });
 it('keeps mouse aim for every shot in a burst, including camera turns',()=>{
  const camera=new T.PerspectiveCamera(65,1,.1,200),input={tapAim:null,mouseAim:{x:.6,y:.1}};
  const first=shotDirection(camera,input);camera.rotation.y=.5;const next=shotDirection(camera,input);
  expect(input.mouseAim).toEqual({x:.6,y:.1});expect(next.angleTo(first)).toBeGreaterThan(.4);
  expect(camera.position.clone().addScaledVector(next,10).project(camera).x).toBeCloseTo(.6);
 });
 it('consumes a touch tap once and keeps the existing forward-shot fallback',()=>{
  const camera=new T.PerspectiveCamera(65,1,.1,200),input:{tapAim:{x:number;y:number}|null;mouseAim:null}={tapAim:{x:-.5,y:.2},mouseAim:null};
  expect(shotDirection(camera,input).x).toBeLessThan(0);expect(input.tapAim).toBeNull();
  expect(shotDirection(camera,input).toArray()).toEqual([0,0,-1]);
 });
});
