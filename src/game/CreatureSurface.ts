import * as T from 'three';

export type CreatureSurface='gel'|'enamel'|'metal'|'cloth'|'rubber'|'skin';
const surfaces=new Map<CreatureSurface,{normal:T.CanvasTexture;roughness:T.CanvasTexture;ao:T.CanvasTexture}>();
/** Original micro-surface sheets, shared by every character; no external assets. */
export function creatureSurface(kind:CreatureSurface){
 const cached=surfaces.get(kind);if(cached)return cached;
 const size=128,height=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const grain=Math.sin(x*31.13+y*17.37)*Math.sin(x*7.91-y*11.71);
  height[y*size+x]=kind==='cloth'?Math.sin(x*Math.PI/2)*Math.cos(y*Math.PI/2)*.4:
   kind==='rubber'?Math.cos(x*Math.PI/8)*Math.cos(y*Math.PI/8)*.25:
   kind==='metal'?Math.sin(y*.7)*.07+grain*.035:
   kind==='gel'?Math.sin(x*.12+y*.17)*.012+grain*.012:
   kind==='skin'?grain*.025:grain*.045;
 }
 const make=(type:'normal'|'roughness'|'ao')=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d')!,pixels=c.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=y*size+x,p=i*4,h=height[i],dx=height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size],dy=height[(y+1)%size*size+x]-height[(y+size-1)%size*size+x];
   if(type==='normal'){const n=new T.Vector3(-dx*.38,-dy*.38,1).normalize();pixels.data[p]=(n.x*.5+.5)*255;pixels.data[p+1]=(n.y*.5+.5)*255;pixels.data[p+2]=(n.z*.5+.5)*255;}
   else{const value=type==='ao'?Math.min(255,245+h*24):Math.min(255,(kind==='cloth'?225:kind==='rubber'?218:kind==='metal'?165:kind==='gel'?178:205)+h*30);pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=value;}
   pixels.data[p+3]=255;
  }
  c.putImageData(pixels,0,0);const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=2;return t;
 };
 const value={normal:make('normal'),roughness:make('roughness'),ao:make('ao')};surfaces.set(kind,value);return value;
}
export function setCreatureSurface(material:T.MeshStandardMaterial,kind:CreatureSurface){
 const maps=creatureSurface(kind);material.normalMap=maps.normal;material.normalScale.set(kind==='cloth'?.24:kind==='rubber'?.2:.12,kind==='cloth'?.24:kind==='rubber'?.2:.12);material.roughnessMap=maps.roughness;material.metalnessMap=null;material.aoMap=maps.ao;material.aoMapIntensity=kind==='cloth'?.45:.24;material.bumpMap=null;
 material.roughness=kind==='cloth'?.94:kind==='rubber'?.8:kind==='metal'?.31:kind==='skin'?.53:kind==='gel'?.24:.35;material.metalness=kind==='metal'?.68:kind==='enamel'?.16:0;material.userData.creatureSurface=kind;
 if(material instanceof T.MeshPhysicalMaterial){material.clearcoat=kind==='gel'?1:kind==='enamel'?.75:.2;material.clearcoatRoughness=kind==='gel'?.14:.23;}
 return material;
}
/** Metal, felt, molded rubber and painted surfaces remain visibly different. */
export function creatureMaterial(color:number,surface:CreatureSurface,texture?:T.Texture){const m=new T.MeshPhysicalMaterial({color,map:texture??null});return setCreatureSurface(m,surface);}

const geometryCache=new Map<string,T.BufferGeometry>(),materialCache=new Map<string,T.Material>();
/** Cache only finished meshes: static merging can still dispose temporary build parts. */
export function shareCreatureResources(kind:string,body:T.Object3D){let index=0;body.traverse(o=>{
 if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;
 const key=kind+'/'+index++,cachedGeometry=geometryCache.get(key);if(cachedGeometry){o.geometry.dispose();o.geometry=cachedGeometry;}else geometryCache.set(key,o.geometry);
 const m=o.material as T.MeshStandardMaterial;
 const materialKey=[m.type,m.color?.getHex(),m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.opacity,m.transparent,m.map?.uuid,m.normalMap?.uuid,m.roughnessMap?.uuid,m.aoMap?.uuid,m.userData.creatureSurface,m.vertexColors].join('/');
 const cachedMaterial=materialCache.get(materialKey);if(cachedMaterial){if(m!==cachedMaterial)m.dispose();o.material=cachedMaterial;}else materialCache.set(materialKey,m);
 });}
