export type GraphicsTier='high'|'medium'|'low';
export const graphicsBudget={
 high:{pixelRatio:1.25,shadow:1024,shadowRange:24,lights:3,detailRange:32,post:false},
 medium:{pixelRatio:1.1,shadow:512,shadowRange:18,lights:3,detailRange:22,post:false},
 low:{pixelRatio:1,shadow:0,shadowRange:14,lights:2,detailRange:14,post:false}
} as const;
export function initialTier(touch:boolean,width:number,height:number,cores=4):GraphicsTier{
 return touch?(Math.min(width,height)>=600&&cores>=4?'medium':'low'):cores>=12?'high':'medium';
}
/** Require sustained slow windows; transitions change rendering only. */
export class GraphicsQuality{
 tier:GraphicsTier;slowWindows=0;
 constructor(private touch:boolean,width:number,height:number,cores=4){this.tier=initialTier(touch,width,height,cores);}
 sample(fps:number){const target=this.tier==='high'||!this.touch?55:45;if(fps<target)this.slowWindows++;else this.slowWindows=0;if(this.slowWindows<2||this.tier==='low')return false;this.tier=this.tier==='high'?'medium':'low';this.slowWindows=0;return true;}
}
