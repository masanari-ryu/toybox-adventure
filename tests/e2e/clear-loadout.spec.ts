import {test,expect,type Page} from '@playwright/test';
async function run<T>(page:Page,fn:(g:any)=>T|Promise<T>):Promise<T>{return page.evaluate(async source=>{const {game}=await import(Array.from(document.scripts).find(s=>s.src.includes('/src/main.ts'))!.src);return (0,eval)(`(${source})`)(game);},fn.toString());}
for(const touch of [false,true])test(`hard clear carryover ${touch?'tablet':'PC'}`,async({browser})=>{
 test.setTimeout(180000);const context=await browser.newContext({viewport:touch?{width:1024,height:768}:{width:1280,height:720},hasTouch:touch,isMobile:touch}),page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#start').click();await page.locator('#card-close').click();
 await run(page,g=>{g.challenge=2;g.arsenal.unlock(1);g.arsenal.unlock(2);g.arsenal.unlock(3);g.arsenal.upgrade(2);g.supplies.potions=9;g.supplies.bigPotions=3;g.supplies.antidotes=5;g.supplies.armor=60;g.beginEnding();g.updateEnding(40);});
 await expect(page.locator('#challenge-options button').filter({hasText:'あくむ'})).toBeVisible();
 await page.locator('#challenge-options button').filter({hasText:'あくむ'}).click();await page.locator('#start').click();await page.locator('#card-close').click();
 const equipment=(g:any)=>({choices:g.arsenal.choices(),level:g.arsenal.levels[2],weapon:g.input.weapon,potions:g.supplies.potions,big:g.supplies.bigPotions,antidotes:g.supplies.antidotes,armor:g.supplies.armor});
 expect(await run(page,equipment)).toEqual({choices:[2,3],level:1,weapon:2,potions:9,big:3,antidotes:5,armor:60});
 await page.screenshot({path:`screenshots/carryover/${touch?'tablet':'PC'}-nightmare.png`});
 // A fresh browser page must retain the completed equipment, but easy and normal remain fresh.
 await page.reload();await page.locator('#challenge-options button').filter({hasText:'あくむ'}).click();await page.locator('#start').click();await page.locator('#card-close').click();expect(await run(page,equipment)).toEqual({choices:[2,3],level:1,weapon:2,potions:9,big:3,antidotes:5,armor:60});
 for(const mode of ['やさしい','ふつう','むずかしい']){
  await page.locator('#pause').click();await page.locator('#title-return').click();await page.locator('#challenge-options button').filter({hasText:mode}).click();await page.locator('#start').click();await page.locator('#card-close').click();
  expect(await run(page,equipment)).toEqual(mode==='むずかしい'?{choices:[2,3],level:1,weapon:2,potions:9,big:3,antidotes:5,armor:60}:{choices:[0],level:0,weapon:0,potions:1,big:0,antidotes:0,armor:0});
 }
 // Restarting a checkpoint must not grant another copy of saved consumables.
 await run(page,g=>{g.supplies.potions=2;g.hp=1;g.hurtTime=0;g.supplies.armor=0;g.hurt(10);g.deathReadyAt=0;g.start();});expect(await run(page,g=>g.supplies.potions)).toBe(2);
 expect(errors).toEqual([]);await context.close();
});
