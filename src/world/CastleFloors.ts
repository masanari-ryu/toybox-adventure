import {bossEntranceClosed} from './Threats';
/** Original star castle: continuous ramps, narrow galleries, and a third-floor throne room. */
export type Deck={x:number;z:number;w:number;d:number;y:number;endY?:number;axis?:'x'|'z';name:string};
export const castleDecks:Deck[]=[
 {x:30,z:48,w:10,d:16,y:6,endY:0,axis:'z',name:'ほしの かいだん'},
 {x:30,z:38,w:16,d:6,y:6,name:'2かいの テラス'},
 {x:48,z:38,w:28,d:4.4,y:6,name:'ほそい ほしの みち'},
 {x:62,z:36,w:5,d:32,y:6,name:'そらの わたりろうか'},
 {x:52,z:50,w:24,d:4.4,y:6,name:'ほきゅうの よりみち'},
 {x:52,z:22,w:24,d:4.4,y:6,name:'ひみつの テラス'},
 {x:72,z:32,w:20,d:8,y:6,endY:12,axis:'x',name:'3かいへの かいだん'},
 {x:90,z:22,w:20,d:28,y:12,name:'3かいの おおひろま'},
 {x:106,z:18,w:12,d:20,y:12,name:'ほしの へや'},
];
export const castleRoute:[number,number][]=[[26,58],[30,56],[30,48],[30,40],[40,38],[50,38],[62,38],[62,32],[70,32],[78,32],[82,32],[90,32],[90,24],[90,18],[98,18],[106,10],[106,18]];
export function contains(d:Deck,x:number,z:number,inset=0){return Math.abs(x-d.x)<=d.w/2-inset&&Math.abs(z-d.z)<=d.d/2-inset;}
export function deckHeight(d:Deck,x:number,z:number){if(d.endY===undefined)return d.y;const t=d.axis==='x'?(x-d.x+d.w/2)/d.w:(z-d.z+d.d/2)/d.d;return d.y+(d.endY-d.y)*Math.max(0,Math.min(1,t));}
export function surfaces(x:number,z:number){return castleDecks.filter(d=>contains(d,x,z)).map(d=>deckHeight(d,x,z));}
export function topHeight(x:number,z:number){return Math.max(0,...surfaces(x,z));}
/** Feet can step onto a ramp, but cannot teleport to a gallery directly overhead. */
export function supportHeight(x:number,z:number,feet:number,step=.55){return Math.max(0,...surfaces(x,z).filter(y=>y<=feet+step));}
export function floorNumber(feet:number){return feet>=10?3:feet>=4?2:1;}
export function castleWall(x:number,z:number,feet:number,gate:boolean,rewardOpen:boolean){
 if(feet<10)return false;
 if(x>=79.6&&x<=112.5&&z>=7.5&&z<=36.5){
  if(z<8.35||(x<80.35&&!(z>(bossEntranceClosed?30.4:28.35)&&z<35.65))||x>111.65||z>35.65)return true;
  if(x>99.7&&z>27.65)return true;
  if(Math.abs(x-98)<.45&&!(rewardOpen&&z>16&&z<20))return true;
  if(bossEntranceClosed&&x>=80&&x<=98&&Math.abs(z-30)<.4)return true;
 }
 return false;
}
