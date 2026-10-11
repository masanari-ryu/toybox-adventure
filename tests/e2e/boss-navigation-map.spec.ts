import {test,expect,type Page} from './fixtures';
async function run<T>(page:Page,fn:(g:any)=>T|Promise<T>):Promise<T>{return page.evaluate(async source=>{const {game:g}=await import('/src/main.ts');return (0,eval)(`(${source})`)(g);},fn.toString());}
for(const [name,width,height,touch] of [['PC',1280,720,false],['phone',844,390,true],['tablet',1024,768,true]] as const){
 test(`boss follows through open doorway without getting stuck ${name}`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('websocket',w=>w.on('framereceived',f=>{if(String(f.payload).includes('full-reload'))console.log('unexpected test reload',f.payload);}));await page.goto('/');await page.locator('#start').click();await page.locator('#card-close').click();
  for(const stage of [0,1]){
   const initialSize=await page.evaluate(async stage=>{const {game:g}=await import('/src/main.ts');g.challenge=2;g.loadStage(stage);await g.visuals.ready;for(const e of g.enemies){e.alive=e.kind==='KING PUNI';e.group.visible=e.alive;}for(const i of g.world.items){i.taken=true;i.mesh.visible=false;}g.position.set(stage===0?54:66,1.65,stage===0?34:22);g.safe.copy(g.position);g.yaw=g.pitch=0;g.hp=1000;g.state='playing';return g.enemies.find((e:any)=>e.kind==='KING PUNI').baseScale;},stage);
   if(touch)await page.locator('#interact').click();else await page.keyboard.press('e');
   await expect.poll(()=>run(page,g=>g.gate)).toBe(true);
   await expect.poll(()=>run(page,g=>{const e=g.enemies.find((a:any)=>a.kind==='KING PUNI');return g.stageIndex===0?e.group.position.z>=32:e.group.position.x<68;}),{timeout:18000}).toBe(true);
   const position=await run(page,async g=>{const {bossCanMove}=await import('/src/game/boss/BossSpace.ts');const e=g.enemies.find((a:any)=>a.kind==='KING PUNI');return {safe:bossCanMove(g,e,e.group.position.x,e.group.position.z),alive:e.alive,size:e.baseScale};});expect(position.safe&&position.alive).toBe(true);expect(position.size).toBe(initialSize);
   await page.screenshot({path:`screenshots/boss-navigation-map/${name}-door-${stage+1}.png`});
  }
  expect(errors).toEqual([]);await context.close();
 });
}
for(const [name,width,height,touch]of [['PC',1280,720,false],['small-phone',360,800,true],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true],['large-tablet',1366,1024,true]]as const)test(`map surface fires and pause shows large explored map ${name}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('websocket',w=>w.on('framereceived',f=>{if(String(f.payload).includes('full-reload'))console.log('unexpected test reload',f.payload);}));await page.goto('/');if(height>width)await page.setViewportSize({width:height,height:width});await page.locator('#start').click();await page.locator('#card-close').click();await page.locator('#render-loading').waitFor({state:'hidden'});
 await run(page,g=>{for(const e of g.enemies){e.alive=false;e.group.visible=false;}for(const i of g.world.items){i.taken=true;i.mesh.visible=false;}g.hp=100;g.position.set(18,1.65,42);g.safe.copy(g.position);g.yaw=0;g.fog.reveal(18,42);g.drawMap();g.shotTime=0;});
 const rect=(await page.locator('#mapbutton').boundingBox())!,tap={id:8,x:rect.x+rect.width*.5,y:rect.y+rect.height*.6};
 const viewport=page.viewportSize()!,held={id:7,x:viewport.width*.28,y:viewport.height*.65},moved={...held,x:held.x+40};let cdp:any;
 if(touch){cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[moved]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[moved,tap]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[tap]});}
 else{await page.mouse.move(tap.x,tap.y);await page.mouse.down();await page.waitForTimeout(60);await page.mouse.up();}
 await expect.poll(()=>run(page,g=>g.shotTime-g.time)).toBeGreaterThan(0);expect(await run(page,g=>({state:g.state,map:g.mapOpen,movement:g.input.mx}))).toMatchObject({state:'playing',map:false,...(touch?{movement:40/75}:{})});await expect(page.locator('#pause-details')).toBeHidden();expect(await page.locator('#mapbutton').evaluate(e=>getComputedStyle(e).pointerEvents)).toBe('none');
 if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.locator('#pause').click();}else await page.keyboard.press('Escape');
 await expect(page.locator('#large-map')).toBeVisible();expect(await run(page,g=>g.state)).toBe('paused');
 const map=(await page.locator('#large-map').boundingBox())!;expect(map.width).toBeGreaterThan(rect.width);expect(map.x).toBeGreaterThanOrEqual(0);expect(map.y).toBeGreaterThanOrEqual(0);expect(map.x+map.width).toBeLessThanOrEqual(viewport.width);expect(map.y+map.height).toBeLessThanOrEqual(viewport.height);
 expect(await page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('#map')!,large=document.querySelector<HTMLCanvasElement>('#large-map')!;return c.toDataURL()===large.toDataURL();})).toBe(true);
 const visible=await page.locator('#app').evaluate(root=>Array.from(root.querySelectorAll('*')).filter(e=>!e.children.length&&e.getBoundingClientRect().width&&getComputedStyle(e).display!=='none').map(e=>e.textContent??'').join(' '));expect(visible).not.toMatch(/[A-Za-z\p{Script=Han}]/u);
 await page.screenshot({path:`screenshots/boss-navigation-map/${name}-pause-map.png`});await page.locator('#start').click();await expect(page.locator('#pause-details')).toBeHidden();expect(await run(page,g=>({state:g.state,x:g.input.mx,y:g.input.my}))).toEqual({state:'playing',x:0,y:0});expect(errors).toEqual([]);await context.close();
});
