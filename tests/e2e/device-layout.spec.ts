import {test,expect} from '@playwright/test';
const modes=[
 {name:'PC',width:1280,height:720,touch:false,mobile:false,ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36'},
 {name:'phone',width:844,height:390,touch:true,mobile:true,ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'},
 {name:'tablet',width:1024,height:768,touch:true,mobile:false,ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15'},
];
for(const device of modes)test(`automatic browser layout ${device.name}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width:device.width,height:device.height},hasTouch:device.touch,isMobile:device.mobile,userAgent:device.ua});
 if(device.name==='tablet')await context.addInitScript(()=>Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5}));
 const page=await context.newPage();await page.goto('/');await expect(page.locator('#start')).toBeEnabled({timeout:30000});
 if(device.touch){await expect(page.locator('body')).toHaveClass(/touch/);await expect(page.locator('.instructions')).toContainText('タップ');}
 else{await expect(page.locator('body')).not.toHaveClass(/touch/);await expect(page.locator('.instructions')).toContainText('カーソル');}
 const buttons=await page.locator('#challenge-options button, #start, #practice').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
 for(const b of buttons){expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.w).toBeLessThanOrEqual(device.width);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.y+b.h).toBeLessThanOrEqual(device.height);expect(b.h).toBeGreaterThanOrEqual(44);}
 await page.screenshot({path:`screenshots/cursor-aim/${device.name}-title.png`});await page.locator('#start').click();await page.locator('#card-close').click();await expect(page.locator('#hud')).toBeVisible();
 if(device.touch){await expect(page.locator('#look')).toBeVisible();await page.locator('#pause').click();await expect(page.locator('#pause-controls')).toContainText('ゆびで');}
 else{await expect(page.locator('#look')).not.toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#pause-controls')).toContainText('カーソル');}
 await page.screenshot({path:`screenshots/cursor-aim/${device.name}-pause.png`});await context.close();
});
