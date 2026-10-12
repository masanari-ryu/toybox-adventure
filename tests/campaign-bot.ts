import type {BotControls,FullState}from '../src/debug/BotApi';
export type CampaignRecord={cleared:boolean;steps:number;deaths:{stageIndex:number;position:FullState['position'];events:FullState['events']}[];damage:{stageIndex:number;amount:number;hp:number;position:FullState['position'];time:number}[];stages:number[];summaries:{stageIndex:number;seconds:number;hpLost:number}[];final:FullState};
/** External-agent example: only the public bot controls, no teleports, edits, forced kills or skips. */
export async function runCampaign(api:BotControls,options:{maxSteps?:number;maxDeaths?:number;mode?:'mouse'|'touch';onProgress?:(state:FullState)=>void|Promise<void>}={}):Promise<CampaignRecord>{
 api.setTimeScale(0);api.setInputMode(options.mode??'mouse');await api.start(0);
 let stage=-1,index=0,steps=0,failures=0;
 const record:CampaignRecord={cleared:false,steps:0,deaths:[],damage:[],stages:[],summaries:[],final:api.getState()},seen=new Set<string>();
 const collect=()=>{const s=api.getState();for(const e of s.events){const id=`${e.time}/${e.type}/${e.position.x}/${e.position.z}/${e.amount??''}`;if(e.type==='damage'&&!seen.has(id)){seen.add(id);record.damage.push({stageIndex:e.stageIndex,amount:e.amount as number,hp:e.hp as number,position:e.position,time:e.time});}}return s;};
 const count=(r:{elapsed:number;hpLost:number})=>{const summary=record.summaries.find(v=>v.stageIndex===stage);if(summary){summary.seconds+=r.elapsed;summary.hpLost+=r.hpLost;}};
 for(;steps<(options.maxSteps??12000);steps++){
  let s=collect();if(s.stageIndex!==stage){stage=s.stageIndex;index=0;failures=0;record.stages.push(stage);record.summaries.push({stageIndex:stage,seconds:0,hpLost:0});}
  if(s.state==='clear'){record.cleared=true;break;}
  if(s.state==='card'){api.dismissCard();continue;}
  if(s.state==='over'){record.deaths.push({stageIndex:stage,position:s.position,events:s.events});if(record.deaths.length>(options.maxDeaths??3))break;await api.restartWhenReady();index=0;continue;}
  if(s.state==='paused'){api.resume();continue;}
  if(s.state==='ending'){await api.step(1);continue;}
  if(s.state!=='playing')break;
  if(s.train){count(await api.playRail({maxSeconds:120}));collect();continue;}
  const points=s.goals.waypoints,waypoint=points[Math.min(index,points.length-1)].position;
  const boss=s.enemies.find(e=>e.kind==='KING PUNI'&&e.maxHp>1),bossPoint=!!boss&&Math.hypot(waypoint.x-boss.home.x,waypoint.z-boss.home.z)<1;
  if(Math.hypot(s.position.x-waypoint.x,s.position.z-waypoint.z)<1.15){
   const sw=s.goals.switches.find(v=>Math.hypot(v.position.x-waypoint.x,v.position.z-waypoint.z)<1.1);
   if(sw&&(sw.kind==='core'&&!s.gate||sw.door>=0&&!s.goals.doors.find(d=>d.id===sw.door)?.open)){api.interact();await api.step(.05);s=collect();}
   if(!bossPoint&&index<points.length-1)index++;
  }
  const foe=s.enemies.filter(e=>!e.dormant&&e.lineOfSight&&e.visible&&(e.kind!=='KING PUNI'||s.gate)).sort((a,b)=>a.distance-b.distance)[0];
  if(foe&&foe.distance<18){count(await api.fight({maxSeconds:2,range:18,healBelow:70,approach:true}));s=collect();if(s.state!=='playing')continue;}
  let target=points[Math.min(index,points.length-1)].position;
  const battery=s.goals.items.find(i=>i.kind==='BATTERY'&&!i.taken);
  if(s.bossClear&&!s.battery&&battery)target=battery.position;
  if(s.bossClear&&s.stageFragment&&s.battery){target=s.goals.exit.position;if(Math.hypot(s.position.x-target.x,s.position.z-target.z)<2.5){api.interact();await api.step(.05);continue;}}
  const walk=await api.walkTo(target.x,target.z,{maxSeconds:2,radius:.8,autoFight:true,healBelow:70});count(walk);s=collect();
  if(walk.reason==='unreachable'||walk.reason==='blocked'){
   const candidates=s.goals.switches.filter(v=>v.door>=0&&v.kind!=='samurai'&&!s.goals.doors.find(d=>d.id===v.door)?.open&&api.routeTo(v.position.x,v.position.z)).sort((a,b)=>Math.hypot(a.position.x-s.position.x,a.position.z-s.position.z)-Math.hypot(b.position.x-s.position.x,b.position.z-s.position.z));
   const sw=candidates[0];if(sw){const r=await api.walkTo(sw.position.x,sw.position.z,{maxSeconds:30,radius:.8,autoFight:true,healBelow:70});count(r);if(r.arrived){api.interact();await api.step(.05);}else failures++;}else failures++;
  }else failures=0;
  if(failures>8)break;
  if(steps%10===0){await options.onProgress?.(collect());await new Promise(r=>setTimeout(r,0));}
 }
 api.setKeys([]);record.steps=steps;record.final=collect();return record;
}
export function installCampaignBot(){const api=window.__toybox;if(!api)return;const button=document.createElement('button');button.id='campaign-run';button.textContent='じどうで あそぶ';button.disabled=api.getState().state!=='title';button.onclick=()=>{button.disabled=true;void runCampaign(api,{onProgress:s=>{button.textContent=`${s.stageIndex+1} · ${Math.ceil(s.hp)}`;}}).then(r=>button.textContent=r.cleared?'できた！':'ここまで');};document.body.append(button);}
