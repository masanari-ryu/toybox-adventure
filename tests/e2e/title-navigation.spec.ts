import {test,expect} from '@playwright/test';
for(const [name,width,height,touch]of [['PC',1280,720,false],['phone',844,390,true],['tablet',1024,768,true]]as const)test(`title links to introduction and back ${name}`,async({browser})=>{
 test.setTimeout(120000);const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch});const page=await context.newPage();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/',{waitUntil:'domcontentloaded'});
 const link=page.getByRole('link',{name:'とくせつページ ↗'});await expect(link).toBeVisible();await expect(link).toHaveAttribute('href','./adventure/index.html');
 const box=(await link.boundingBox())!;expect(box.height).toBeGreaterThanOrEqual(44);expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);expect(box.y+box.height).toBeLessThanOrEqual(height);
 const practice=(await page.locator('#practice').boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(practice.y+practice.height);const hint=(await page.locator('.instructions').boundingBox())!;expect(hint.y).toBeGreaterThanOrEqual(box.y+box.height);
 await page.screenshot({path:`screenshots/title-navigation/${name}.png`});await link.click({noWaitAfter:true});await expect(page).toHaveURL(/\/adventure\/index\.html$/);await expect(page).toHaveTitle(/トイボックスアドベンチャー/);
 await page.locator('.intro-play').first().click({noWaitAfter:true});await expect(page.locator('#start')).toHaveText(/はじめる/,{timeout:30000});await page.locator('#start').click();await page.locator('#card-close').click();
 if(touch)await page.locator('#pause').click();else await page.keyboard.press('Escape');
 await expect(page.locator('#intro-link')).toBeHidden();await page.locator('#title-return').click();await expect(link).toBeVisible();expect(errors).toEqual([]);await context.close();
});
