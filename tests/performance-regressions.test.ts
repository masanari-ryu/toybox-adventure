import {it,expect} from 'vitest';
import * as T from 'three';
import {configureStage} from '../src/world/layout';
import {doors} from '../src/world/Threats';
import {elevatedRoute} from '../src/world/Navigation';
import {surfaces,supportHeight,topHeight} from '../src/world/CastleFloors';
import {SceneLighting} from '../src/render/SceneLighting';

it('retains exact floor and ramp support without temporary arrays',()=>{
 for(const [x,z]of [[30,48],[30,56],[72,32],[52,22],[86,18],[15,15]]){
  const heights=surfaces(x,z);expect(topHeight(x,z)).toBe(Math.max(0,...heights));
  for(const feet of [0,3,6,9,12])for(const step of [.55,1.05])expect(supportHeight(x,z,feet,step)).toBe(Math.max(0,...heights.filter(y=>y<=feet+step)));
 }
});
it('invalidates cached castle edges when a door changes or the stage resets',()=>{
 configureStage(2);const closed=elevatedRoute(34,54,0,42,54,false,0);
 expect(elevatedRoute(34,54,0,42,54,false,0)).toEqual(closed);
 doors[0].open=true;const open=elevatedRoute(34,54,0,42,54,false,0);
 expect(open).not.toEqual(closed);expect(open).toEqual({x:36,z:54});
 doors[0].open=false;expect(elevatedRoute(34,54,0,42,54,false,0)).toEqual(closed);
 configureStage(2);expect(elevatedRoute(34,54,0,42,54,false,0)).toEqual(closed);configureStage(0);
});
it('keeps shader light counts stable while movement changes nearby illumination',()=>{
 const scene=new T.Scene(),world=new T.Group();scene.add(world);
 for(const x of [10,30,80,100]){const light=new T.PointLight(0xffbbaa,12,15);light.position.set(x,4,42);world.add(light);}
 const lighting=new SceneLighting(scene,'medium');lighting.setSources(world);
 const count=()=>{let n=0;scene.traverse(o=>{if(o instanceof T.Light&&o.visible)n++;});return n;};
 lighting.update(0,new T.Vector3(10,1.65,42),'medium',true);const before=count();expect(lighting.points[0].intensity).toBe(12);
 lighting.update(0,new T.Vector3(100,1.65,42),'medium',true);expect(count()).toBe(before);expect(lighting.points[0].position.x).toBe(100);
 lighting.update(0,new T.Vector3(10,1.65,100),'low',true);expect(count()).toBe(before);expect(lighting.points.every(p=>p.intensity===0)).toBe(true);lighting.update(0,new T.Vector3(10,1.65,42),'medium',false);expect(count()).toBe(before);expect(lighting.points.every(p=>p.intensity===0)).toBe(true);
});
