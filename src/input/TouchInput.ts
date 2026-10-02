import {Input} from './Input';
type Finger={x:number;y:number;sx:number;sy:number;time:number;travel:number;right:boolean};
/** Both sides move vertically; left strafes, right turns. Independent taps fire. */
export function touch(i:Input,cycle?:()=>void){
 const surface=document.querySelector<HTMLElement>('#look')!,fingers=new Map<number,Finger>();
 let fireTimer:ReturnType<typeof setTimeout>|undefined;
 const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
 const movement=()=>{const active=[...fingers.values()].filter(p=>p.travel>=12),left=active.filter(p=>!p.right).sort((a,b)=>Math.abs(b.x-b.sx)-Math.abs(a.x-a.sx))[0],vertical=active.sort((a,b)=>Math.abs(b.y-b.sy)-Math.abs(a.y-a.sy))[0];i.mx=left?clamp((left.x-left.sx)/75):0;i.my=vertical?clamp((vertical.sy-vertical.y)/90):0;};
 const reset=()=>{fingers.clear();i.mx=i.my=0;i.fire=false;i.tapAim=null;if(fireTimer)clearTimeout(fireTimer);};
 window.addEventListener('clear-controls',reset);
 surface.onpointerdown=e=>{e.preventDefault();if(!i.touch){i.touch=true;document.body.classList.add('touch');window.dispatchEvent(new Event('resize'));}const r=surface.getBoundingClientRect();fingers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,time:performance.now(),travel:0,right:e.clientX>=r.left+r.width/2});if(e.isTrusted)surface.setPointerCapture?.(e.pointerId);};
 surface.onpointermove=e=>{const p=fingers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;p.x=e.clientX;p.y=e.clientY;p.travel=Math.max(p.travel,Math.hypot(p.x-p.sx,p.y-p.sy));if(p.right&&p.travel>=12)i.lookX+=dx*.008;movement();};
 const end=(e:PointerEvent)=>{const p=fingers.get(e.pointerId);if(!p)return;if(e.type==='pointerup'&&p.travel<12&&performance.now()-p.time<400){const r=surface.getBoundingClientRect();i.tapAim={x:(p.x-r.left)/r.width*2-1,y:1-(p.y-r.top)/r.height*2};i.fire=true;if(fireTimer)clearTimeout(fireTimer);fireTimer=setTimeout(()=>i.fire=false,110);}fingers.delete(e.pointerId);movement();};
 surface.onpointerup=surface.onpointercancel=end;
 document.querySelector<HTMLElement>('#weapon')!.onclick=()=>cycle?.();
}
