import type {FullState}from '../src/debug/BotApi';
export type StageMetrics={stageIndex:number;seconds:number;hpLost:number;minHp:number;potionsUsed:number;bigPotionsUsed:number;bossHpLost:number;bossPotionsUsed:number;entry:{hp:number;potions:number;bigPotions:number};bossStart?:number;bossEnd?:number};
/** Observes public snapshots only; it never reads/edits the Game object. */
export class CampaignMetrics{
 rows:StageMetrics[]=[];damage:{stageIndex:number;amount:number;hp:number;position:FullState['position'];time:number}[]=[];
 private seen=new Set<string>();private starts=new Map<number,number>();private ends=new Set<number>();private previous?:FullState;private bossIds=new Map<number,string>();
 observe(s:FullState){let row=this.rows.find(v=>v.stageIndex===s.stageIndex);if(!row){row={stageIndex:s.stageIndex,seconds:0,hpLost:0,minHp:s.hp,potionsUsed:0,bigPotionsUsed:0,bossHpLost:0,bossPotionsUsed:0,entry:{hp:s.hp,potions:s.potions,bigPotions:s.bigPotions}};this.rows.push(row);this.starts.set(s.stageIndex,s.time);}
  if(!this.ends.has(s.stageIndex)&&s.state!=='ending'&&s.state!=='clear')row.seconds=s.time-this.starts.get(s.stageIndex)!;
  if(s.train?.progress===1||s.state==='ending'||s.state==='clear')this.ends.add(s.stageIndex);
  row.minHp=Math.min(row.minHp,s.hp);const boss=s.enemies.find(e=>e.kind==='KING PUNI'&&e.maxHp>1);if(boss)this.bossIds.set(s.stageIndex,boss.id);
  const events=s.events.filter(e=>{const id=JSON.stringify(e);if(this.seen.has(id))return false;this.seen.add(id);return true;});
  for(const e of events){const r=this.rows.find(v=>v.stageIndex===e.stageIndex);if(!r)continue;if(e.type==='boss-entrance-open')r.bossStart=e.time;if(e.type==='defeat'&&e.id===this.bossIds.get(e.stageIndex))r.bossEnd=e.time;}
  if(s.gate&&row.bossStart===undefined)row.bossStart=s.time;
  for(const e of events)if(e.type==='damage'){const r=this.rows.find(v=>v.stageIndex===e.stageIndex)!;r.hpLost+=e.amount as number;r.minHp=Math.min(r.minHp,e.hp as number);if(r.bossStart!==undefined&&e.time>=r.bossStart&&(r.bossEnd===undefined||e.time<=r.bossEnd))r.bossHpLost+=e.amount as number;this.damage.push({stageIndex:e.stageIndex,amount:e.amount as number,hp:e.hp as number,position:e.position,time:e.time});}
  const prev=this.previous;if(prev&&prev.stageIndex===s.stageIndex&&prev.state!=='over'){
   const small=events.filter(e=>e.type==='pickup'&&e.kind==='POTION').length,big=events.filter(e=>e.type==='pickup'&&e.kind==='BIG POTION').length;
   const used=Math.max(0,prev.potions+small-s.potions),usedBig=Math.max(0,prev.bigPotions+big-s.bigPotions);row.potionsUsed+=used;row.bigPotionsUsed+=usedBig;if(row.bossStart!==undefined&&prev.time>=row.bossStart&&(row.bossEnd===undefined||prev.time<=row.bossEnd))row.bossPotionsUsed+=used+usedBig;
  }
  this.previous=s;
 }
}
