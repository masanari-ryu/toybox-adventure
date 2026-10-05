/** Four wheel-joint beats: ga-tan, go-ton. Motion stays below five centimetres. */
export const railBeatInterval=.18;
const cycle=.72,beats=[0,.13,.36,.49];
export function railBounce(elapsed:number){const phase=elapsed%cycle;return beats.reduce((sum,beat)=>{const age=(phase-beat+cycle)%cycle;return sum+(age<.13?.016*Math.sin(age/.13*Math.PI*2)*Math.exp(-age*18):0);},0);}
export function railBeat(elapsed:number){const lap=Math.floor(elapsed/cycle),phase=elapsed%cycle;return lap*4+beats.filter(beat=>phase>=beat).length-1;}
