import * as T from 'three';
let shadow:T.CanvasTexture|undefined;
/** Soft baked contact shadow also works when mobile realtime shadows are off. */
export function contactShadow(radius:number){if(!shadow){const a=document.createElement('canvas');a.width=a.height=128;const c=a.getContext('2d')!,g=c.createRadialGradient(64,64,8,64,64,60);g.addColorStop(0,'rgba(31,41,64,.38)');g.addColorStop(1,'rgba(31,41,64,0)');c.fillStyle=g;c.fillRect(0,0,128,128);shadow=new T.CanvasTexture(a);}const m=new T.Mesh(new T.PlaneGeometry(radius*2.7,radius*2.7),new T.MeshBasicMaterial({map:shadow,transparent:true,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.y=.025;m.renderOrder=1;return m;}
