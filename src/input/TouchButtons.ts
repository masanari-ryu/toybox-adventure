type Control=HTMLButtonElement|HTMLAnchorElement;
const disabled=(c:Control)=>c instanceof HTMLButtonElement&&c.disabled;
/** Native clicks can be suppressed for a second finger while the first finger is moving. */
export function touchButtons(){
 const presses=new Map<number,{button:Control;x:number;y:number;travel:number}>(),activated=new WeakMap<Control,number>();
 const release=(id:number,button:Control)=>{try{if(button.hasPointerCapture(id))button.releasePointerCapture(id);}catch{}};
 const clear=()=>{const old=[...presses];presses.clear();for(const [id,p]of old)release(id,p.button);};
 window.addEventListener('clear-controls',clear);
 window.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'||!(e.target instanceof Element))return;
  const button=e.target.closest<Control>('#app button, #app a');if(!button||disabled(button))return;
  e.preventDefault();presses.set(e.pointerId,{button,x:e.clientX,y:e.clientY,travel:0});
  if(e.isTrusted)try{button.setPointerCapture(e.pointerId);}catch{}
 },true);
 window.addEventListener('pointermove',e=>{const p=presses.get(e.pointerId);if(p)p.travel=Math.max(p.travel,Math.hypot(e.clientX-p.x,e.clientY-p.y));},true);
 const end=(e:PointerEvent)=>{
  const p=presses.get(e.pointerId);if(!p)return;presses.delete(e.pointerId);release(e.pointerId,p.button);
  if(e.type!=='pointerup'||p.travel>=12||!p.button.isConnected||disabled(p.button))return;
  const r=p.button.getBoundingClientRect();if(!r.width||!r.height||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  e.preventDefault();activated.set(p.button,performance.now());p.button.click();
 };
 window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
 window.addEventListener('lostpointercapture',e=>{const p=presses.get(e.pointerId);if(p&&!p.button.hasPointerCapture(e.pointerId))end(e);},true);
 window.addEventListener('click',e=>{
  if(!e.detail||!(e.target instanceof Element))return;const b=e.target.closest<Control>('#app button, #app a');
  if(b&&performance.now()-(activated.get(b)??-Infinity)<600){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 window.addEventListener('blur',clear);window.addEventListener('pagehide',clear);window.addEventListener('resize',clear);window.addEventListener('orientationchange',clear);
}
