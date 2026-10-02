# おもちゃばこ だいぼうけん

古いおもちゃ箱から、壊れた「にじのほし」を直す冒険へ。朝・昼・夕方から夜へ変わる3つの世界で、3つのかけらを集め、巨大になったプニを止めて元の部屋へ帰ります。Webブラウザで動くオリジナル3D探索FPSです。

## 起動

Node.js 22以上推奨。

```sh
npm install
npm run dev
```

公開用ビルド：

```sh
npm run build
```

`dist/` を静的ホスティングへ配置できます。相対パス対応。スマートフォンでは同じWi-Fiの開発サーバーNetwork URL、またはHTTPSの公開URLを使います。localhostは開発しているパソコン自身を指します。

## 3ステージ

1. **あさの おもちゃひろば**：木のおもちゃ、草、巨大ロケット、風船。小さく遅い敵で移動・射撃・回復・扉の操作を覚えながら探索。基本武器と1つ目のかけら。
2. **ひるの おかしこうじょう**：アイシングの壁、ウエハース床、キャンディー、製造機、パイプ、コンベア。部屋と脇道が増え、装甲ロボットや毒攻撃が登場。あわバスター、どくけし、毒の停止装置、2つ目のかけら。
3. **よるの ほしぞらじょう**：夕焼けから月と星の夜空へ。溶岩、時限足場、耐火アイテム、ほしバスターと強化武器。コアのスイッチでボスゲートを開け、巨大なプニを倒して奥の部屋で3つ目のかけらを取得します。

各面は一本の主ルートに、すぐ終わる短い脇道を組み合わせたダンジョンです。1面19×13、2面25×17、3面29×22のグリッドで、実際に探索できる面積も順に増えます。各面の最後にプニ系のボスが待ち、倒すと奥の報酬部屋が開きます。そこでかけらとボスが落とした電池を取得し、出口の電車に電池をセットします。1面から2面は青空の屋外レール、2面から3面は星空のコースを自動走行するミニシューティングです。駅に生きて到着するとクリアし、次のステージに進みます。3面の帰還便は虹のレールを走ってエンディングへ続きます。電車区間で死亡した場合、その区間から再挑戦できます。複数の部屋、開閉扉、スイッチ、任意のアイテム探索があります。序盤の敵は少なく、攻撃間隔が長め。再挑戦時には攻撃頻度や照準補助を調整します。

## 操作

PC：WASDで移動、マウスで視点、左クリック長押しで射撃、Shiftでダッシュ、Eでスイッチ、Escで一時停止。1〜4で取得済み武器へ切替、Qで回復、Rで解毒。アイテムや武器の画面ボタンも使用できます。プレイヤー画面の説明はかな表記です。

スマートフォン・タブレット：横画面。画面左側のスワイプで移動（上＝前進、下＝後退、左右＝カニ歩き）。画面右側のスワイプで上下左右の視点変更。射撃は左右を問わず全画面のタップした場所へ向かいます。左指で移動を保持したまま、右指で旋回とタップ射撃が可能です。指の役割は最初に触れた側で固定し、中央をまたいでも切り替えません。中央の照準は表示しません。アイテムの絵で選び「つかう」、武器の絵で切替、スイッチ付近の「おす」で操作。移動・射撃の操作パネルはありません。

縦向きでは案内を表示して停止、横向きで自動復帰。背景移動時に一時停止。Safe Area、スクロール・長押し抑制、タブレット用ボタンサイズに対応します。

## 敵・武器・アイテム

プニ、ボッティ、フワリン、ドクモグ、マグマピョン、おおきなプニ。ジェリーのコア、ロボットの装甲、風船の翼、毒の棘、溶岩の脚など、形・動き・攻撃を分けています。後半は大型化して装甲や発光部品が増えます。

同じ部屋でプレイヤーを正面側に捉えると、距離があっても接近します。背を向けた待機中の敵は入室だけでは反応せず、壁・閉じた扉・機械の陰は見通せません。被弾時は未発見でも即座に警戒し、攻撃者の位置を記憶して追跡・探索・反撃。壁や機械の衝突と視線を考慮して経路を探します。1面ボスは単発弾とジャンプ、2面ボスは扇状弾・衝撃波・少数召喚、3面ボスは大型化して複数攻撃を使います。

ポップバスター → あわバスター → ほしバスター。探索で各武器の強化を取得。最初から全武器は使えません。外見、発射音、範囲、威力、貫通が変化します。

ポーション、おおきなポーション、どくけしは保持して使います。ほのおよけ、まもりのたま、キャンディ、にじのたまは取得時に効果を発揮。新しいアイテムと武器は一時停止して実際の3Dモデル・効果・使い方を表示。毒は沼から離れても短時間残り、溶岩は継続ダメージ。落下は安全地点へ戻します。

## ちず・グラフィック

Canvas 2Dの探索マップ。プレイヤーから見える周囲のセルだけを記録し、壁と閉じた扉の向こうは開示しません。発見済みの部屋、通路、扉、スイッチ、重要アイテム、かけら、ボスゲートを表示。タップ拡大中は操作を止め、次ステージで探索記録をリセットします。

オリジナル画像テクスチャとCanvasテクスチャ、凹凸、粗さ、発光、木目、アイシング、ウエハース、金属、毒、溶岩、敵の皮膚。空のグラデーション、雲、太陽、月、星、流れ星、遠景塔、巨大なおもちゃ、霧、粒子で世界の奥行きを作っています。夕方から夜は空・照明・霧・星・月が連動して変化します。ブラウザ向けのスタイライズ表現であり、商用大規模ゲームと同等の画質を保証するものではありません。

