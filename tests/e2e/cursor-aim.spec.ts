import {test,expect} from '@playwright/test';

async function game(page:any){
 await page.goto('/');await expect(page.locator('#render-loading')).toBeHidden({timeout:30000});
 await page.locator('#practice').click();await page.locator('#practice-lesson-1').click();await page.locator('#card-close').click();
 await expect(page.locator('#render-loading')).toBeHidden({timeout:30000});
}

test('PC cursor shoots off-center targets on both sides, without pointer lock',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await game(page);
 for(const x of [18,26]){
  const target=await page.evaluate(async(x:number)=>{
   const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);
   const e=g.enemies[0];e.alive=true;e.hp=55;e.group.visible=e.body.visible=true;e.group.position.set(x,0,22);g.practice.done=false;g.position.set(22,1.65,34);g.yaw=g.pitch=0;g.time+=1;g.shotTime=0;g.clearTransient();
   g.camera.position.copy(g.position);g.camera.rotation.set(0,0,0);g.camera.updateMatrixWorld(true);
   const center=e.group.position.clone();center.y=e.baseScale;center.project(g.camera);
   return {x:(center.x+1)*innerWidth/2,y:(1-center.y)*innerHeight/2};
  },x);
  await page.mouse.move(target.x,target.y);await page.mouse.down();
  await expect.poll(()=>page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return g.enemies[0].alive;})).toBe(false);
  await page.mouse.up();
  expect(await page.evaluate(()=>document.pointerLockElement===null)).toBe(true);
  expect(await page.locator('#scene').evaluate((e:HTMLElement)=>getComputedStyle(e).cursor)).toBe('crosshair');
 }
 await page.screenshot({path:'screenshots/cursor-aim/pc-target.png'});expect(errors).toEqual([]);
});

test('PC can strafe, aim, hold-fire and right-drag simultaneously; pause clears inputs',async({page})=>{
 await game(page);
 await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);g.enemies[0].hp=100000;});
 const start=await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return g.position.x;});
 await page.mouse.move(820,360);await page.keyboard.down('d');await page.mouse.down();await page.waitForTimeout(250);
 await page.mouse.move(900,350);await page.waitForTimeout(450);
 let state=await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return {x:g.position.x,yaw:g.yaw,fire:g.input.fire,aim:g.input.mouseAim,shots:g.shots.length};});
 expect(state.x).toBeGreaterThan(start+1);expect(state.yaw).toBe(0);expect(state.fire).toBe(true);expect(state.shots).toBeGreaterThan(1);expect(state.aim?.x).toBeCloseTo(900/1280*2-1);
 await page.mouse.down({button:'right'});await page.mouse.move(970,395,{steps:8});await page.waitForTimeout(100);
 state=await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return {x:g.position.x,yaw:g.yaw,fire:g.input.fire,aim:g.input.mouseAim,shots:g.shots.length};});
 expect(Math.abs(state.yaw)).toBeGreaterThan(.15);expect(state.fire).toBe(true);
 await page.mouse.up({button:'right'});await page.mouse.move(950,380);
 expect(await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return g.input.fire;})).toBe(true);
 await page.keyboard.press('Escape');await expect(page.locator('#pause-controls')).toContainText('カーソル');
 await page.mouse.up();await page.keyboard.up('d');await page.locator('#start').click();
 expect(await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return {fire:g.input.fire,aim:g.input.mouseAim,state:g.state};})).toEqual({fire:false,aim:null,state:'playing'});
});

test('a touch-capable PC mouse stays in cursor mode and train shots use cursor position',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1280,height:720},hasTouch:true});const page=await context.newPage();await game(page);
 await page.mouse.move(800,360);await page.mouse.click(800,360);
 expect(await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return g.input.touch;})).toBe(false);
 await expect(page.locator('body')).not.toHaveClass(/touch/);
 await page.goto('/?train=outdoor');await expect(page.locator('#render-loading')).toBeHidden({timeout:30000});await page.locator('#start').click();
 const target=await page.evaluate(async()=>{
  const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);
  g.ride.progress.elapsed=10;g.ride.pose(g.ride.progress.fraction);g.state='review';
  // Keep the train pose fixed here so driver latency cannot turn a correct screen ray into a miss.
  // The campaign browser checks separately verify shots while the train moves.
  g.ride.progress.update=()=>false;
  const t=g.ride.targets.find((t:any)=>{const p=t.enemy.group.position.clone();p.y+=1.6*t.enemy.baseScale/1.3;const distance=p.distanceTo(g.position);p.project(g.camera);return t.enemy.kind==='BOTTY'&&distance<100&&p.z<1&&Math.abs(p.x)<.75&&Math.abs(p.y)<.65;});
  if(!t)throw Error('no visible rail target');
  const p=t.enemy.group.position.clone();p.y+=1.6*t.enemy.baseScale/1.3;p.project(g.camera);t.hp=3;g.ride.shotAt=0;
  (window as any).cursorRailTarget=t;
  return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};
 });
 await page.evaluate(async()=>{const {game:g}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);g.state='playing';});
 await page.mouse.move(target.x,target.y);await page.mouse.down();
 await expect.poll(()=>page.evaluate(()=>(window as any).cursorRailTarget.hp),{timeout:3000}).toBeLessThan(3);await page.mouse.up();
 await page.screenshot({path:'screenshots/cursor-aim/pc-rail.png'});await context.close();
});
