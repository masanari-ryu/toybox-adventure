export type Theme='title'|'stage'|'factory'|'castle'|'boss';
export type Score={tempo:number,root:number,progression:number[][],melody:number[][],bass:number[],hat:number[],swing:number;kicks?:number[];snares?:number[];chordSteps?:number[];arpSteps?:number[];leadKind?:'lead'|'pluck'};
export const sections=['intro','A','A','B','B','break','final','final'] as const;
export const stageTheme:Score={tempo:122,root:60,progression:[[0,4,7,9],[9,12,16,19],[5,9,12,14],[7,11,14,17]],melody:[[7,9,12,-1,11,9,7,-1,4,-1,7,9,12,-1,9,-1],[4,-1,7,9,11,-1,12,14,12,-1,11,9,7,-1,4,-1],[9,12,14,-1,16,-1,14,12,9,-1,7,9,12,14,12,-1],[11,-1,14,16,14,12,11,-1,9,7,9,-1,11,14,7,-1]],bass:[0,-1,-1,7,-1,12,0,-1,0,-1,7,-1,12,-1,7,-1],hat:[0,2,3,6,8,10,11,14],swing:.09};
export const titleTheme:Score={tempo:112,root:62,progression:[[0,4,7,9],[7,11,14,17],[9,12,16,19],[5,9,12,14]],melody:[[4,-1,7,-1,11,-1,9,7,-1,-1,4,7,9,-1,7,-1],[7,-1,11,-1,14,-1,11,9,7,-1,-1,4,7,-1,-1,-1],[9,-1,12,14,-1,12,9,-1,7,-1,4,-1,7,9,-1,-1],[9,-1,7,-1,4,7,9,-1,11,-1,9,-1,7,-1,4,-1]],bass:[0,-1,-1,-1,7,-1,12,-1,0,-1,-1,7,-1,12,7,-1],hat:[2,6,10,14],swing:.12};
export const bossTheme:Score={tempo:132,root:65,progression:[[0,4,7,9],[5,9,12,14],[9,12,16,19],[7,11,14,17]],melody:[[12,14,16,-1,19,16,14,12,7,-1,12,14,16,19,16,-1],[9,12,16,17,16,-1,12,9,12,-1,16,17,19,17,16,-1],[16,19,21,-1,19,16,12,-1,16,19,24,-1,21,19,16,12],[14,-1,19,17,16,14,11,-1,14,16,19,21,19,16,14,-1]],bass:[0,-1,0,7,12,-1,7,0,0,12,7,-1,0,7,12,7],hat:[0,2,3,4,6,7,8,10,11,12,14,15],swing:.06};
export const factoryTheme:Score={...stageTheme,tempo:126,root:62,swing:.14,progression:[[0,4,7,9],[5,9,12,14],[2,5,9,12],[7,11,14,17]],melody:[[7,-1,9,11,14,-1,11,9,7,-1,4,7,9,11,12,-1],[9,-1,12,14,16,-1,14,12,9,-1,5,9,12,14,16,-1],[9,12,14,-1,17,-1,14,12,9,-1,5,9,12,14,14,-1],[11,-1,14,16,17,-1,14,11,7,-1,11,14,17,16,14,-1]],bass:[0,-1,7,-1,12,0,-1,7,0,-1,12,7,-1,0,7,-1],hat:[0,2,3,6,7,8,10,11,14]};
export const castleTheme:Score={tempo:114,root:67,swing:.03,progression:[[0,4,7,11],[5,9,12,16],[9,12,16,19],[7,11,14,17]],melody:[[12,-1,-1,14,16,-1,19,-1,16,-1,-1,14,12,-1,11,-1],[9,-1,12,-1,16,-1,-1,19,21,-1,19,-1,16,-1,12,-1],[16,-1,-1,19,24,-1,21,-1,19,-1,16,-1,12,-1,16,-1],[14,-1,19,-1,17,-1,16,-1,14,-1,-1,11,7,-1,-1,-1]],bass:[0,-1,-1,12,-1,-1,7,-1,0,-1,-1,7,12,-1,-1,7],hat:[2,6,10,14,15],kicks:[0,6,10],snares:[4,12],chordSteps:[0,8],arpSteps:[0,3,6,9,12,15],leadKind:'pluck'};
// Morning theme: an upbeat call-and-response hook with a lighter broken-beat groove.
stageTheme.melody=[[4,-1,7,9,12,-1,9,7,4,-1,7,-1,9,7,-1,-1],[12,-1,16,-1,19,16,-1,12,9,-1,12,14,16,-1,12,-1],[9,-1,12,14,16,-1,14,12,9,-1,5,9,12,-1,9,-1],[11,-1,14,16,19,-1,16,14,11,-1,7,-1,11,9,7,-1]];
stageTheme.bass=[0,-1,7,-1,12,-1,7,0,-1,0,-1,7,12,7,-1,-1];stageTheme.kicks=[0,7,8,14];stageTheme.chordSteps=[0,6,10];stageTheme.arpSteps=[2,4,8,12,14];
// Daylight funk uses a syncopated four-on-the-floor groove and short chord stabs.
factoryTheme.kicks=[0,4,8,12,15];factoryTheme.snares=[4,12];factoryTheme.chordSteps=[2,6,11,14];factoryTheme.arpSteps=[1,5,9,13];
factoryTheme.melody=[[7,-1,-1,9,12,-1,9,-1,4,7,-1,9,11,-1,9,7],[9,-1,12,-1,-1,14,16,-1,12,9,-1,5,9,-1,12,-1],[9,-1,-1,12,14,-1,12,9,5,-1,9,-1,12,14,-1,9],[11,-1,14,-1,17,-1,14,11,7,-1,-1,11,14,-1,11,7]];
/** Keep accented theme notes on the current harmony; passing notes stay diatonic. */
export function chordTone(note:number,chord:number[]){
 const tones=chord.flatMap(n=>[-24,-12,0,12,24].map(o=>n+o));
 return tones.reduce((best,n)=>Math.abs(n-note)<Math.abs(best-note)?n:best,tones[0]);
}
for(const score of [titleTheme,stageTheme,factoryTheme,castleTheme,bossTheme]){
 score.melody=score.melody.map((bar,b)=>bar.map((note,s)=>note<0?note:s%4===0?chordTone(note,score.progression[b]):note));
}
export const scores:Record<Theme,Score>={title:titleTheme,stage:stageTheme,factory:factoryTheme,castle:castleTheme,boss:bossTheme};
export const midi=(n:number)=>440*2**((n-69)/12);
export function sectionAt(bar:number){return sections[Math.floor((bar%32)/4)];}
export const clearNotes=[72,76,79,84,81,79,76,79,84,88,91,96];
