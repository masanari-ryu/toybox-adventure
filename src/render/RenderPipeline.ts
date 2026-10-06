import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GraphicsQuality,graphicsBudget} from './GraphicsQuality';
/** Mobile uses direct rendering plus baked AO. Screen effects are PC-only. */
export class RenderPipeline{
 quality:GraphicsQuality;composer?:EffectComposer;ao?:SSAOPass;bloom?:UnrealBloomPass;environment:T.WebGLRenderTarget;width=1;height=1;
 constructor(public renderer:T.WebGLRenderer,public scene:T.Scene,public camera:T.PerspectiveCamera,touch:boolean){this.quality=new GraphicsQuality(touch,innerWidth,innerHeight,navigator.hardwareConcurrency);const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();this.environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();scene.environment=this.environment.texture;scene.environmentIntensity=.4;renderer.toneMappingExposure=1.05;renderer.info.autoReset=false;this.resize(innerWidth,innerHeight);}
 resize(w:number,h:number){this.width=w;this.height=h;const budget=graphicsBudget[this.quality.tier];this.renderer.setPixelRatio(Math.min(devicePixelRatio,budget.pixelRatio));this.renderer.setSize(w,h);this.renderer.shadowMap.enabled=budget.shadow>0;if(budget.post&&!this.composer){this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.ao=new SSAOPass(this.scene,this.camera,w,h);this.ao.kernelRadius=.8;this.ao.minDistance=.001;this.ao.maxDistance=.065;this.composer.addPass(this.ao);this.bloom=new UnrealBloomPass(new T.Vector2(w,h),.19,.3,1.45);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());}if(this.composer){this.composer.setPixelRatio(Math.min(devicePixelRatio,budget.pixelRatio));this.composer.setSize(w,h);this.ao?.setSize(Math.round(w*.55),Math.round(h*.55));}}
 sample(fps:number){if(this.quality.sample(fps)){this.resize(this.width,this.height);return true;}return false;}
 render(){this.renderer.info.reset();if(graphicsBudget[this.quality.tier].post&&this.composer)this.composer.render();else this.renderer.render(this.scene,this.camera);}
}
