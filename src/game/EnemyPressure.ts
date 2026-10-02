/** Shared movement and attack cadence, without changing health or damage. */
export const enemyPressure=1.2;
export const enemyWindup=(seconds:number)=>seconds/enemyPressure;
/** Keep readable windups while accelerating the complete attack cycle. */
export const enemyRecovery=(seconds:number,windup=0)=>Math.max(.05,seconds-windup*(enemyPressure-1));
