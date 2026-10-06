import * as T from 'three';

export type SurfaceKind = 'wood'|'metal'|'stone'|'plastic'|'rubber'|'fabric';
type SurfaceMaps = {normal:T.CanvasTexture;roughness:T.CanvasTexture;metalness:T.CanvasTexture;ao:T.CanvasTexture};
const cached=new Map<SurfaceKind,SurfaceMaps>();
const size=256;
const finishes:Record<SurfaceKind,{roughness:number;metalness:number;depth:number}>={
 wood:{roughness:.7,metalness:0,depth:.28},metal:{roughness:.37,metalness:.82,depth:.16},
 stone:{roughness:.88,metalness:.02,depth:.55},plastic:{roughness:.4,metalness:.05,depth:.2},
 rubber:{roughness:.94,metalness:0,depth:.25},fabric:{roughness:1,metalness:0,depth:.32},
};
function noise(x:number,y:number){const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);}
function imageTexture(data:Uint8ClampedArray){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d')!;const image=ctx.createImageData(size,size);image.data.set(data);ctx.putImageData(image,0,0);const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;texture.userData.sharedSurface=true;return texture;}
/** Six reusable 256px normal + packed AO/roughness/metalness map sets. Height is authored independently of painted artwork. */
export function surfaceMaps(kind:SurfaceKind){const existing=cached.get(kind);if(existing)return existing;const f=finishes[kind],height=new Float32Array(size*size),roughness=new Uint8ClampedArray(size*size*4),metalness=new Uint8ClampedArray(size*size*4),ao=new Uint8ClampedArray(size*size*4),normal=new Uint8ClampedArray(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=noise(x,y),edge=Math.min(x%64,63-x%64,y%64,63-y%64);let h=.55,a=1,r=f.roughness;
  if(kind==='stone'||kind==='plastic'){const bevel=T.MathUtils.smoothstep(edge,1,5);h=.23+.36*bevel+n*(kind==='stone'?.07:.012);a=.65+.35*bevel;r+=n*.09;if(kind==='stone')h+=Math.sin(x*.073+y*.023)*.016;}
  else if(kind==='wood'){const grain=Math.sin(y*.8+Math.sin(x*.038)*2.7)+Math.sin(y*.22+x*.008);h+=grain*.026+n*.018;a=.95+grain*.025;r+=Math.abs(grain)*.04;}
  else if(kind==='metal'){h+=n*.015+Math.sin(y*2.2+x*.005)*.008;r+=n*.13;if(n>.99)h-=.025;}
  else if(kind==='rubber'){const dot=Math.hypot(x%16-8,y%16-8);h+=dot<4?.07:.015;a=dot<5?.96:.84;r+=n*.04;}
  else{h+=Math.sin(x*Math.PI/2)*.035+Math.sin(y*Math.PI/2)*.03+n*.009;a=.92+n*.08;}
  const i=(y*size+x)*4;height[y*size+x]=h;for(let c=0;c<3;c++){roughness[i+c]=Math.round(T.MathUtils.clamp(r,0,1)*255);metalness[i+c]=Math.round(f.metalness*255);ao[i+c]=Math.round(T.MathUtils.clamp(a,0,1)*255);}roughness[i+3]=metalness[i+3]=ao[i+3]=255;
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const left=height[y*size+(x+size-1)%size],right=height[y*size+(x+1)%size],up=height[((y+size-1)%size)*size+x],down=height[((y+1)%size)*size+x],nx=(left-right)*2.8,ny=(up-down)*2.8,length=Math.hypot(nx,ny,1),i=(y*size+x)*4;normal[i]=(nx/length*.5+.5)*255;normal[i+1]=(ny/length*.5+.5)*255;normal[i+2]=(1/length*.5+.5)*255;normal[i+3]=255;}
 const packed=new Uint8ClampedArray(size*size*4);for(let i=0;i<packed.length;i+=4){packed[i]=ao[i];packed[i+1]=roughness[i];packed[i+2]=metalness[i];packed[i+3]=255;}const orm=imageTexture(packed),maps={normal:imageTexture(normal),roughness:orm,metalness:orm,ao:orm};cached.set(kind,maps);return maps;
}
export function configureSurface<M extends T.MeshStandardMaterial>(material:M,kind:SurfaceKind){const maps=surfaceMaps(kind),f=finishes[kind];material.normalMap=maps.normal;material.normalScale.set(f.depth,f.depth);material.roughnessMap=maps.roughness;material.roughness=1;material.metalnessMap=maps.metalness;material.metalness=1;material.aoMap=maps.ao;material.aoMapIntensity=.62;material.bumpMap=null;material.needsUpdate=true;return material;}
export function surfaceMaterial(color:T.ColorRepresentation,kind:SurfaceKind='plastic',options:T.MeshStandardMaterialParameters={}){return configureSurface(new T.MeshStandardMaterial({color,...options}),kind);}
