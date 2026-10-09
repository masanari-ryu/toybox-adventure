import * as T from 'three';

type Finish='shell'|'metal'|'rubber';
type Maps={color:T.CanvasTexture;normal:T.CanvasTexture;rough:T.CanvasTexture;metal:T.CanvasTexture;ao:T.CanvasTexture};
const finishes=new Map<Finish,Maps>();
function texture(canvas:HTMLCanvasElement,color=false){const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;t.userData.sharedSurface=true;if(color)t.colorSpace=T.SRGBColorSpace;return t;}
/** Small original surface sheets shared by every first-person toy weapon. */
function finishMaps(kind:Finish){if(finishes.has(kind))return finishes.get(kind)!;const size=256,a=document.createElement('canvas');a.width=a.height=size;const c=a.getContext('2d')!,height=new Float32Array(size*size),rough=document.createElement('canvas'),metal=document.createElement('canvas'),ao=document.createElement('canvas'),normal=document.createElement('canvas');for(const b of [rough,metal,ao,normal])b.width=b.height=size;
 const pixels=c.createImageData(size,size),r=rough.getContext('2d')!.createImageData(size,size),m=metal.getContext('2d')!.createImageData(size,size),oc=ao.getContext('2d')!.createImageData(size,size);let seed=173;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){seed=seed*16807%2147483647;const n=seed%100/100,i=y*size+x,p=i*4,seam=kind==='shell'&&(x%64<2||y%128<2),rib=kind==='rubber'&&((x+y)%20<3),scratch=kind==='metal'&&y%29===0&&x%103<61;const value=seam?143:rib?185:scratch?205:238+Math.round(n*15);height[i]=seam?0:rib?.15:scratch?.42:.6+n*(kind==='rubber'?.12:.025);for(let channel=0;channel<3;channel++){pixels.data[p+channel]=value;r.data[p+channel]=(kind==='metal'?78:kind==='shell'?107:216)+n*20;m.data[p+channel]=kind==='metal'?238:kind==='rubber'?0:12;oc.data[p+channel]=seam?174:rib?201:252;}pixels.data[p+3]=r.data[p+3]=m.data[p+3]=oc.data[p+3]=255;}
 c.putImageData(pixels,0,0);rough.getContext('2d')!.putImageData(r,0,0);metal.getContext('2d')!.putImageData(m,0,0);ao.getContext('2d')!.putImageData(oc,0,0);
 const nc=normal.getContext('2d')!,np=nc.createImageData(size,size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*1.9,dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*1.9,v=new T.Vector3(-dx,-dy,1).normalize();np.data[i]=(v.x*.5+.5)*255;np.data[i+1]=(v.y*.5+.5)*255;np.data[i+2]=(v.z*.5+.5)*255;np.data[i+3]=255;}nc.putImageData(np,0,0);
 const maps={color:texture(a,true),normal:texture(normal),rough:texture(rough),metal:texture(metal),ao:texture(ao)};finishes.set(kind,maps);return maps;
}
export function weaponFinish(color:number,kind:Finish='shell'){const maps=finishMaps(kind);return new T.MeshPhysicalMaterial({color,map:maps.color,normalMap:maps.normal,normalScale:new T.Vector2(kind==='metal'?.25:.48,kind==='metal'?.25:.48),roughnessMap:maps.rough,metalnessMap:maps.metal,aoMap:maps.ao,aoMapIntensity:.55,metalness:kind==='metal'?1:.15,roughness:1,clearcoat:kind==='shell'?.52:kind==='metal'?.23:0,clearcoatRoughness:.3});}
export function weaponGlow(color:number){return new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.9,roughness:.24,metalness:.15});}
let mist:T.CanvasTexture|undefined;
export function muzzleMist(){if(!mist){const a=document.createElement('canvas');a.width=a.height=64;const c=a.getContext('2d')!,grad=c.createRadialGradient(32,32,1,32,32,31);grad.addColorStop(0,'rgba(190,228,234,.3)');grad.addColorStop(.5,'rgba(190,228,234,.15)');grad.addColorStop(1,'rgba(190,228,234,0)');c.fillStyle=grad;c.fillRect(0,0,64,64);mist=texture(a);}return mist;}
