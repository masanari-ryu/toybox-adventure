import type {Enemy} from '../Enemy';
import type * as T from 'three';
export type BossAction='slam'|'charge'|'magic'|'warp'|'illusion'|'fan'|'aim'|'slash'|'advance';
export type BossMode='Chase'|'Windup'|'Attack'|'Recovery'|'Stunned'|'Transition'|'Dead';
export type BossState={mode:BossMode;until:number;action:BossAction;aim:{x:number;y:number;z:number};second:boolean;nightmare:boolean;chain:number;remaining:number;hit:boolean;nextWarp:number;nextIllusion:number;clones:Enemy[];cloneExpires:number;cloneGap:number;cloneActive?:boolean;retreatUntil?:number;adds?:{at:number;actors:Enemy[]};warp?:{x:number;z:number};tell?:T.Group;stars?:T.Group;visual?:T.Group;blade?:T.Group;blaster?:T.Group};
export function bossState(e:Enemy):BossState{return e.group.userData.bossCombat??(e.group.userData.bossCombat={mode:'Chase',until:0,action:'slam',aim:{x:0,y:0,z:0},second:false,nightmare:false,chain:0,remaining:0,hit:false,nextWarp:0,nextIllusion:0,clones:[],cloneExpires:0,cloneGap:0});}
