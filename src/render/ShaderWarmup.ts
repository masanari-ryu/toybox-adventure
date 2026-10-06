import * as T from 'three';
/** Own material clones keep asynchronous preparation safe across stage resets. */
export class ShaderWarmup {
 private group=new T.Group();private materials=new Map<T.Material,T.Material>();private aborted=false;private disposed=false;
 constructor(private renderer:T.WebGLRenderer,private scene:T.Scene,private camera:T.Camera,private target:T.WebGLRenderTarget|null=null){
  scene.traverse(o=>{
   if(!(o instanceof T.Mesh||o instanceof T.Points||o instanceof T.Line))return;
   const copy=(m:T.Material)=>{let clone=this.materials.get(m);if(!clone){clone=m.clone();this.materials.set(m,clone);}return clone;};
   const material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
   let node:T.Object3D;
   if(o instanceof T.InstancedMesh){const instance=new T.InstancedMesh(o.geometry,material,1);if(o.instanceColor)instance.setColorAt(0,new T.Color(0xffffff));node=instance;}
   else if(o instanceof T.Points)node=new T.Points(o.geometry,material);
   else if(o instanceof T.Line)node=new T.Line(o.geometry,material);
   else node=new T.Mesh(o.geometry,material);
   node.receiveShadow=o.receiveShadow;this.group.add(node);
  });
 }
 async prepare(progress:(n:number)=>void=()=>{}){
  const textures=new Set<T.Texture>();for(const m of this.materials.values())for(const t of Object.values(m))if(t instanceof T.Texture&&t.image&&!t.isRenderTargetTexture)textures.add(t);
  const queue=[...textures];let index=0;
  // Spread texture uploads over frames, keeping controls and loading UI responsive.
  while(index<queue.length){if(this.aborted||this.renderer.getContext().isContextLost())return false;const start=performance.now();do{this.renderer.initTexture(queue[index++]);}while(index<queue.length&&performance.now()-start<3);progress(index/queue.length*.45);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));}
  if(this.aborted)return false;
  const previous=this.renderer.getRenderTarget();this.renderer.setRenderTarget(this.target);
  try{this.renderer.compile(this.group,this.camera,this.scene);}finally{this.renderer.setRenderTarget(previous);}
  const gl=this.renderer.getContext(),extension=gl.getExtension('KHR_parallel_shader_compile'),programs=[...(this.renderer.info.programs??[])];
  if(!extension){await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));progress(1);return !this.aborted;}
  return await new Promise<boolean>(resolve=>{
   const check=()=>{if(this.aborted||gl.isContextLost()){resolve(false);return;}let ready=0;for(const p of programs)if(gl.getProgramParameter(p.program,extension.COMPLETION_STATUS_KHR))ready++;progress(.45+.55*ready/Math.max(1,programs.length));if(ready===programs.length)resolve(true);else setTimeout(check,8);};check();
  });
 }
 cancel(){this.aborted=true;this.dispose();}
 /** Release after the real draw has retained its compiled programs. */
 dispose(){if(this.disposed)return;this.disposed=true;for(const m of this.materials.values())m.dispose();this.materials.clear();for(const child of this.group.children)if(child instanceof T.InstancedMesh)child.dispose();this.group.clear();}
}
