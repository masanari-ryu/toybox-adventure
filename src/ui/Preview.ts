import * as T from 'three';
import {buildBlaster} from '../game/Blaster';
import {ShaderWarmup} from '../render/ShaderWarmup';
const images=new Map<string,string>();let sequence=0;let active:ShaderWarmup|undefined;
/** Prepare the portrait asynchronously instead of blocking on GPU compilation. */
export function showPreview(renderer:T.WebGLRenderer,object:T.Object3D,weapon=-1,key=''){
 const stamp=++sequence;active?.cancel();const cacheKey=key||`weapon/${weapon}`;
 const display=(src:string)=>{const img=document.createElement('img');img.alt='みつけた おもちゃ';img.src=src;document.getElementById('card-icon')!.replaceChildren(img);};
 if((key||weapon>=0)&&images.has(cacheKey)){display(images.get(cacheKey)!);return;}
 const scene=new T.Scene(),group=weapon<0?object.clone(true):new T.Group();group.position.set(0,0,0);group.rotation.set(0,.4,0);if(weapon>=0){buildBlaster(group as T.Group,weapon);group.position.set(-.4,.3,.8);group.scale.setScalar(2);}scene.add(group,new T.HemisphereLight(0xffffff,0xc0d8d2,3));const light=new T.DirectionalLight(0xffefc4,3);light.position.set(3,5,4);scene.add(light);const camera=new T.PerspectiveCamera(40,1,.1,20);camera.position.set(2,1.4,3);camera.lookAt(0,.25,0);
 const target=new T.WebGLRenderTarget(256,256),warmup=new ShaderWarmup(renderer,scene,camera,target);active=warmup;
 const card=document.getElementById('card')!,observer=new MutationObserver(()=>{if(card.hidden)warmup.cancel();});observer.observe(card,{attributes:true,attributeFilter:['hidden']});
 void warmup.prepare().then(async ready=>{
  if(!ready||stamp!==sequence||card.hidden)return;
  const previous=renderer.getRenderTarget(),pixels=new Uint8Array(256*256*4);renderer.setRenderTarget(target);let reading:Promise<unknown>|undefined;
  try{renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,camera);reading=renderer.readRenderTargetPixelsAsync(target,0,0,256,256,pixels);}finally{renderer.setRenderTarget(previous);renderer.setClearColor(0x000000,1);}
  await reading;if(stamp!==sequence||card.hidden)return;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!,image=ctx.createImageData(256,256);for(let y=0;y<256;y++)image.data.set(pixels.subarray((255-y)*1024,(256-y)*1024),y*1024);ctx.putImageData(image,0,0);const src=canvas.toDataURL();if(key||weapon>=0)images.set(cacheKey,src);display(src);
 }).finally(()=>{observer.disconnect();warmup.dispose();target.dispose();if(active===warmup)active=undefined;if(weapon>=0)group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});});
}
