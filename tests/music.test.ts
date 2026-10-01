import {it,expect} from 'vitest';import {scores,sectionAt} from '../src/audio/music/score';import {Synth} from '../src/audio/instruments/Synth';import {MusicManager} from '../src/audio/MusicManager';
it('has complete original arrangements lasting 45–90 seconds',()=>{for(const score of Object.values(scores)){const seconds=32*4*60/score.tempo;expect(seconds).toBeGreaterThanOrEqual(45);expect(seconds).toBeLessThanOrEqual(90);expect(score.progression.length).toBe(4);expect(score.progression.every(c=>c.length>=4)).toBe(true);expect(new Set(score.bass.filter(n=>n>=0)).size).toBeGreaterThan(2);}expect(new Set(Array.from({length:32},(_,n)=>sectionAt(n))).size).toBe(5);expect(scores.boss.tempo).toBeGreaterThan(scores.stage.tempo);});
it('schedules distinct instruments, fills and dynamic combat percussion',()=>{const calls:string[]=[];const fake={voice:(...a:unknown[])=>calls.push(String(a[3])),kick:()=>calls.push('kick'),noiseHit:(_t:number,k:string)=>calls.push(k),percussion:()=>calls.push('percussion')};const m=Object.create(MusicManager.prototype)as MusicManager;Object.assign(m,{synth:fake,theme:'stage',intensity:1,step:0});for(let s=0;s<512;s++){m.step=s;m.tick(s*.12);}for(const kind of ['bass','chord','lead','pluck','kick','snare','hat','clap','fx','percussion'])expect(calls).toContain(kind);expect(calls.filter(k=>k==='lead').length).toBeGreaterThan(100);});

it('keeps factory lead notes in its major key after variations',()=>{const major=new Set([0,2,4,5,7,9,11]);for(const bar of scores.factory.melody)for(const n of bar)if(n>=0)expect(major.has(n%12),`factory note ${n}`).toBe(true);});

it('keeps every theme diatonic and accented melody notes on its chord',()=>{
 const major=new Set([0,2,4,5,7,9,11]);
 for(const [name,score] of Object.entries(scores)){
  for(const chord of score.progression)for(const n of chord)expect(major.has(n%12),`${name} chord ${n}`).toBe(true);
  score.melody.forEach((bar,b)=>bar.forEach((note,s)=>{if(note<0)return;
   expect(major.has(note%12),`${name} melody ${note}`).toBe(true);
   if(s%4===0)expect(score.progression[b].some(n=>n%12===note%12),`${name} accent bar ${b} step ${s}`).toBe(true);
  }));
 }
});
it('changes the delay tap without gliding its pitch',()=>{
 const events:string[]=[];const param={cancelScheduledValues:()=>{},setTargetAtTime:()=>events.push('ramp'),setValueAtTime:()=>events.push('fixed')};
 const synth=Object.create(Synth.prototype) as Synth;
 Object.assign(synth,{delay:{delayTime:param},delayWet:{gain:param},delayFeedback:{gain:param},tempo:0});
 synth.setTiming(120,false,0);const count=events.length;synth.setTiming(120,false,2);
 expect(events.length).toBe(count);expect(events.filter(e=>e==='fixed')).toHaveLength(1);
});

it('gives each stage its own melody, bass, groove and arrangement',()=>{
 const a=scores.stage,b=scores.factory,c=scores.castle;
 expect(a.melody).not.toEqual(b.melody);expect(b.melody).not.toEqual(c.melody);expect(a.melody).not.toEqual(c.melody);
 expect(b.bass).not.toEqual(c.bass);expect(b.kicks).not.toEqual(c.kicks);expect(b.chordSteps).not.toEqual(c.chordSteps);expect(c.leadKind).toBe('pluck');
});

it('schedules only finite notes across every bar, theme and combat variation',()=>{
 for(const theme of Object.keys(scores)){for(const intensity of [0,1]){let notes=0;const synth={setTiming:()=>{},kick:()=>{},noiseHit:()=>{},percussion:()=>{},voice:(note:number,time:number,duration:number,kind:string,volume:number,pan=0)=>{for(const value of [note,time,duration,volume,pan])expect(Number.isFinite(value),`${theme} ${kind} ${value}`).toBe(true);expect(duration).toBeGreaterThan(0);notes++;}};const manager=Object.create(MusicManager.prototype) as MusicManager;Object.assign(manager,{theme,intensity,synth,step:0});for(let step=0;step<512;step++){manager.step=step;manager.tick(step*.12);}expect(notes).toBeGreaterThan(400);}}
});
