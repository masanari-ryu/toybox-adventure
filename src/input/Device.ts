export type BrowserDeviceInfo={userAgent:string;maxTouchPoints:number;coarsePointer:boolean;mobileHint?:boolean};

/** iPadOS can identify itself as a Mac; screen width alone cannot identify a device. */
export function usesTouchLayout(info:BrowserDeviceInfo){
 if(info.mobileHint===true||/Android|iPhone|iPad|iPod|Mobile|Tablet|Silk\//i.test(info.userAgent))return true;
 if(/Macintosh|Mac OS X/i.test(info.userAgent)&&info.maxTouchPoints>1)return true;
 // Convertible PCs use the mouse layout when a fine pointer is primary.
 return info.maxTouchPoints>0&&info.coarsePointer;
}
export function browserUsesTouchLayout(){
 const nav=navigator as Navigator & {userAgentData?:{mobile?:boolean}};
 return usesTouchLayout({userAgent:nav.userAgent,maxTouchPoints:nav.maxTouchPoints||0,coarsePointer:matchMedia('(pointer:coarse)').matches,mobileHint:nav.userAgentData?.mobile});
}
