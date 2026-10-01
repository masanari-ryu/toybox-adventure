export const names:Record<string,string>={BATTERY:'でんち',INFANTRY:'プラへい',KATANA:'カタナ',SAMURAI:'さむらい',KEY:'ほしのかけら',PUNI:'プニ',BOTTY:'ボッティ',BALLOONER:'フワリン','TOX MUNCHER':'ドクモグ','LAVA HOPPER':'マグマピョン','KING PUNI':'おおきな プニ',POTION:'ポーション','BIG POTION':'おおきな ポーション',ANTIDOTE:'どくけし','LAVA CHARM':'ほのおよけ','ARMOR CELL':'まもりのたま',SHIELD:'まもりのたま',CANDY:'キャンディ',RAINBOW:'にじのたま',HEART:'ポーション',STAR:'ほしのたま','MEGA STAR':'にじのたま','TOX FILTER':'どくよけ','AMMO CELL':'ひかりのたま','BUBBLE MODULE':'あわバスター','STAR MODULE':'ほしバスター','POP UPGRADE':'ポップバスター 2','BUBBLE UPGRADE':'あわバスター 2','NOVA UPGRADE':'にじバスター'};
export const itemInfo:Record<string,{icon:string,effect:string,use:string}>={
 BATTERY:{icon:'🔋',effect:'れっしゃを うごかす でんちだよ',use:'ほしを ひろって れっしゃへ。ちかくで「でんちを セット」を おそう'},
 KATANA:{icon:'⚔️',effect:'ちかくの てきを まとめて なぎはらう！',use:'タップか クリックで きる。とおくへは とどかないよ'},
 KEY:{icon:'⭐',effect:'にじのほしの かけらだよ',use:'みっつ そろうと にじのほしに なるよ'},
 POTION:{icon:'🧴',effect:'たいりょくを かいふくするよ',use:'たいりょくが へったら つかおう'},
 'BIG POTION':{icon:'🧴',effect:'たいりょくを たくさん かいふくするよ',use:'たいりょくが へったら つかおう'},
 ANTIDOTE:{icon:'🌿',effect:'どくを なおせるよ',use:'どくになったら つかってみよう'},
 'LAVA CHARM':{icon:'🔥',effect:'しばらく ようがんの だめーじが へるよ',use:'ひろうと すぐに きくよ'},
 'ARMOR CELL':{icon:'🔵',effect:'こうげきの だめーじを へらすよ',use:'ひろうと すぐに まもってくれるよ'},
 CANDY:{icon:'🍬',effect:'しばらく はやく はしれるよ',use:'ひろうと すぐに きくよ'},
 RAINBOW:{icon:'🌈',effect:'しばらく こうげきが つよくなるよ',use:'ひろうと すぐに きくよ'},
 'BUBBLE MODULE':{icon:'🫧',effect:'あわが はじけて まわりの てきを たおすよ',use:'ぶきの えを おすと きりかえられるよ'},
 'STAR MODULE':{icon:'🌟',effect:'おおきな てきにも つよい ほしを うつよ',use:'ぶきの えを おすと きりかえられるよ'},
};
export function visibleTextValid(s:string){return !/[A-Za-z\p{Script=Han}]/u.test(s);}
