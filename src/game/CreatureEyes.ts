import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {creatureMaterial} from './CreatureSurface';
import type {Enemy} from './Enemy';
export function glossyPupil(size:number){
 const parts=[new T.SphereGeometry(size*.2,12,10).toNonIndexed(),new T.SphereGeometry(size*.072,8,6).toNonIndexed().translate(-size*.07,size*.11,-size*.12)];
 for(let n=0;n<parts.length;n++){const color=new T.Color(n?0xfcffff:0x172438),values=new Float32Array(parts[n].getAttribute('position').count*3);for(let i=0;i<values.length;i+=3){values[i]=color.r;values[i+1]=color.g;values[i+2]=color.b;}parts[n].setAttribute('color',new T.BufferAttribute(values,3));}
 const geometry=mergeGeometries(parts)!;for(const p of parts)p.dispose();const material=creatureMaterial(0xffffff,'enamel');material.vertexColors=true;return new T.Mesh(geometry,material);
}
/** Two independently expressive eyes cost only two extra draws per character. */
export function batchCreatureEyes(e:Enemy){
 if(!e.eyes.length)return;
 for(const eye of e.eyes){eye.group.updateMatrix();for(const o of [...eye.group.children]){if(o===eye.pupil||o===eye.lid||o===eye.highlight)continue;o.applyMatrix4(eye.group.matrix);e.body.add(o);}eye.group.removeFromParent();}
 const first=e.eyes[0];for(const object of [first.pupil,first.lid]){const m=object as T.Mesh;const batch=new T.InstancedMesh(m.geometry,m.material,e.eyes.length);batch.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.frustumCulled=false;batch.castShadow=false;e.body.add(batch);e.visualEyeBatches.push(batch);}
 updateCreatureEyes(e);
}
export function updateCreatureEyes(e:Enemy){
 const matrix=new T.Matrix4();for(let type=0;type<e.visualEyeBatches.length;type++){const batch=e.visualEyeBatches[type];for(let n=0;n<e.eyes.length;n++){const eye=e.eyes[n],o=type===0?eye.pupil:eye.lid;o.updateMatrix();matrix.multiplyMatrices(eye.group.matrix,o.matrix);batch.setMatrixAt(n,matrix);}batch.instanceMatrix.needsUpdate=true;batch.visible=type===0||e.visualDetail;}
}
