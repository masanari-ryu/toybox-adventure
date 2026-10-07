import {it,expect,vi} from 'vitest';
import * as T from 'three';
import {ShaderWarmup} from '../src/render/ShaderWarmup';
it('ignores shader programs released by a concurrent stage or weapon rebuild',async()=>{
 const live={},released={},parameter=vi.fn(()=>true),gl={getExtension:()=>({COMPLETION_STATUS_KHR:1}),isProgram:(p:unknown)=>p===live,isContextLost:()=>false,getProgramParameter:parameter};
 const renderer={getContext:()=>gl,getRenderTarget:()=>null,setRenderTarget:vi.fn(),compile:vi.fn(),info:{programs:[{program:undefined},{program:released},{program:live}]}} as unknown as T.WebGLRenderer;
 const warmup=new ShaderWarmup(renderer,new T.Scene(),new T.PerspectiveCamera());expect(await warmup.prepare()).toBe(true);expect(parameter).toHaveBeenCalledExactlyOnceWith(live,1);warmup.dispose();
});
