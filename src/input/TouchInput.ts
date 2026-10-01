import {Input} from './Input';
type Finger={x:number;y:number;sx:number;sy:number;time:number;travel:number};
/** Swipe displacement controls speed; a stationary second finger can fire independently. */
export function touch(i:Input,cycle?:()=>void){
 const surface=document.querySelector<HTMLElement>('#look')!,fingers=new Map<number,Finger>();
 let primary:number|undefined,pairDistance=0,pairX=0,fireTimer:ReturnType<typeof setTimeout>|undefined;
 const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
 const reset=()=>{fingers.clear();primary=undefined;pairDistance=0;i.mx=i.my=0;i.fire=false;i.tapAim=null;if(fireTimer)clearTimeout(fireTimer);};
 window.addEventListener('clear-controls',reset);
 surface.onpointerdown=e=>{e.preventDefault();if(!i.touch){i.touch=true;document.body.classList.add('touch');window.dispatchEvent(new Event('resize'));}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,time:performance.now(),travel:0});if(primary===undefined)primary=e.pointerId;if(e.isTrusted)surface.setPointerCapture?.(e.pointerId);if(fingers.size===2){const[a,b]=[...fingers.values()];pairDistance=Math.hypot(a.x-b.x,a.y-b.y);pairX=(a.x+b.x)/2;}};
 surface.onpointermove=e=>{const p=fingers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;p.x=e.clientX;p.y=e.clientY;p.travel=Math.max(p.travel,Math.hypot(p.x-p.sx,p.y-p.sy));
  const [a,b]=[...fingers.values()];
  if(b&&a.travel>12&&b.travel>12){const distance=Math.hypot(a.x-b.x,a.y-b.y),pinch=pairDistance-distance;i.my=clamp(pinch/90);i.mx=clamp(((a.x+b.x)/2-pairX)/75);}
  else if(e.pointerId===primary){i.lookX+=dx*.008;i.my=clamp((p.sy-p.y)/90);i.mx=0;}
 };
 const end=(e:PointerEvent)=>{const p=fingers.get(e.pointerId);if(!p)return;
  if(e.type==='pointerup'&&p.travel<12&&performance.now()-p.time<400){const r=surface.getBoundingClientRect();i.tapAim={x:(p.x-r.left)/r.width*2-1,y:1-(p.y-r.top)/r.height*2};i.fire=true;if(fireTimer)clearTimeout(fireTimer);fireTimer=setTimeout(()=>i.fire=false,110);}
  fingers.delete(e.pointerId);if(e.pointerId===primary){primary=fingers.keys().next().value;i.mx=i.my=0;if(primary!==undefined){const f=fingers.get(primary)!;f.sx=f.x;f.sy=f.y;}}else if(fingers.size===1){i.mx=0;const f=fingers.get(primary!)!;i.my=clamp((f.sy-f.y)/90);}if(!fingers.size)i.mx=i.my=0;
 };
 surface.onpointerup=surface.onpointercancel=end;
 document.querySelector<HTMLElement>('#weapon')!.onclick=()=>cycle?.();
}
