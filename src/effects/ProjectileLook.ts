import * as T from 'three';
const auraGeometry=new T.SphereGeometry(1,10,8),trailGeometry=new T.SphereGeometry(1,8,6),auraMaterials=new Map<number,T.MeshBasicMaterial>(),trailMaterials=new Map<number,T.MeshBasicMaterial>();
function layer(color:number,aura:boolean){const cache=aura?auraMaterials:trailMaterials;if(!cache.has(color))cache.set(color,new T.MeshBasicMaterial({color,transparent:true,opacity:aura?.12:.25,depthWrite:false,blending:T.AdditiveBlending}));return cache.get(color)!;}
/** Shared meshes are cosmetic children, never consulted by shot collision. */
export function decorateProjectile(mesh:T.Mesh,enemy:boolean,kind:number,simple=false,direction?:T.Vector3){const color=enemy?kind===3?0xbde477:kind===4?0x91c8ff:0xffb1cd:kind===1?0x9beedb:0xffdf84,mat=mesh.material as T.MeshStandardMaterial;mat.roughness=.22;mat.metalness=.18;mat.emissive.setHex(color);mat.emissiveIntensity=enemy?.45:.8;if(simple)return;
 const radius=enemy?kind===3?.34:.24:kind===1?.38:.1,aura=new T.Mesh(auraGeometry,layer(color,true));aura.scale.setScalar(radius*1.7);mesh.add(aura);const tail=new T.Mesh(trailGeometry,layer(color,false));tail.scale.set(radius*.66,radius*.66,radius*2.7);tail.position.z=-radius*1.8;mesh.add(tail);if(direction)mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction.clone().normalize());
}
