export type Door={id:number,x:number,z:number,cells:[number,number][],open:boolean,hidden?:boolean};
export const doors:Door[]=[{id:0,x:30,z:22,cells:[[7,5]],open:false},{id:1,x:48,z:54,cells:[[11,13],[12,13]],open:false},{id:2,x:34,z:46,cells:[[8,11]],open:false,hidden:true}];
export type SwitchKind='door'|'bridge'|'purge'|'secret'|'core';
export const switches:{x:number,z:number,door:number,kind:SwitchKind}[]=[{x:25,z:25,door:0,kind:'door'},{x:35,z:25,door:0,kind:'door'},{x:46,z:49,door:1,kind:'door'},{x:46,z:59,door:1,kind:'door'},{x:69,z:18,door:-1,kind:'bridge'},{x:53,z:39,door:-1,kind:'purge'},{x:26,z:50,door:2,kind:'secret'},{x:68,z:58,door:-1,kind:'core'}];
export const pools=[{x:42,z:22,rx:4,rz:1.6},{x:13,z:42,rx:2.3,rz:2.8},{x:57,z:43,rx:3,rz:3},{x:89,z:54,rx:3.5,rz:4}];
export const lavaPools=[{x:76,z:18,rx:5.5,rz:3},{x:89,z:10,rx:4.5,rz:2.5}];
export function inside(list:{x:number,z:number,rx:number,rz:number}[],x:number,z:number){return list.some(p=>((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2<1);}
export function toxic(x:number,z:number){return inside(pools,x,z);}
export function lava(x:number,z:number){return inside(lavaPools,x,z);}
export function resetDoors(){for(const d of doors)d.open=false;}
export const obstacles=[{x:54,z:14,r:1.25},{x:64,z:46,r:1.35},{x:96,z:20,r:1.35}];
