import {test,expect,type Page} from '@playwright/test';
async function run<T>(page:Page,fn:(g:any)=>T|Promise<T>):Promise<T>{return await page.evaluate(async source=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return await (0,eval)(`(${source})`)(g);},fn.toString());}
for(const touch of [false,true])test(`major health and third-floor door combat ${touch?'phone':'PC'}`,async({browser})=>{
 test.setTimeout(150000);const context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1280,height:720},hasTouch:touch,isMobile:touch}),page=await context.newPage();await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#card-close').click();
 await run(page,async g=>{g.loadStage(1);await g.visuals.ready;g.position.set(22,1.65,30);g.yaw=g.pitch=0;g.updateHud();});await expect(page.locator('#bossbar')).toBeHidden();
 await run(page,async g=>{const {switches}=await import('/src/world/Threats.ts');g.activateSwitch(switches.find((s:any)=>s.kind==='samurai'));});await page.locator('#card-close').click();await run(page,g=>g.updateHud());await expect(page.locator('#bossbar')).toBeHidden();
 await run(page,g=>{g.position.set(22,1.65,22);g.updateHud();});await expect(page.locator('#bossbar')).toBeVisible();await expect(page.locator('#bossname')).toHaveText('さむらい');
 await run(page,async g=>{g.loadStage(2);await g.visuals.ready;g.position.set(90,13.65,32);g.yaw=g.pitch=0;g.hp=500;for(const e of g.enemies)if(e.kind!=='KING PUNI'){e.alive=false;e.group.visible=false;}g.update(.016);});
 await expect(page.locator('#bossbar')).toBeHidden();await expect(page.locator('#interact')).toHaveText('あける');expect(await run(page,g=>g.world.gate.visible)).toBe(true);
 if(touch)await page.locator('#interact').tap();else await page.locator('#interact').click();await expect.poll(()=>run(page,g=>g.enemies.find((e:any)=>e.kind==='KING PUNI').alert)).toBe(true);expect(await run(page,g=>g.world.gate.visible)).toBe(false);await expect(page.locator('#bossbar')).toBeHidden();
 await page.keyboard.down('w');await expect.poll(()=>run(page,g=>g.bossRoomEntered),{timeout:4000}).toBe(true);await page.keyboard.up('w');await expect(page.locator('#bossbar')).toBeVisible();expect(await run(page,g=>g.world.gate.visible)).toBe(true);
 expect(await run(page,g=>g.position.z)).toBeLessThan(28.5);await page.screenshot({path:`screenshots/input-fix/${touch?'phone':'PC'}-boss.png`});
 await run(page,g=>{const boss=g.enemies.find((e:any)=>e.kind==='KING PUNI');g.damage(boss,100000);for(const e of g.enemies)if(e.alive&&e.floorY>=10&&e.group.position.x>80&&e.group.position.x<98&&e.group.position.z<30)g.damage(e,100000);g.finishBossArena();g.updateHud();});expect(await run(page,g=>g.world.gate.visible)).toBe(false);await expect(page.locator('#bossbar')).toBeHidden();await context.close();
});
for(const stage of [0,1,2])test(`nightmare counts and repeated post-clear waves stage ${stage+1}`,async({page})=>{
 test.setTimeout(120000);await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#card-close').click();
 const counts=await run(page,async g=>{const {stages}=await import('/src/stages/Stages.ts');g.challenge=3;return stages.map((s:any)=>s.enemies.filter(([k]:string[])=>k!=='KING PUNI'&&k!=='SAMURAI').length);});
 await page.evaluate(async(stage:number)=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);g.loadStage(stage);await g.visuals.ready;g.position.set(stage===1?50:26,1.65,stage===1?50:stage===2?58:26);for(const e of g.enemies){e.alive=false;e.group.visible=false;}g.state='review';},stage);
 const total=await run(page,g=>g.enemies.filter((e:any)=>e.kind!=='KING PUNI'&&e.kind!=='SAMURAI').length);expect(total).toBe(Math.ceil(counts[stage]*2.5)*2);
 for(const cycle of [0,1,2]){await run(page,g=>{for(const e of g.enemies){e.alive=false;e.group.visible=false;}g.stageTime=g.reinforcements.nextAt;g.state='playing';g.reinforcements.update(g);g.state='review';});
  await expect.poll(()=>run(page,g=>g.reinforcements.pending?.spawns.length)).toBe(cycle+1);
  await run(page,g=>{g.stageTime+=1.2;g.state='playing';g.reinforcements.update(g);g.state='review';});expect(await run(page,g=>g.enemies.filter((e:any)=>e.alive).length)).toBe(cycle+1);
 }
 expect(await run(page,g=>g.enemies.length)).toBe(total+(stage===1?2:1));await page.screenshot({path:`screenshots/input-fix/nightmare-${stage+1}.png`});
});

test('nightmare mobile combat stays responsive with twice the enemies',async({browser})=>{
 test.setTimeout(150000);const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#card-close').click();
 await run(page,async g=>{g.challenge=3;g.loadStage(2);await g.visuals.ready;g.position.set(26,1.65,58);g.hp=2000;for(const item of g.world.items){item.taken=true;item.mesh.visible=false;}for(const e of g.enemies)if(e.group.position.distanceTo(g.position)<24)e.brain.hit(g.position.x,g.position.z,g.time);});
 const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:7,x:270,y:250}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:7,x:315,y:205}]});
 await page.evaluate(()=>{let n=100;const surface=document.getElementById('look')!;(window as any).combatTaps=setInterval(()=>{const pointerId=n++;for(const type of ['pointerdown','pointerup'])surface.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId,pointerType:'touch',clientX:565,clientY:220}));},240);});
 const metrics=await page.evaluate(async()=>{const start=performance.now(),gaps:number[]=[];let last=start;return await new Promise<{fps:number;p95:number;max:number}>(resolve=>{const sample=(now:number)=>{gaps.push(now-last);last=now;if(now-start<8000)requestAnimationFrame(sample);else{gaps.sort((a,b)=>a-b);resolve({fps:gaps.length*1000/(now-start),p95:gaps[Math.floor(gaps.length*.95)],max:gaps.at(-1)!});}};requestAnimationFrame(sample);});});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.evaluate(()=>clearInterval((window as any).combatTaps));console.log('nightmare mobile',JSON.stringify(metrics));expect(metrics.fps).toBeGreaterThanOrEqual(30);expect(metrics.max).toBeLessThan(500);expect(await run(page,g=>g.state)).toBe('playing');expect(errors).toEqual([]);await page.screenshot({path:'screenshots/input-fix/nightmare-phone-combat.png'});await context.close();
});
