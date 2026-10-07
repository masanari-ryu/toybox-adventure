import * as T from 'three';
import type {Input} from './Input';

/** Touch taps are single shots; a mouse position persists throughout held fire. */
export function shotDirection(camera:T.PerspectiveCamera,input:Pick<Input,'tapAim'|'mouseAim'>){
 const aim=input.tapAim??input.mouseAim;
 input.tapAim=null;
 camera.updateMatrixWorld(true);
 return aim?new T.Vector3(aim.x,aim.y,.5).unproject(camera).sub(camera.getWorldPosition(new T.Vector3())).normalize():new T.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
}
