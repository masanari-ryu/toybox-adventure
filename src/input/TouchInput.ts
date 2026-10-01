import {Input} from './Input';
type Finger={x:number;y:number;sx:number;sy:number;time:number;travel:number};
/** Swipe displacement controls speed; a stationary second finger can fire independently. */
export function touch(i:Input,cycle?:()=>void){
 const surface=document.querySelector<HTMLElement>('#look')!,fingers=new Map<number,Finger>();
 let primary:number|undefined,pairDistance=0,pairX=0,pairMode=false,dual=false,fireTimer:ReturnType<typeof setTimeout>|undefined;
 const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
 const reset=()=>{fingers.clear();primary=undefined;pairDistance=0;pairMode=false;dual=false;i.mx=i.my=0;i.fire=false;i.tapAim=null;if(fireTimer)clearTimeout(fireTimer);};
 window.addEventListener('clear-controls',reset);
 surface.onpointerdown=e=>{e.preventDefault();if(!i.touch){i.touch=true;document.body.classList.add('touch');window.dispatchEvent(new Event('resize'));}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,time:performance.now(),travel:0});if(primary===undefined)primary=e.pointerId;if(e.isTrusted)surface.setPointerCapture?.(e.pointerId);if(fingers.size===2){const[a,b]=[...fingers.values()];const rect=surface.getBoundingClientRect();dual=Math.min(a.sx,b.sx)<rect.left+rect.width*.4&&Math.max(a.sx,b.sx)>rect.left+rect.width*.6;pairMode=false;pairDistance=Math.hypot(a.x-b.x,a.y-b.y);pairX=(a.x+b.x)/2;}};
 surface.onpointermove=e=>{const p=fingers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;p.x=e.clientX;p.y=e.clientY;p.travel=Math.max(p.travel,Math.hypot(p.x-p.sx,p.y-p.sy));
  const [a,b]=[...fingers.values()];
  if(b){const left=a.sx<b.sx?a:b,right=left===a?b:a;const distance=Math.hypot(a.x-b.x,a.y-b.y),pinch=pairDistance-distance;const parallel=Math.abs(a.x-a.sx)>12&&Math.abs(b.x-b.sx)>12&&Math.sign(a.x-a.sx)===Math.sign(b.x-b.sx);if(!dual&&(parallel||Math.abs(pinch)>24)){pairMode=true;i.my=clamp(pinch/90);i.mx=clamp(((a.x+b.x)/2-pairX)/75);}else {pairMode=false;i.mx=clamp((left.x-left.sx)/75);i.my=clamp((left.sy-left.y)/90);if(p===right)i.lookX+=dx*.008;}}

  else if(e.pointerId===primary){if(dual){i.mx=clamp((p.x-p.sx)/75);i.my=clamp((p.sy-p.y)/90);}else{i.lookX+=dx*.008;i.my=clamp((p.sy-p.y)/90);i.mx=0;}}
 };
 const end=(e:PointerEvent)=>{const p=fingers.get(e.pointerId);if(!p)return;
  if(e.type==='pointerup'&&p.travel<12&&performance.now()-p.time<400){const r=surface.getBoundingClientRect();i.tapAim={x:(p.x-r.left)/r.width*2-1,y:1-(p.y-r.top)/r.height*2};i.fire=true;if(fireTimer)clearTimeout(fireTimer);fireTimer=setTimeout(()=>i.fire=false,110);}
  fingers.delete(e.pointerId);if(e.pointerId===primary){primary=fingers.keys().next().value;i.mx=i.my=0;if(primary!==undefined){const f=fingers.get(primary)!;f.sx=f.x;f.sy=f.y;}}else if(fingers.size===1){const f=fingers.get(primary!)!;if(pairMode){f.sx=f.x-i.mx*75;f.sy=f.y+i.my*90;pairMode=false;}else{i.mx=clamp((f.x-f.sx)/75);i.my=clamp((f.sy-f.y)/90);}}if(!fingers.size){i.mx=i.my=0;dual=false;}
 };
 surface.onpointerup=surface.onpointercancel=end;
 document.querySelector<HTMLElement>('#weapon')!.onclick=()=>cycle?.();
}
