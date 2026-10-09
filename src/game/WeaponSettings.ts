/** Player-side tuning only. Enemy stats, waves and other difficulties remain independent. */
export const nightmareWeapons={
 rifle:{index:4,kind:'ASSAULT RIFLE',damage:285,bossDamage:45,cooldown:.12,speed:80,range:64,energy:0},
 cannon:{index:5,kind:'CANNON',damage:760,bossDamage:285,cooldown:.85,speed:34,range:64,energy:0,radius:6,selfDamage:28,selfRadius:4},
 thunder:{index:6,kind:'THUNDER PLUS',damage:720,bossDamage:285,cooldown:.42,range:52,energy:3,angle:.22},
}as const;
export const murasameHealthCost=1;
export const murasameBossDamage=360;
export const bossDamageMultiplier=1;
export const nightmareWeaponIndex:Record<string,number>={'ASSAULT RIFLE':4,CANNON:5,'THUNDER PLUS':6};
export const pickupWeaponIndex:Record<string,number>={...nightmareWeaponIndex,'BUBBLE MODULE':1,'STAR MODULE':2,KATANA:3,MURASAME:3,'POP UPGRADE':0,'BUBBLE UPGRADE':1,'NOVA UPGRADE':2};
export function weaponCooldown(index:number,level=0){return index===4?nightmareWeapons.rifle.cooldown:index===5?nightmareWeapons.cannon.cooldown:index===6?nightmareWeapons.thunder.cooldown:index===3?.48:[.19,.65,.48][index]*(level?.75:1);}
export function weaponEnergy(index:number){return index===6?nightmareWeapons.thunder.energy:index===2?12:0;}
export function specialDamage(kind:string,regular:number,boss:number,power=1){return (kind==='KING PUNI'||kind==='SAMURAI'?boss*bossDamageMultiplier:regular)*power;}
/** Stage progression (three adventures), placed on accessible approach paths before combat. */
export const nightmareWeaponPickups:[string,number,number,number][][]=[
 [['ASSAULT RIFLE',14,42,0xa4f49c]],
 [['CANNON',18,58,0xffb768]],
 [['THUNDER PLUS',18,78,0x9fe7ff]],
];
