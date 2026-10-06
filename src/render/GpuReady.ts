import * as T from 'three';
/** Wait for the loading draw without a blocking finish/readback call. */
export async function gpuReady(renderer:T.WebGLRenderer){
 const gl=renderer.getContext() as WebGL2RenderingContext;if(gl.isContextLost())return false;if(!gl.fenceSync){await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return true;}
 const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);if(!sync)return false;gl.flush();
 return await new Promise<boolean>(resolve=>{const check=()=>{if(gl.isContextLost()){gl.deleteSync(sync);resolve(false);return;}const state=gl.clientWaitSync(sync,0,0);if(state===gl.TIMEOUT_EXPIRED){setTimeout(check,4);return;}gl.deleteSync(sync);resolve(state!==gl.WAIT_FAILED);};check();});
}
