import {CampaignMetrics,type StageMetrics}from './CampaignMetrics';
import type {BotControls,FullState}from '../src/debug/BotApi';
export type CampaignRecord={cleared:boolean;steps:number;deaths:{stageIndex:number;position:FullState['position'];events:FullState['events'];stageTime:number;checkpoint:FullState['checkpoint']}[];damage:{stageIndex:number;amount:number;hp:number;position:FullState['position'];time:number}[];stages:number[];summaries:StageMetrics[];final:FullState};
/** External-agent example: only the public bot controls, no teleports, edits, forced kills or skips. */
export async function runCampaign(api:BotControls,options:{maxSteps?:number;maxDeaths?:number;mode?:'mouse'|'touch';difficulty?:0|1|2;onProgress?:(state:FullState)=>void|Promise<void>}={}):Promise<CampaignRecord>{
 api.setTimeScale(0);api.setInputMode(options.mode??'mouse');await api.start(options.difficulty??0);
 let stage=-1,index=0,steps=0,failures=0;
 const metrics=new CampaignMetrics(),record:CampaignRecord={cleared:false,steps:0,deaths:[],damage:metrics.damage,stages:[],summaries:metrics.rows,final:api.getState()};
 const collect=()=>{const s=api.getState();metrics.observe(s);return s;};
 let side=1,preparation=0;const skippedLoot=new Set<string>();
 for(;steps<(options.maxSteps??12000);steps++){
  let s=collect();if(s.stageIndex!==stage){stage=s.stageIndex;index=0;failures=0;record.stages.push(stage);}
  if(s.state==='clear'){record.cleared=true;break;}
  if(s.state==='card'){api.dismissCard();continue;}
  if(s.state==='over'){record.deaths.push({stageIndex:stage,position:s.position,events:s.events,stageTime:s.stageTime,checkpoint:s.checkpoint});if(record.deaths.length>(options.maxDeaths??3)||record.deaths.filter(d=>d.stageIndex===stage).length>=3)break;await api.restartWhenReady();index=0;preparation=0;skippedLoot.clear();continue;}
  if(s.state==='paused'){api.resume();continue;}
  if(s.state==='ending'){await api.step(1);continue;}
  if(s.state!=='playing')break;
  if(s.train){await api.playRail({maxSeconds:120});collect();continue;}
  const points=s.goals.waypoints,waypoint=points[Math.min(index,points.length-1)].position;
  const boss=s.enemies.find(e=>e.kind==='KING PUNI'&&e.maxHp>1),bossPoint=!!boss&&Math.hypot(waypoint.x-boss.home.x,waypoint.z-boss.home.z)<1;
  if(Math.hypot(s.position.x-waypoint.x,s.position.z-waypoint.z)<1.15){
   const sw=s.goals.switches.find(v=>Math.hypot(v.position.x-waypoint.x,v.position.z-waypoint.z)<1.1);
   if(sw&&(sw.kind==='core'&&!s.gate||sw.door>=0&&!s.goals.doors.find(d=>d.id===sw.door)?.open)){api.interact();await api.step(.05);s=collect();}
   if(!bossPoint&&index<points.length-1)index++;
  }
  if(options.difficulty===2&&s.stageIndex===1&&index>=3&&preparation<4){
   const destinations=[[46,46],[46,54],[66,50],[86,54]];
   const [x,z]=destinations[preparation],walk=await api.walkTo(x,z,{maxSeconds:20,radius:.8,autoFight:true,healBelow:70});
   collect();if(walk.arrived){const now=api.getState();if(preparation===0||preparation===2&&!now.goals.doors.find(d=>d.id===3)?.open||preparation===3&&!now.goals.chest.open){api.interact();await api.step(.1);if(api.getState().card)api.dismissCard();await api.step(.1);}preparation++;}
   else if(walk.reason==='unreachable')preparation++;
   continue;
  }
  if(options.difficulty===2&&s.stageIndex===2&&!s.gate){
   const need=(kind:string)=>kind==='POTION'||kind==='BIG POTION'?s.potions+s.bigPotions<3:kind==='ARMOR CELL'?s.inventory.armor<40:kind==='AMMO CELL'?s.energy<70:false;
   const supplies=s.goals.items.filter(i=>!i.taken&&i.visible&&!skippedLoot.has(`${s.stageIndex}/${i.id}`)&&need(i.kind)&&Math.abs(i.position.y-1.3-(s.position.y-1.65))<.8&&Math.hypot(i.position.x-s.position.x,i.position.z-s.position.z)<18&&api.routeTo(i.position.x,i.position.z)).sort((a,b)=>Math.hypot(a.position.x-s.position.x,a.position.z-s.position.z)-Math.hypot(b.position.x-s.position.x,b.position.z-s.position.z));
   if(supplies[0]){const target=supplies[0],foe=s.enemies.find(e=>e.lineOfSight&&!e.dormant&&e.distance<18);if(foe){api.lookAtEnemy(foe.id);api.fireAtEnemy(foe.id);}const walk=await api.walkTo(target.position.x,target.position.z,{maxSeconds:1,radius:.8,autoFight:false,healBelow:70});const after=api.getState();if(walk.reason==='unreachable'||walk.reason==='blocked'||walk.arrived&&!after.goals.items.find(i=>i.id===target.id)?.taken)skippedLoot.add(`${s.stageIndex}/${target.id}`);continue;}
  }
  const foe=s.enemies.filter(e=>!e.dormant&&e.lineOfSight&&e.visible&&(e.kind!=='KING PUNI'||s.gate)).sort((a,b)=>a.distance-b.distance)[0];
  const activeBoss=s.enemies.find(e=>e.kind==='KING PUNI'&&e.maxHp>1&&s.gate);
  if(activeBoss&&s.stageIndex===2&&s.position.y>12&&s.position.z>=28.5){await api.walkTo(90,26,{maxSeconds:1.2,radius:.5,autoFight:false,healBelow:70});continue;}
  if(activeBoss&&activeBoss.lineOfSight){
   const target=foe&&foe.kind!=='KING PUNI'&&foe.distance<6?foe:activeBoss;
   if(s.hp<70&&(s.potions+s.bigPotions)>0)api.heal();if(s.poisonUntil>s.time&&s.antidotes>0)api.antidote();
   api.lookAtEnemy(target.id);api.fireAtEnemy(target.id);
   const dx=target.position.x-s.position.x,dz=target.position.z-s.position.z,d=Math.max(.01,Math.hypot(dx,dz));
   const destination=(sign:number)=>({x:s.position.x-dz/d*sign*1.3,z:s.position.z+dx/d*sign*1.3});
   const supported=(p:{x:number;z:number})=>{const next=api.routeTo(p.x,p.z);return !!next&&Math.hypot(next.x-p.x,next.z-p.z)<.8;};
   if(!supported(destination(side)))side*=-1;
   api.setKeys(supported(destination(side))?[side>0?'KeyD':'KeyA']:[]);await api.step(.1);continue;
  }
  if(activeBoss&&!activeBoss.visible){api.setKeys([]);await api.step(.1);continue;}
  const onGallery=s.stageIndex===2&&s.position.y>=5&&s.position.y<12;
  const castleTravel=s.stageIndex===2&&!s.gate&&!s.bossClear;
  if(castleTravel){if(s.hp<70&&(s.potions+s.bigPotions)>0)api.heal();if(s.poisonUntil>s.time&&s.antidotes>0)api.antidote();if(foe){api.lookAtEnemy(foe.id);api.fireAtEnemy(foe.id);}}
  else if(foe&&foe.distance<18){if(onGallery){api.setKeys([]);api.lookAtEnemy(foe.id);api.fireAtEnemy(foe.id);await api.step(.15);}else{await api.fight({maxSeconds:.75,range:18,healBelow:70,approach:false});api.setKeys([]);await api.step(.15);}s=collect();if(s.state!=='playing')continue;}
  let target=points[Math.min(index,points.length-1)].position;
  const battery=s.goals.items.find(i=>i.kind==='BATTERY'&&!i.taken);
  if(s.bossClear&&!s.battery&&battery)target=battery.position;
  if(s.bossClear&&s.stageFragment&&s.battery){target=s.goals.exit.position;if(Math.hypot(s.position.x-target.x,s.position.z-target.z)<2.5){api.interact();await api.step(.05);continue;}}
  const walk=await api.walkTo(target.x,target.z,{maxSeconds:2,radius:.8,autoFight:!onGallery&&!castleTravel,healBelow:70});s=collect();
  if(walk.reason==='unreachable'||walk.reason==='blocked'){
   api.setKeys([]);await api.step(.25);s=collect();
   const candidates=s.goals.switches.filter(v=>v.door>=0&&v.kind!=='samurai'&&!s.goals.doors.find(d=>d.id===v.door)?.open&&api.routeTo(v.position.x,v.position.z)).sort((a,b)=>Math.hypot(a.position.x-s.position.x,a.position.z-s.position.z)-Math.hypot(b.position.x-s.position.x,b.position.z-s.position.z));
   const sw=candidates[0];if(sw){const r=await api.walkTo(sw.position.x,sw.position.z,{maxSeconds:30,radius:.8,autoFight:true,healBelow:70});if(r.arrived){api.interact();await api.step(.05);}else failures++;}else failures++;
  }else failures=0;
  if(failures>8)break;
  if(steps%10===0){await options.onProgress?.(collect());await new Promise(r=>setTimeout(r,0));}
 }
 api.setKeys([]);record.steps=steps;record.final=collect();return record;
}
export function installCampaignBot(){const api=window.__toybox;if(!api)return;const button=document.createElement('button');button.id='campaign-run';button.textContent='じどうで あそぶ';button.disabled=api.getState().state!=='title';button.onclick=()=>{button.disabled=true;void runCampaign(api,{onProgress:s=>{button.textContent=`${s.stageIndex+1} · ${Math.ceil(s.hp)}`;}}).then(r=>button.textContent=r.cleared?'できた！':'ここまで');};document.body.append(button);}
