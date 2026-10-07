import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const origin='https://masanari-ryu.github.io/toybox-adventure';
const rules=readFileSync('legacy-redirect/_redirects','utf8').split('\n').filter(s=>s&&!s.startsWith('#')).map(s=>s.split(/\s+/));
function redirected(path:string){for(const [pattern,target,status]of rules){if(pattern==='/*')return {url:target.replace(':splat',path.slice(1)),status:Number(status)};if(pattern===path)return {url:target,status:Number(status)};}throw Error('no redirect');}
it('keeps the indexed home, introduction, assets and HTML paths on the new origin',()=>{for(const path of ['/','/adventure/','/adventure/manual.html','/assets/game.js'])expect(redirected(path)).toEqual({url:origin+path,status:301});});
it('normalizes former extensionless manual and terms URLs to existing GitHub Pages files',()=>{for(const name of ['manual','terms'])for(const slash of ['','/'])expect(redirected(`/adventure/${name}${slash}`)).toEqual({url:`${origin}/adventure/${name}.html`,status:301});expect(redirected('/adventure').url).toBe(origin+'/adventure/');});
