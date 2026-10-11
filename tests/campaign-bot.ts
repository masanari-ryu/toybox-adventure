import type {BotControls}from '../src/debug/BotApi';
type State=ReturnType<BotControls['getState']>;
export type CampaignRecord={cleared:boolean;steps:number;deaths:{stageIndex:number;position:State['position'];events:State['events']}[];damage:{stageIndex:number;amount:number;hp:number;position:State['position'];time:number}[];stages:number[];final:State};
/** Uses the opt-in API only: no teleports, HP edits, forced kills or stage skipping. */
export async function runCampaign(api:BotControls,options:{maxSteps?:number;maxDeaths?:number;mode?:'mouse'|'touch';onProgress?:(state:State)=>void|Promise<void>}={}):Promise<CampaignRecord>{
 api.setTimeScale(0);api.setInputMode(options.mode??'mouse');await api.start(0);let stage=-1,index=0,steps=0,side=1,lastMove={x:0,z:0},stuck=0;
 const record:CampaignRecord={cleared:false,steps:0,deaths:[],damage:[],stages:[],final:api.getState()};
 for(;steps<(options.maxSteps??18000);steps++){
  let s=api.getState();if(s.stageIndex!==stage){stage=s.stageIndex;index=0;stuck=0;record.stages.push(stage);}
  // Events are a bounded ring; deduplicate by simulated time, type and position.
  const signature=(e:State['events'][number])=>`${e.time}/${e.type}/${e.position.x}/${e.position.z}/${e.amount??''}`;
  for(const e of s.events)if(e.type==='damage'&&!record.damage.some(d=>`${d.time}/damage/${d.position.x}/${d.position.z}/${d.amount}`===signature(e)))record.damage.push({stageIndex:e.stageIndex,amount:e.amount as number,hp:e.hp as number,position:e.position,time:e.time});
  if(s.state==='clear'){record.cleared=true;break;}
  if(s.state==='card'){api.dismissCard();continue;}
  if(s.state==='over'){record.deaths.push({stageIndex:s.stageIndex,position:s.position,events:s.events});if(record.deaths.length>(options.maxDeaths??4))break;await api.restart();index=0;continue;}
  if(s.state==='paused'){api.resume();continue;}
  if(s.state==='ending'){await api.step(1);continue;}
  if(s.state!=='playing')break;
  if(s.hp<70&&(s.potions+s.bigPotions)>0)api.heal();if(s.poisonUntil>s.time&&s.antidotes>0)api.antidote();
  if(s.train){const target=s.train.targets.filter(t=>t.screen.onScreen&&t.distance<90).sort((a,b)=>a.distance-b.distance)[0];if(target)api.fireAt(target.screen.x,target.screen.y);await api.step(.18);continue;}
  const points=s.goals.waypoints,point=points[Math.min(index,points.length-1)].position;
  const boss=s.enemies.find(e=>e.kind==='KING PUNI'&&e.maxHp>1);
  const distance=Math.hypot(s.position.x-point.x,s.position.z-point.z),bossPoint=!!boss&&Math.hypot(point.x-boss.home.x,point.z-boss.home.z)<1;
  if(distance<1.15){const sw=s.goals.switches.find(v=>Math.hypot(v.position.x-point.x,v.position.z-point.z)<1.1);if(sw&&(sw.kind==='core'&&!s.gate||sw.door>=0&&!s.goals.doors.find(d=>d.id===sw.door)?.open))api.interact();if(!bossPoint&&index<points.length-1)index++;}
  let target=s.goals.waypoints[Math.min(index,points.length-1)].position;
  // Recover the battery where the boss actually fell, rather than assuming its home position.
  const battery=s.goals.items.find(i=>i.kind==='BATTERY'&&!i.taken);if(s.bossClear&&!s.battery&&battery)target=battery.position;
  if(s.bossClear&&s.stageFragment&&s.battery){target=s.goals.exit.position;if(Math.hypot(s.position.x-target.x,s.position.z-target.z)<2.5)api.interact();}
  const foe=s.enemies.filter(e=>!e.dormant&&e.visible&&e.lineOfSight&&Math.abs(e.position.y-(s.position.y-1.65))<3.5&&(e.kind!=='KING PUNI'||s.gate)).sort((a,b)=>a.distance-b.distance)[0];
  let planned=api.routeTo(target.x,target.z);
  if(!planned){const recovery=s.goals.switches.filter(v=>v.door>=0&&!s.goals.doors.find(d=>d.id===v.door)?.open&&v.kind!=='samurai').map(v=>({v,path:api.routeTo(v.position.x,v.position.z)})).filter(v=>v.path).sort((a,b)=>Math.hypot(a.v.position.x-s.position.x,a.v.position.z-s.position.z)-Math.hypot(b.v.position.x-s.position.x,b.v.position.z-s.position.z))[0];if(recovery){target=recovery.v.position;planned=recovery.path;if(Math.hypot(target.x-s.position.x,target.z-s.position.z)<2.5)api.interact();}}
  let next=planned??target;
  if(foe&&foe.distance<18){
   api.lookAt(foe.position.x,foe.position.z);api.fireAtEnemy(foe.id);
   if(api.getState().enemies.some(e=>e.id===foe.id)&&(foe.distance<6||(foe.kind==='KING PUNI'&&foe.attack.state==='Windup'))){
    const awayX=s.position.x-foe.position.x,awayZ=s.position.z-foe.position.z,d=Math.max(.1,Math.hypot(awayX,awayZ));
    const escape={x:s.position.x+awayZ/d*side*4+awayX/d*2,z:s.position.z-awayX/d*side*4+awayZ/d*2};next=api.routeTo(escape.x,escape.z)??next;
   }
  }else api.lookAt(next.x,next.z);
  api.lookAt(next.x,next.z);api.setKeys(Math.hypot(next.x-s.position.x,next.z-s.position.z)>.1?['KeyW']:[]);
  await api.step(.1);
  const after=api.getState();if(Math.hypot(after.position.x-lastMove.x,after.position.z-lastMove.z)<.03)stuck++;else stuck=0;lastMove=after.position;
  if(stuck>12){side*=-1;api.setKeys(after.position.y>5?['KeyS']:[side>0?'KeyD':'KeyA']);await api.step(.25);stuck=0;}
  if(steps%100===0){await options.onProgress?.(after);await new Promise(r=>setTimeout(r,0));}
 }
 api.setKeys([]);record.steps=steps;record.final=api.getState();return record;
}
export function installCampaignBot(){const api=window.__toybox;if(!api)return;const button=document.createElement('button');button.id='campaign-run';button.textContent='じどうで あそぶ';button.disabled=api.getState().state!=='title';button.onclick=()=>{button.disabled=true;void runCampaign(api,{onProgress:s=>{button.textContent=`${s.stageIndex+1} · ${Math.ceil(s.hp)}`;}}).then(r=>button.textContent=r.cleared?'できた！':'ここまで');};document.body.append(button);}
