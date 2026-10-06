import {test,expect} from '@playwright/test';

test('rapid stage resets cancel pending graphics preparation safely',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('#start')).toBeEnabled({timeout:30000});
 await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);g.loadStage(1);g.loadStage(2);g.loadStage(0);await g.visuals.ready;});
 await expect(page.locator('#render-loading')).toBeHidden();await page.locator('#start').click();await page.locator('#card-close').click();await expect(page.locator('#hud')).toBeVisible();expect(errors).toEqual([]);
});

test('recovers a lost graphics context without losing game progress',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#start').click();await page.locator('#card-close').click();
 const supported=await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);const extension=g.renderer.getContext().getExtension('WEBGL_lose_context');if(!extension)return false;(window as unknown as {restoreGraphics:()=>void}).restoreGraphics=()=>extension.restoreContext();extension.loseContext();return true;});
 test.skip(!supported,'Graphics context simulation is unavailable');
 await expect(page.locator('#render-loading')).toBeVisible();await expect(page.locator('#overlay')).toBeVisible();
 await page.evaluate(()=>(window as unknown as {restoreGraphics:()=>void}).restoreGraphics());await expect(page.locator('#render-loading')).toBeHidden({timeout:30000});
 const state=await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return {stage:g.stageIndex,hp:g.hp,tier:g.visuals.quality.tier,state:g.state};});
 expect(state).toEqual({stage:0,hp:100,tier:'low',state:'paused'});await page.locator('#start').click();await expect(page.locator('#hud')).toBeVisible();expect(errors).toEqual([]);
});

for(const touch of [false,true])test(`live castle combat avoids long stalls ${touch?'phone':'desktop'}`,async({browser})=>{
 test.setTimeout(120000);const context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:720},hasTouch:touch,isMobile:touch});const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#start').click();await page.locator('#card-close').click();
 await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);g.loadStage(2);g.position.set(26,1.65,58);g.camera.position.copy(g.position);g.yaw=g.pitch=0;g.hp=2000;g.gate=true;g.input.touch=true;g.state='playing';g.orientationBlocked=false;for(const e of g.enemies)e.brain.hit(g.position.x,g.position.z,g.time);for(const item of g.world.items)g.card.seen.add(item.kind);await g.visuals.ready;g.input.fire=true;});
 if(touch){await page.dispatchEvent('#look','pointerdown',{pointerId:101,pointerType:'touch',clientX:140,clientY:280});await page.dispatchEvent('#look','pointermove',{pointerId:101,pointerType:'touch',clientX:245,clientY:220});await page.evaluate(()=>{const surface=document.getElementById('look')!;let id=200;(window as unknown as {combatTaps:ReturnType<typeof setInterval>}).combatTaps=setInterval(()=>{const pointerId=id++;for(const type of ['pointerdown','pointerup'])surface.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId,pointerType:'touch',clientX:innerWidth*.72,clientY:innerHeight*.54}));},250);});}else{await page.keyboard.down('w');await page.keyboard.down('d');}
 const metrics=await page.evaluate(async()=>{
  const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src),gaps:number[]=[],start=performance.now();let last=start;
  return await new Promise<{frames:number;p95:number;max:number;state:string;distance:number}>(resolve=>{const sample=(now:number)=>{gaps.push(now-last);last=now;if(now-start<8000)requestAnimationFrame(sample);else{gaps.sort((a,b)=>a-b);resolve({frames:gaps.length,p95:gaps[Math.floor(gaps.length*.95)],max:gaps.at(-1)!,state:g.state,distance:Math.hypot(g.position.x-26,g.position.z-58)});}};requestAnimationFrame(sample);});
 });
 if(touch){await page.dispatchEvent('#look','pointercancel',{pointerId:101,pointerType:'touch',clientX:245,clientY:220});await page.evaluate(()=>clearInterval((window as unknown as {combatTaps:ReturnType<typeof setInterval>}).combatTaps));}else{await page.keyboard.up('w');await page.keyboard.up('d');}
 console.log(touch?'live phone':'live desktop',JSON.stringify(metrics));expect(metrics.state).toBe('playing');expect(metrics.distance).toBeGreaterThan(3);expect(metrics.max).toBeLessThan(500);expect(metrics.p95).toBeLessThan(75);expect(errors).toEqual([]);await page.screenshot({path:`screenshots/performance/${touch?'phone':'desktop'}-combat.png`});await context.close();
});
