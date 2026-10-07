import {test,expect,type Page,type CDPSession} from '@playwright/test';
const run=async<T>(page:Page,fn:(g:any)=>T|Promise<T>):Promise<T>=>page.evaluate(async source=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return await (0,eval)(`(${source})`)(g);},fn.toString());
type Finger={x:number;y:number;id:number};
async function event(cdp:CDPSession,type:string,points:Finger[]){await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});}
async function tapButton(page:Page,cdp:CDPSession,held:Finger,id:string,n:number){const r=(await page.locator(`#${id}`).boundingBox())!;const tap={id:n,x:r.x+r.width/2,y:r.y+r.height/2};await event(cdp,'touchStart',[held,tap]);await event(cdp,'touchEnd',[tap]);}
for(const [name,w,h]of [['small-phone',360,800],['phone',390,844],['landscape',844,390],['tablet',1024,768],['large-tablet',1366,1024]]as const)test(`mobile release recovery and moving inventory ${name}`,async({browser})=>{
 test.setTimeout(150000);const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true}),page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});if(h>w)await page.setViewportSize({width:h,height:w});await page.locator('#start').click();await page.locator('#card-close').click();await expect(page.locator('#render-loading')).toBeHidden({timeout:30000});
 await run(page,g=>{g.hp=60;g.supplies.potions=3;g.supplies.bigPotions=0;g.supplies.antidotes=2;for(const e of g.enemies){e.alive=false;e.group.visible=false;}for(const i of g.world.items){i.taken=true;i.mesh.visible=false;}g.updateHud();document.getElementById('look')!.addEventListener('pointerdown',(e:any)=>(window as any).movePointer=e.pointerId);});
 const cdp=await context.newCDPSession(page),width=page.viewportSize()!.width,height=page.viewportSize()!.height;
 const origin={id:7,x:width*.32,y:height*.65},held={...origin,x:origin.x+45,y:origin.y-45};
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await expect.poll(()=>run(page,g=>g.input.mx)).toBeGreaterThan(.5);
 await tapButton(page,cdp,held,'item-select',8);await expect(page.locator('#item-picker')).toBeVisible();await tapButton(page,cdp,held,'pick-antidote',9);
 await expect.poll(()=>run(page,g=>g.selectedItem)).toBe(1);await run(page,g=>g.poisonUntil=g.time+5);await tapButton(page,cdp,held,'item-use',10);
 await expect.poll(()=>run(page,g=>g.supplies.antidotes)).toBe(1);await expect.poll(()=>run(page,g=>g.poisonUntil)).toBe(0);expect(await run(page,g=>g.input.mx)).toBeGreaterThan(.5);
 await tapButton(page,cdp,held,'item-select',11);await tapButton(page,cdp,held,'pick-potion',12);const hp=await run(page,g=>g.hp);await tapButton(page,cdp,held,'item-use',13);
 await expect.poll(()=>run(page,g=>g.supplies.potions)).toBe(2);expect(await run(page,g=>g.hp)).toBeGreaterThan(hp);expect(await run(page,g=>g.input.my)).toBe(.5);
 const shot={id:14,x:width*.67,y:height*.6};await event(cdp,'touchStart',[held,shot]);await event(cdp,'touchEnd',[shot]);await expect.poll(()=>run(page,g=>g.shots.length)).toBeGreaterThan(0);
 await page.waitForTimeout(1200);expect(await run(page,g=>g.input.mx)).toBeGreaterThan(.5);
 await event(cdp,'touchEnd',[]);await expect.poll(()=>run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);await page.waitForTimeout(400);
 const stopped=await run(page,g=>({x:g.position.x,z:g.position.z}));await page.waitForTimeout(400);const later=await run(page,g=>({x:g.position.x,z:g.position.z}));expect(Math.hypot(later.x-stopped.x,later.z-stopped.z)).toBeLessThan(.05);
 // A release delivered to a HUD element used to leave both axes stuck.
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await page.evaluate(()=>document.getElementById('pause')!.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:(window as any).movePointer})));expect(await run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);await event(cdp,'touchEnd',[]);
 // Losing capture must stop the gesture, rather than leave a stale pointer.
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await page.evaluate(()=>document.getElementById('look')!.releasePointerCapture((window as any).movePointer));await expect.poll(()=>run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);await event(cdp,'touchEnd',[]);
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await event(cdp,'touchCancel',[]);expect(await run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));expect(await run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);await event(cdp,'touchEnd',[]);
 await event(cdp,'touchStart',[origin]);await event(cdp,'touchMove',[held]);await tapButton(page,cdp,held,'pause',20);await expect.poll(()=>run(page,g=>g.state)).toBe('paused');await tapButton(page,cdp,held,'start',21);await expect.poll(()=>run(page,g=>g.state)).toBe('playing');expect(await run(page,g=>[g.input.mx,g.input.my])).toEqual([0,0]);await event(cdp,'touchEnd',[]);await page.screenshot({path:`screenshots/input-fix/${name}.png`});expect(errors).toEqual([]);await context.close();
});
