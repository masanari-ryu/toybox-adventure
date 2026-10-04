import {test,expect} from '@playwright/test';
for(const [name,width,height,touch]of [['desktop',1280,720,false],['mobile',844,390,true]] as const)test(`castle route ${name}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch});const page=await context.newPage();await page.goto('/castle-review.html');await page.locator('#vertical-run').click();await expect(page.locator('#vertical-results')).toContainText('VERTICAL CHECKS COMPLETE');await expect(page.locator('#vertical-results')).not.toContainText('FAIL');await page.locator('#vertical-east').click();await page.locator('#vertical-hide').click();await page.screenshot({path:`screenshots/v3/${name}-east-room-fixed.png`});await context.close();
});
