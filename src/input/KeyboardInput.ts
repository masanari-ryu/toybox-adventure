import {Input} from './Input';

/** Free cursor aiming; right-button drag turns without locking or hiding the pointer. */
export function keyboard(i:Input,canvas:HTMLCanvasElement,pause:()=>void,active:()=>boolean){
 let gesture=false,turning=false,lastX=0,lastY=0,captured:number|null=null;
 const gameplayTarget=(target:EventTarget|null)=>target===canvas||target===document.getElementById('look');
 const aim=(e:PointerEvent)=>{
  const r=canvas.getBoundingClientRect();
  if(!r.width||!r.height)return;
  i.mouseAim={x:Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y:Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2))};
 };
 window.addEventListener('clear-controls',()=>{gesture=turning=false;if(captured!==null&&canvas.hasPointerCapture(captured))canvas.releasePointerCapture(captured);captured=null;});
 window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();i.keys.add(e.code);if(e.code==='KeyE')i.interact=true;if(e.code==='KeyQ')i.heal=true;if(e.code==='KeyR')i.antidote=true;if(e.code==='Escape')pause();if(/^Digit[1234]$/.test(e.code))i.weapon=Number(e.code.slice(-1))-1;});
 window.addEventListener('keyup',e=>i.keys.delete(e.code));
 window.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||!active()||!gameplayTarget(e.target)||![0,2].includes(e.button))return;
  e.preventDefault();
  if(i.touch){i.touch=false;document.body.classList.remove('touch');window.dispatchEvent(new Event('resize'));}
  gesture=true;lastX=e.clientX;lastY=e.clientY;i.tapAim=null;aim(e);
  if(e.button===0)i.fire=true;
  else{turning=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);captured=e.pointerId;}
 });
 window.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!active())return;
  if(gesture){
   const right=(e.buttons&2)!==0;
   if(right&&turning){i.lookX+=(e.clientX-lastX)*.004;i.lookY+=(e.clientY-lastY)*.004;}
   if(right&&!turning){canvas.setPointerCapture(e.pointerId);captured=e.pointerId;}
   turning=right;lastX=e.clientX;lastY=e.clientY;i.fire=(e.buttons&1)!==0;
  }
  if(turning||gameplayTarget(e.target))aim(e);
  else{i.fire=false;i.mouseAim=null;}
 });
 window.addEventListener('pointerup',e=>{
  if(e.pointerType!=='mouse')return;
  gesture=turning=false;i.fire=false;
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);captured=null;
 });
 window.addEventListener('pointercancel',e=>{if(e.pointerType==='mouse')i.reset();});
 canvas.addEventListener('lostpointercapture',()=>turning=false);
 window.addEventListener('blur',()=>i.reset());
}