## 音楽

タイトル112 BPM・68.6秒、朝122 BPM・63秒、昼126 BPM・61秒、城120 BPM・64秒、ボス132 BPM・58.2秒。各32小節、イントロ・主題・別展開・変奏・ブレイク・再現からなるオリジナル楽曲。ドラム、ベース、4音和音、主旋律、アルペジオ、フィルとFXを分離。戦闘の密度に応じてリズムやシンセを追加し、小節境界で曲を切替。ボス撃破では約8秒のファンファーレ。音量ランプ、リバーブ、ディレイ、ステレオ、コンプレッサー、SE時のBGMダッキングを使用します。

## 技術・検証

TypeScript / Vite / Three.js / Web Audio API / Vitest / Playwright。入力、AI、ステージ、戦闘、進行、マップ、UI、背景、音楽を分離。床壁のインスタンシング、モデル部品の結合、粒子上限、ステージ破棄、DPR上限、自動描画軽量化を使用します。音楽は開始時に再生。画質は端末と実際の動作状況から自動調整し、プレイヤーに設定を選ばせません。

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

開発専用 `/tests-runner.html` は70項目の実WebGL検証、各画面の確認、通常入力による通しプレイ用。`/music-review.html` は長時間音楽再生と全曲レンダリング用。開発用ページはProduction Buildに含みません。

実行結果・未検証範囲は `TEST-RESULTS.md`、素材の制作記録は `ASSETS.md`、最新のダンジョン画面記録は `screenshots/dungeon/`、従来の画面記録は `screenshots/v3/` を参照してください。

### 最新の調整

1面の敵を入口側1体・次の広場2体・奥3体へ段階配置。2面・3面は機械の陰と壁際の遭遇を増やしています。アイテムのラベル・包み紙、敵の外装・模様と部品の質感を追加。2面のメロディを調に合わせて書き直し、ディレイのテンポ同期と残響量を調整しました。

### ダンジョン進行の改修

星の取得だけで進む構成から、スイッチで部屋を突破し、各面のボスを倒して奥の報酬部屋へ進む構成へ変更しました。1面の通常敵は6体で弱さを維持し、ボスも小型・単純な攻撃に限定。2面・3面は広さとボスの攻撃を段階的に増やしています。複雑な周回迷路は避け、分岐の先は短い行き止まりとアイテム置き場にしています。

全曲の旋律を強拍でコードトーンに合わせ、タイトル・ボスの和音と城の旋律の移調を修正。ディレイのテンポ変更は残響をフェードしてから固定値で行い、ピッチの揺れを防ぎます。

## 公開ページ

- 特設ページ：https://masanari-ryu.github.io/toybox-adventure/adventure/
- ゲーム：https://masanari-ryu.github.io/toybox-adventure/
- 説明書：特設ページの「あそびかた」
- 利用規約：特設ページの「りようきやく」

通常敵はステージ順に15・22・32体（各ステージのボスを除く）。通常敵の耐久度は維持しています。mainへのプッシュ後、GitHub Actionsがテスト・ビルド・GitHub Pages公開を実行します。

Optional stage-two samurai room: warning and cancel/accept before opening, 1100 HP champion, melee / spread / paralysis / radial attacks, katana reward (240 damage, 5.2m plus enemy radius, omnidirectional cleave, line-of-sight required). Normal enemy counts remain 15 / 22 / 32, excluding bosses and summons.

## 追加された戦闘とレール

通常敵は1面27体、2面42体、3面62体（各面のボス、2面のさむらい、召喚敵は別）。プラ製の歩兵「プラへい」は6体・10体・14体で、歩行して近づき、腕を構えてから殴ります。雑魚の耐久力は維持しています。ボスは入口を開くと起動。さむらいは通常斬り・方向を固定する突進・大振りの強打を使います。

レールでは移動が自動、タップまたはクリックで専用ブラスターを発射します。カタナや弾数に影響せず、ポーションを使用できます。コースは20秒・23秒・24秒。急な登り下り、カーブ、カメラの傾き、広い視野角、動く飛行敵で速度を表現します。描画はレールと枕木、浮島や雲をまとめ、電車区間では影を無効にします。終了するとダンジョンの描画設定と武器を復元します。

### Train-only play
Open `/?train=outdoor` for the daylight railway, or `/?train=space` for the planet and star railway. These routes bypass the dungeon, start only after a user gesture, and restart the same railway after arrival or a retry. Both are included in the production build. Scenery uses original painted canvas textures for sky, nebulae, planet bands, grass/flowers, and toy metal panels.

### Challenge selection
Title choices: Easy retains current balance; Normal uses 1.5× regular enemies and 1.3× all enemy HP; Hard 2× / 1.5×; Nightmare 2.5× / 2×. Fractional counts round up. Bosses and samurai remain unique. Reinforcements stay in their original rooms with a clear entrance, walls and doorways. Train targets also scale. Completing the Hard campaign unlocks Nightmare for the browser via localStorage; blocked storage retains the unlock for the current session. Restart preserves selected challenge. No campaign saves or offline play are provided.

The web manifest supplies standalone landscape launch and home-screen icons. Actual install availability and rotation depend on device/browser support. Landing page and manual explain adding to the home screen, the current combat/katana/train progression, difficulty multipliers and local unlock storage.
