import {Input} from './Input';
type Finger={x:number;y:number;sx:number;sy:number;time:number;travel:number;right:boolean;captured:boolean};
/** Both sides move vertically; left strafes, right turns. Independent taps fire. */
export function touch(i:Input,cycle?:()=>void,active:()=>boolean=()=>true){
 const surface=document.querySelector<HTMLElement>('#look')!,fingers=new Map<number,Finger>();
 let fireTimer:ReturnType<typeof setTimeout>|undefined;
 const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
 const movement=()=>{const moving=[...fingers.values()].filter(p=>p.travel>=12),left=moving.filter(p=>!p.right).sort((a,b)=>Math.abs(b.x-b.sx)-Math.abs(a.x-a.sx))[0],vertical=moving.sort((a,b)=>Math.abs(b.y-b.sy)-Math.abs(a.y-a.sy))[0];i.mx=left?clamp((left.x-left.sx)/75):0;i.my=vertical?clamp((vertical.sy-vertical.y)/90):0;};
 const releaseCapture=(id:number)=>{try{if(surface.hasPointerCapture?.(id))surface.releasePointerCapture(id);}catch{/* The browser may have already released this pointer. */}};
 const releaseAll=()=>{const ids=[...fingers.keys()];fingers.clear();i.mx=i.my=i.lookX=i.lookY=0;for(const id of ids)releaseCapture(id);};
 const reset=()=>{releaseAll();i.fire=false;i.tapAim=null;if(fireTimer)clearTimeout(fireTimer);fireTimer=undefined;};
 const end=(e:PointerEvent)=>{
  if(e.pointerType==='mouse')return;
  const p=fingers.get(e.pointerId);if(!p)return;
  // Delete before releasing capture: lostpointercapture can arrive immediately.
  fingers.delete(e.pointerId);movement();releaseCapture(e.pointerId);
  if(e.type==='pointerup'&&active()&&p.travel<12&&performance.now()-p.time<400){
   const r=surface.getBoundingClientRect();i.tapAim={x:(p.x-r.left)/r.width*2-1,y:1-(p.y-r.top)/r.height*2};i.fire=true;
   if(fireTimer)clearTimeout(fireTimer);fireTimer=setTimeout(()=>{if(i.touch)i.fire=false;fireTimer=undefined;},110);
  }else if(e.type!=='pointerup'&&!fingers.size)i.lookX=i.lookY=0;
 };
 i.validateTouch=()=>{if(fingers.size&&!active()){reset();return;}for(const [id,p]of fingers)if(p.captured&&!surface.hasPointerCapture(id))end(new PointerEvent('pointercancel',{pointerId:id,pointerType:'touch'}));};
 window.addEventListener('clear-controls',reset);
 // Browser/OS interruptions can deliver the release to a HUD button or window.
 window.addEventListener('pointerup',end,true);
 window.addEventListener('pointercancel',end,true);
 surface.addEventListener('lostpointercapture',e=>{if(!surface.hasPointerCapture?.(e.pointerId))end(e);});
 window.addEventListener('pointerout',e=>{if(e.relatedTarget===null)end(e);},true);
 window.addEventListener('touchend',e=>{if(!e.touches.length&&fingers.size)releaseAll();},{capture:true,passive:true});
 window.addEventListener('touchcancel',()=>i.reset(),{capture:true,passive:true});
 window.addEventListener('blur',()=>i.reset());
 window.addEventListener('pagehide',()=>i.reset());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)i.reset();});
 window.addEventListener('orientationchange',reset);
 window.addEventListener('resize',()=>{if(fingers.size)reset();});
 surface.onpointerdown=e=>{
  if(e.pointerType==='mouse'||!active())return;e.preventDefault();
  if(!i.touch){i.touch=true;i.mouseAim=null;document.body.classList.add('touch');window.dispatchEvent(new Event('resize'));}
  if(!active())return;
  const r=surface.getBoundingClientRect();fingers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,time:performance.now(),travel:0,right:e.clientX>=r.left+r.width/2,captured:false});
  if(e.isTrusted)try{surface.setPointerCapture?.(e.pointerId);fingers.get(e.pointerId)!.captured=surface.hasPointerCapture?.(e.pointerId)??false;}catch{/* Window-level releases provide the fallback. */}
 };
 surface.onpointermove=e=>{
  const p=fingers.get(e.pointerId);if(!p)return;
  const r=surface.getBoundingClientRect();
  if(!active()||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom||(e.isTrusted&&e.buttons===0)){end(new PointerEvent('pointercancel',{pointerId:e.pointerId,pointerType:e.pointerType}));return;}
  const dx=e.clientX-p.x;p.x=e.clientX;p.y=e.clientY;p.travel=Math.max(p.travel,Math.hypot(p.x-p.sx,p.y-p.sy));
  if(p.right&&p.travel>=12)i.lookX+=dx*.008;movement();
 };
 // Preserve direct/synthetic surface events as well as native window releases.
 surface.onpointerup=surface.onpointercancel=end;
 document.querySelector<HTMLElement>('#weapon')!.onclick=()=>cycle?.();
}
