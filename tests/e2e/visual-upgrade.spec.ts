import {test,expect} from '@playwright/test';
for(const [name,w,h,touch] of [['desktop',1280,720,false],['phone',844,390,true],['tablet',1024,768,true]]as const){
 test(`visual upgrade ${name}`,async({browser})=>{test.setTimeout(180000);const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch});const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
 for(const scene of ['stage1','corridor','door-open','combat1','shot-frame','chest','poison','train','overlook','upperboss','stage3','samurai','katana','thunder','rail-loop']){await page.goto(`/tests-runner.html?scene=${scene}`);await expect(page.locator('#review-scenes')).toBeAttached({timeout:20000});await page.waitForTimeout(250);await page.screenshot({path:`screenshots/visual-upgrade/${name}-${scene}.png`});}
 for(const scene of ['stage1','stage3','upperboss']){await page.goto(`/tests-runner.html?scene=${scene}`);await expect(page.locator('#review-scenes')).toBeAttached({timeout:20000});await page.waitForTimeout(16000);const diagnostics=await page.evaluate(()=> (window as unknown as {visualDiagnostics:()=>unknown}).visualDiagnostics());console.log(name,scene,JSON.stringify(diagnostics));}expect(errors).toEqual([]);await context.close();
 });
}
