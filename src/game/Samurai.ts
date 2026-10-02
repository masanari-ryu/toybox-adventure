import * as T from 'three';
import type {Game} from './Game';
import {doors} from '../world/Threats';
export function confirmSamurai(g:Game){if(doors[5]?.open){g.notify('さむらいの へやだ！');return;}
 g.card.show('ほんとうに この とびらを あける？','⚠ このさきに とても つよい さむらい！\nたおすと さいきょうの カタナが てにはいる。\nむりに はいらなくても さきへ すすめるよ。','⚔️',()=>{doors[5].open=true;const e=g.enemies.find(e=>e.kind==='SAMURAI');if(e){e.brain.hit(g.position.x,g.position.z,g.time);e.alert=true;e.brain.surprisedUntil=g.time;e.cooldown=0;}g.resume();g.notify('さむらいが めを さました！');});
 const close=document.getElementById('card-close')!;close.textContent='あける';const cancel=document.createElement('button');cancel.id='samurai-cancel';cancel.textContent='まだ あけない';cancel.onclick=()=>{g.card.after=null;g.card.close();};close.after(cancel);
}
export function warningSign(parent:T.Group){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#223a51';c.fillRect(0,0,512,256);c.strokeStyle='#ffd278';c.lineWidth=16;c.strokeRect(8,8,496,240);c.fillStyle='#ffe5a4';c.textAlign='center';c.font='bold 42px sans-serif';c.fillText('⚠ さむらいの へや',256,85);c.font='30px sans-serif';c.fillText('とても つよい！',256,150);c.fillText('カタナを まもっている',256,204);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(3,1.5),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));sign.position.set(26,2.6,28.05);parent.add(sign);}
