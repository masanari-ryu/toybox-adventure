import {defineConfig}from '@playwright/test';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
export default defineConfig({testDir:'tests/e2e',workers:1,timeout:180000,use:{baseURL:'http://127.0.0.1:5173',launchOptions:executablePath?{executablePath}:undefined},webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},reporter:'list'});
