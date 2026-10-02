import {Input} from './Input';
type Finger={x:number;y:number;sx:number;sy:number;time:number;travel:number;role:'move'|'look'};
/** Roles stay fixed from touch-down, including when fingers cross the middle. */
export function touch(i:Input,cycle?:()=>void){
 const surface=document.querySelector<HTMLElement>('#look')!,fingers=new Map<number,Finger>();
 let fireTimer:ReturnType<typeof setTimeout>|undefined;
 const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
 const movement=()=>{const p=[...fingers.values()].find(p=>p.role==='move');i.mx=p?clamp((p.x-p.sx)/75):0;i.my=p?clamp((p.sy-p.y)/90):0;};
 const reset=()=>{fingers.clear();i.mx=i.my=0;i.fire=false;i.tapAim=null;if(fireTimer)clearTimeout(fireTimer);};
 window.addEventListener('clear-controls',reset);
 surface.onpointerdown=e=>{e.preventDefault();if(!i.touch){i.touch=true;document.body.classList.add('touch');window.dispatchEvent(new Event('resize'));}const r=surface.getBoundingClientRect();fingers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,time:performance.now(),travel:0,role:e.clientX<r.left+r.width/2?'move':'look'});if(e.isTrusted)surface.setPointerCapture?.(e.pointerId);};
 surface.onpointermove=e=>{const p=fingers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y,previous=p.travel;p.x=e.clientX;p.y=e.clientY;p.travel=Math.max(p.travel,Math.hypot(p.x-p.sx,p.y-p.sy));if(p.role==='move')movement();else if(p.travel>=12){i.lookX+=(previous<12?p.x-p.sx:dx)*.008;i.lookY+=(previous<12?p.y-p.sy:dy)*.006;}};
 const end=(e:PointerEvent)=>{const p=fingers.get(e.pointerId);if(!p)return;if(e.type==='pointerup'&&p.travel<12&&performance.now()-p.time<400){const r=surface.getBoundingClientRect();i.tapAim={x:(p.x-r.left)/r.width*2-1,y:1-(p.y-r.top)/r.height*2};i.fire=true;if(fireTimer)clearTimeout(fireTimer);fireTimer=setTimeout(()=>i.fire=false,110);}fingers.delete(e.pointerId);movement();};
 surface.onpointerup=surface.onpointercancel=end;
 document.querySelector<HTMLElement>('#weapon')!.onclick=()=>cycle?.();
}
