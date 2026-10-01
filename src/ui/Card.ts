import {itemInfo,names} from './Text';
export class Card {
 seen=new Set<string>();after:(()=>void)|null=null;open=false;
 constructor(public paused:()=>void,public resume:()=>void){document.getElementById('card-close')!.onclick=()=>this.close();}
 show(title:string,description:string,icon='⭐',after?:()=>void){document.getElementById('samurai-cancel')?.remove();document.getElementById('card-close')!.textContent='つづける';this.paused();this.open=true;this.after=after??null;document.getElementById('card-title')!.textContent=title;document.getElementById('card-description')!.textContent=description;document.getElementById('card-icon')!.textContent=icon;document.getElementById('card')!.hidden=false;}
 item(kind:string,touch:boolean){if(this.seen.has(kind))return false;this.seen.add(kind);const info=itemInfo[kind]??{icon:'✨',effect:'ぶきが もっと つよく なったよ',use:'ぶきの えで きりかえよう'};let use=info.use;if(kind.includes('POTION')||kind==='ANTIDOTE')use+='\n'+(touch?'えを タップして えらび「つかう」を おそう':'マウスで えを えらんで「つかう」を おそう');this.show(`${names[kind]??'アイテム'}を みつけた！`,`${info.effect}\n${use}`,info.icon);return true;}
 close(){document.getElementById('samurai-cancel')?.remove();document.getElementById('card-close')!.textContent='つづける';document.getElementById('card')!.hidden=true;this.open=false;const a=this.after;this.after=null;if(a)a();else this.resume();}
}
