import {describe,it,expect} from 'vitest';
import {GraphicsQuality,initialTier,graphicsBudget} from '../src/render/GraphicsQuality';
describe('render-only budgets',()=>{
 it('continues reducing desktop effects when medium still misses smooth play',()=>{const q=new GraphicsQuality(false,1280,720,16);q.sample(40);q.sample(40);expect(q.tier).toBe('medium');expect(q.sample(40)).toBe(false);expect(q.sample(40)).toBe(true);expect(q.tier).toBe('low');});
 it('prefers direct rendering on phones and scales tablets',()=>{expect(initialTier(true,844,390,8)).toBe('low');expect(initialTier(true,1024,768,8)).toBe('medium');expect(initialTier(false,1280,720,8)).toBe('medium');expect(initialTier(false,1280,720,16)).toBe('high');expect(graphicsBudget.low.post).toBe(false);expect(graphicsBudget.medium.post).toBe(false);});
 it('requires sustained low performance before reducing effects',()=>{const q=new GraphicsQuality(false,1280,720,16);expect(q.sample(30)).toBe(false);q.sample(60);expect(q.sample(30)).toBe(false);expect(q.sample(30)).toBe(true);expect(q.tier).toBe('medium');expect(q.sample(20)).toBe(false);expect(q.sample(20)).toBe(true);expect(q.tier).toBe('low');expect(q.sample(60)).toBe(false);});
});
