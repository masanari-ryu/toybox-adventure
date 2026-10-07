import {it,expect} from 'vitest';
import {usesTouchLayout} from '../src/input/Device';
it('uses mobile layout for phones and tablets, including desktop-identifying iPads',()=>{
 for(const userAgent of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile','Mozilla/5.0 (Linux; Android 14; Tablet)','Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)'])expect(usesTouchLayout({userAgent,maxTouchPoints:5,coarsePointer:true})).toBe(true);
 expect(usesTouchLayout({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/18 Safari/605',maxTouchPoints:5,coarsePointer:false})).toBe(true);
});
it('keeps small-window PCs and touch laptops with primary mice in PC layout',()=>{
 for(const userAgent of ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)','Mozilla/5.0 (X11; Linux x86_64)'])expect(usesTouchLayout({userAgent,maxTouchPoints:userAgent.includes('Windows')?10:0,coarsePointer:false,mobileHint:false})).toBe(false);
});
it('supports browser mobile hints and touch-primary convertibles',()=>{
 expect(usesTouchLayout({userAgent:'unknown',maxTouchPoints:0,coarsePointer:false,mobileHint:true})).toBe(true);
 expect(usesTouchLayout({userAgent:'Mozilla/5.0 (Windows NT 10.0)',maxTouchPoints:10,coarsePointer:true})).toBe(true);
});
