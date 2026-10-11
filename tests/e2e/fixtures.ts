import {test as base,type Browser}from '@playwright/test';
export * from '@playwright/test';
/** Never generate artificial AdSense traffic or let third-party ads manipulate test documents. */
export const test=base.extend<{}, {browser:Browser}>({browser:[async({browser},use)=>{
 const create=browser.newContext;
 browser.newContext=async options=>{const context=await create.call(browser,options);await context.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({status:204,body:''}));return context;};
 try{await use(browser);}finally{browser.newContext=create;}
},{scope:'worker'}]});
