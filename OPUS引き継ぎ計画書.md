# Opus 引き継ぎ計画書 — 東京駅バーチャル案内 v3.1 修正タスク

作成日: 2026-07-17（Fable 5 によるレビュー結果に基づく）
対象ブランチ: `claude/review-request-9b47a5`（worktree: `.claude/worktrees/review-request-9b47a5`）

---

## 実施結果（2026-07-17 完了）

**全 10 項目 実装済み・G1〜G3 と C1〜C10 を両ビューポートで全件 PASS。**

実施ブランチは `claude/opus-handover-plan-97e788`（worktree: `.claude/worktrees/opus-plan-document-e5425d`）。
`claude/review-request-9b47a5` と main のコード差分は `.vercelignore` 1 行と `実装計画v3.md` のみで
virtual-tour.html・scenes.js・photos/ は同一だったため、main 先端から作業した。

| 項目 | 状態 | 備考 |
|------|------|------|
| A1 誤字 | 完了 | scenes.js → sync |
| A2 verify_photos | 完了 | utf-8 化 + MASK 非存在時スキップ |
| A3 showPhoto 競合 | 完了 | `photoGen` 世代カウンタ。連打20試行で不一致0 |
| A4 片方向リンク | 完了 | b1_ginsuzu → chika_escalator (up) |
| A5 .vercelignore | 完了 | face_review.html 行削除・本計画書を追加 |
| B1 方角制限 | 完了 | PHOTOS マニフェストを sync_scenes.py が生成 |
| B2 iPhone 全幅表示 | 完了 | 案1（横フィット）。390px 幅で写真高 293px = 画面の34.7% |
| B3 ボタン重なり | 完了 | 写真領域内での反復押し分け |
| B4 マップピン重なり | 完了 | 優先度順の逐次ラベル配置 |
| B5 弁当屋写真 | 完了 | 130°=東南東を `_s` に割り当て（下記） |

### 計画からの意図的な逸脱（3 点）

1. **B5**: 原本 2 枚は「ほぼ同じ写真」ではなく別被写体・別地点（GPS 約 60m 差）だった。
   方角なし写真は 130°（東南東）で、丸めルールでは東（既存 `_e` と同じ）になるが、
   片方を捨てることになるためユーザー判断を仰ぎ、**店舗写真を `_s` に割り当てて両方残した**。
2. **B4**: 「ズーム100%で dest のみラベル」では 1F の主要地点が 14 件あり交差が残る。
   **優先度順（現在地→主要→通過点）に既出ラベルと重ならないものだけ出す**方式に変更し、
   交差 0 を構造的に保証した（100%: 9件 / 180%以上: 全24件）。
3. **G2**: マニフェストを scenes.js 側に生成することで、scenes.js と HTML 内蔵データの
   完全一致検査をそのまま維持した（検査スクリプトの変更は不要だった）。

### 実装中に判明した重要な事実

- `.hotspot` は絶対配置で `left` を与えると利用可能幅が `コンテナ幅 - left` に縮み、
  **位置を決めた後にラベルが折り返して要素サイズが変わる**。押し分けが古いサイズで
  計算され破綻していた。位置は `transform` で与えるよう変更（CSS にコメントあり）。
- `openMap` / `zoomMap` の実寸計算が `requestAnimationFrame` に載っていたが、
  **背景タブでは rAF が発火せず**、現在地の中央寄せもラベル間引きも行われないままだった。
  同期実行に変更した。
- 公開写真 72 枚のうち 1 枚が 1600×1201（他は 1600×1200）。写真の縦横比は
  定数ではなく `img.naturalWidth/naturalHeight` から実測する実装にした。

---

## 0. 前提知識（必読）

- **アプリ本体は [virtual-tour.html](virtual-tour.html) の単一ファイル**。iPhone ローカルで外部 JS 読込がブロックされるため、地点データは HTML 内の `<script id="scenesData">` ブロックに内蔵している。
- **データの正本は [scenes.js](scenes.js)**。scenes.js を編集したら必ず `python tools/sync_scenes.py` で HTML に反映する。`scenesData` ブロックを直接編集してはならない。
- 写真パイプライン: `photos_original/`（原本・git外）→ `tools/apply_mosaic.py` → `photos_masked/`（git外）→ `tools/build_photos.py`（長辺1600px化＋EXIF全除去）→ `photos/`（公開）。
  **注意: `photos_original/`・`photos_masked/` は worktree には存在しない。** メイン作業ディレクトリ `C:\Users\ryous\Downloads\Tokyo map\` にある。原本は iCloud `C:\Users\ryous\iCloudDrive\Claude\写真\` にもある。
- **公開写真の鉄則**: `photos/` に置くファイルは必ず「モザイク確認済み → 長辺1600px以下 → EXIF/GPS 完全除去」を経ること。新規写真を追加したら必ず EXIF 除去を独立検証する（検証方法は §4）。
- 動作確認は `python -m http.server` でローカル配信し、ブラウザで `virtual-tour.html` を開く。iPhone 相当の確認はビューポート 390×844。
- 開発用機能: URL に `?edit` を付けると座標編集モード。

写真アセットの現状（重要な事実）:
- 公開写真は全 72 枚、すべて **1600×1200 の横長（4:3）**。
- 方角写真（`地点ID_n/e/s/w.jpg`）が 4 方角そろっている地点は 27 地点中 7 地点のみ。残りは 1〜3 方角欠け。
- `yaesu_south_bento` のみ方角なし共通写真 `yaesu_south_bento.jpg` を持つ（これがバグ B5 の原因）。

---

## 1. 修正項目 A 群（レビュー指摘の残件）

### A1. 誤字修正【必須・最初にやる】
- 場所: [scenes.js:68](scenes.js:68)（同じ内容が virtual-tour.html:661 にもある）
- `"東北・上越・北陸新幹線への north のりかえ口。"` → `"東北・上越・北陸新幹線への北のりかえ口。"`
- scenes.js を直して `sync_scenes.py` で反映すること（HTML 直編集禁止）。

### A2. tools/verify_photos.py の Windows クラッシュ修正
- 現象1: NG 出力の「✗」が cp932 で `UnicodeEncodeError` → 検査が最後まで走らない。
  - 修正: 冒頭に `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` を入れる（または ✗ を `NG:` に置換）。
- 現象2: `photos_masked/` が無い環境（worktree・クローン直後）では全 72 枚が「由来不明」で FAIL する。
  - 修正: MASK ディレクトリが存在しない場合は 1:1 対応チェックをスキップし、`[警告] photos_masked/ が無いため 1:1 検査をスキップ` と出して EXIF/サイズ検査のみ実施する仕様に変更。

### A3. showPhoto の非同期競合（レースコンディション）修正
- 場所: [virtual-tour.html:917](virtual-tour.html:917) `showPhoto()`
- 現象: 画像ロードが非同期でキャンセルされないため、視点回転を素早く連打すると古いロードが後から完了して**現在の方角と違う写真が表示され得る**。
- 修正: モジュールスコープに世代カウンタ `let photoGen = 0;` を置き、`showPhoto()` 冒頭で `const gen = ++photoGen;`、`img.onload` / プレースホルダ表示の直前で `if(gen !== photoGen) return;` とする。

### A4. 片方向リンクの解消
- `chika_escalator → b1_ginsuzu`（down）に対し、`b1_ginsuzu` から `chika_escalator` へ戻る up リンクが無い。
- 修正: scenes.js の `b1_ginsuzu.links` に `{to: "chika_escalator", dir: "up", label: "1F 丸の内中央口方面へ（エスカレーター）", x: 15, y: 65}` を追加（x,y は既存の up リンク `central_yaesu` の位置 x:85,y:58 と被らない値にする。B3 の重なり検査で確認）。

### A5. .vercelignore の掃除
- `face_review.html` の行は実ファイルパス `tools/face_review.html` と不一致（`tools/` で除外済みなので実害なしだが行を削除または修正）。
- 本計画書 `OPUS引き継ぎ計画書.md` を .vercelignore に追加（公開物ではないため）。

---

## 2. 修正項目 B 群（新規 5 件）

### B1. 写真が割り当てられていない方角を表示しない【B2 と併せて設計の中心】

**現状**: 4 方角すべてに回転でき、写真が無い方角は「📷 撮影予定 + ファイル名」のプレースホルダが表示される。20 地点で 1 方角以上が欠けているため、一般利用者に未完成画面が頻繁に見える。

**設計方針**:
1. JS からはファイルの有無が同期的に分からないため、**公開写真の一覧（マニフェスト）をデータとして内蔵する**。
   - `tools/sync_scenes.py` を拡張し、同期時に `photos/*.jpg` のファイル名一覧から `const PHOTOS = new Set([...]);` 相当のリストを生成して `scenesData` ブロックに埋め込む（scenes.js 側にも同一のものを書き出すか、sync 時にのみ生成するかは実装しやすい方でよい。ただし「正本 scenes.js + sync で反映」の運用は崩さない）。
2. ヘルパー `availableDirs(id)` を実装: `PHOTOS` を参照し、`{id}_{d}.jpg` が存在する方角の配列を返す。方角写真が 1 枚も無く `{id}.jpg` がある場合は全方角扱い（ただし B5 修正後は該当地点なし）。
3. 挙動の変更:
   - `turnView(step)`: 写真が無い方角をスキップして次の存在する方角へ回す。存在方角が 1 つなら回転ボタン自体を非表示。
   - コンパス `dirBtn`: 写真の無い方角のボタンは `display:none`（または opacity 0.15 + 無効）。
   - `faceTravelDir()`: 算出した方角に写真が無い場合、存在する方角のうち算出方角に角度が最も近いものへスナップする。
   - プレースホルダ表示（撮影予定画面）は `?edit` モード時のみ許可。通常モードでは到達不能にする。

**受け入れ条件（AC-B1)**:
- 通常モード（`?edit` なし）で、全 27 地点それぞれについて回転ボタン・コンパス・地点移動のあらゆる操作で到達できるすべての表示状態において、プレースホルダが一切表示されない。
- `turnView` で切り替わる方角はすべて実在写真が表示される。
- 自動判定方法: §4 のブラウザ一括検査スクリプトで `placeholderSeen === 0` を確認。

### B2. iPhone 縦持ちで写真の中央しか見えない問題の修正

**現状**: `.photoLayer` が `background-size:cover; background-position:center` のため、縦長ビューポート（390×844）では横長写真（1600×1200）の**中央約 1/3 の幅しか表示されない**。

**方針（ユーザー要望: スワイプでのパン、または横フィットのどちらか。推奨は両方の組み合わせ）**:
- **案1（推奨・第一段階）: 横フィット表示**。`background-size: 100% auto`（横幅に合わせる）＋上下は背景色のレターボックス。縦持ち 390px 幅では写真高さ約 293px になるため、以下の追随修正が必須:
  - hotspot（矢印）と放射配置の中心 `linkScreenPos()` の座標基準（現在は画面全体の %）を**写真表示領域基準**に変える、または放射半径・中心を写真領域内に収まるよう再計算する。矢印が写真の外（黒帯）に浮くのは不可。
  - `.missing` プレースホルダや navBar 位置も崩れないこと（横持ち・PC では従来同等の見え方を維持すること。横長ビューポートでは 100% auto がほぼ cover と同じになるので大きな変更は不要のはず）。
- **案2（第二段階・任意だが推奨）: スワイプパン**。縦持ちで cover のまま `background-position-x` をタッチドラッグで動かせるようにする。案1 を実装した上で、ピンチやモード切替でどちらも選べる形にする必要はない — 案1 で AC を満たせば案2 は省略可。案1 で「写真が小さすぎて見づらい」と判断した場合のみ案2 に切り替えること（判断基準: 390px 幅で写真高さが画面高の 1/3 未満になり、かつ hotspot ラベルが写真に重なって読めない場合）。

**受け入れ条件（AC-B2)**:
- ビューポート 390×844 で、表示中の写真の**左端から右端まで**が同時に画面内に見える（案1）、またはスワイプ操作で写真の左端・右端まで表示領域を移動できる（案2）。
- 矢印ボタン・階段ボタン・ラベルが写真表示領域内（またはそれに接した視認可能位置）に収まる。
- 1280×800（PC）でも従来どおり全画面に写真が表示され、崩れがない。
- 自動判定方法: §4 のビューポート別検査で確認（`resize_window` で mobile / desktop 両方）。

### B3. 地点移動ボタン同士の重なり解消

**現状**: 矢印ボタンは相対角に基づく放射配置（`linkScreenPos`: 中心 50%,56%・半径 32/24）、階段ボタンは links の固定 x,y。角度が近い複数リンクや、階段ボタンと放射矢印が同じ位置に来ると**ボタンとラベルが重なって押せない/読めない**。B2 で写真領域が狭くなると悪化するため、**B2 の後に実施**。

**方針**:
- `renderHotspots()` の描画後（または座標計算時）に衝突解消を入れる。実装例: 全 hotspot の予定矩形（arrow 76px + tag を含む概算ボックス）を計算し、重なりがあれば角度の近いもの同士を角度方向に ±15° ずつ、または半径方向に押し出して最小間隔を確保する反復法（数回のイテレーションで十分）。階段ボタンも衝突対象に含める。
- ラベル（.tag）の重なりも対象。ボタン円が離れてもラベル同士が重なるケースがあるため、矩形はラベル込みで判定する。

**受け入れ条件（AC-B3)**:
- 全 27 地点 × その地点で表示可能な全方角（B1 適用後）で、hotspot 要素（`.hotspot` 各子要素の実描画矩形）同士の交差面積が 0。navBar チップ・turnBtn・コンパス・minimap との交差も 0。
- 自動判定方法: §4 のブラウザ一括検査スクリプトで `overlaps.length === 0`（390×844 と 1280×800 の両方）。

### B4. 全体マップ初期表示でピンが重なって見づらい問題の修正

**現状**: 全体マップは初期ズーム 100%（`MAP_ZOOMS = [100, 180, 300]` の先頭）で、27 地点のピン＋ラベル（`.plabel`）が横幅フィットの地図上に全部描画されるため、中央通路付近などでラベルが折り重なる。

**方針（いずれか、または組み合わせ。推奨は 1+2）**:
1. **低ズーム時はラベルを間引く**: ズーム 100% では `dest: true`（主要地点）のみラベル表示、それ以外はドットのみ。180% 以上で全ラベル表示。現在地ピンのラベルは常に表示。
2. **初期表示を現在地中心に**: マップを開いたとき現在地ピンが中央に来るようスクロール位置を合わせる（既にズーム時の中心維持ロジックがあれば流用）。
3. （任意）ピンをタップではなく一度目のタップでラベル表示・二度目で移動、はモバイルで操作性が落ちるので採用しない。

**受け入れ条件（AC-B4)**:
- 初期ズーム（マップを開いた直後）で表示されているラベル（`.plabel`）同士の実描画矩形の交差が 0。
- 現在地ピン（`.pin.here`）が開いた直後のビューポート内に見えている。
- ズームを上げれば従来どおり全ラベルが見える。
- 自動判定方法: §4 のブラウザ一括検査スクリプトでラベル矩形交差 0 を確認。

### B5. 八重洲南口周辺弁当屋（yaesu_south_bento）の写真が東以外すべて同じ問題

**原因（調査済み・確定)**: 原本グループ `iCloudDrive\Claude\写真\八重洲南口周辺弁当屋\` には写真が 2 枚しかない — `八重洲南口周辺弁当屋東.jpg`（→ `_e.jpg`）と方角サフィックスなしの `八重洲南口周辺弁当屋.jpg`（→ 共通フォールバック `yaesu_south_bento.jpg`）。`photoCandidates()` のフォールバック仕様により、北・南・西すべてでこの同じ 1 枚が表示されている。

**修正手順**:
1. iCloud 原本 `八重洲南口周辺弁当屋.jpg` の EXIF（原本には EXIF が残っている）から `GPSImgDirection` を読み、実際の撮影方角を判定する（0/360°=北, 90°=東, 180°=南, 270°=西。最も近い方角に丸める）。
   ```python
   from PIL import Image
   ex = Image.open(r"C:\Users\ryous\iCloudDrive\Claude\写真\八重洲南口周辺弁当屋\八重洲南口周辺弁当屋.jpg").getexif()
   gps = ex.get_ifd(34853)  # 17: GPSImgDirection
   ```
2. **方角が判定できた場合**（東以外の d とする）: `tools/rebuild_from_source.py` の `OVERRIDE` 方式に倣い、この 1 枚を `yaesu_south_bento_{d}.jpg` として写真パイプライン（モザイク要否確認 → 長辺1600 → EXIF除去）を通して `photos/` に配置し、`photos/yaesu_south_bento.jpg`（共通フォールバック）は削除する。既存の公開済み `yaesu_south_bento.jpg` は処理済み画像なので、単にリネームで `_d.jpg` にしてもよい（EXIF なしを再検証すること）。判定方角が東（既存 `_e` と同じ）だった場合は内容を見比べ、良い方を `_e` に採用し、もう一方は削除。
3. **方角が判定できない場合**: `photos/yaesu_south_bento.jpg` を削除するだけでよい。B1 の修正により東向きのみが表示され、「全方角同じ写真」問題は消える。
4. どちらの場合も `rebuild_from_source.py` の `SINGLES`/`OVERRIDE` に対応行を追記し、再構築時に同じ結果になるようにする。

**受け入れ条件（AC-B5)**:
- `yaesu_south_bento` で表示可能な各方角の写真がすべて異なる画像である（ファイルの MD5 が相異なる）。
- `photos/` 内の当該ファイルが EXIF ゼロ・長辺 1600px 以下（§4 の検査で確認）。

---

## 3. 推奨実装順序

依存関係があるため次の順で行う:

1. **A1, A5**（軽微・独立）
2. **A2**（検証ゲートを直さないと §4 が回らない）
3. **B5**（写真アセット確定。B1 のマニフェスト生成前に photos/ の最終状態を確定させる）
4. **B1**（マニフェスト生成 + 方角制限。A3 の showPhoto 改修と同じ関数群を触るので一緒に）+ **A3**
5. **B2**(写真レイアウト変更) → **B3**（ボタン衝突解消は B2 の座標系確定後）
6. **A4**（リンク追加。B3 の衝突検査で位置を確認）
7. **B4**（マップ表示。独立だが最後に UI 全体を通し検証）

各ステップで scenes.js を触ったら必ず `python tools/sync_scenes.py`。

---

## 4. 検証手順とループ条件【最重要・省略禁止】

### 4.1 自動検証ゲート（コード側）

以下 3 つがすべて成功すること。**1 つでも失敗したら修正して 3 つ全部を再実行**。

```powershell
# G1: 写真の安全検査（EXIF ゼロ・長辺1600・由来）
python tools/verify_photos.py          # → "ALL CLEAR" が出ること（A2 修正後の仕様で）

# G2: データ同期検査
python - <<'PY'
import re, pathlib
js = pathlib.Path("scenes.js").read_text(encoding="utf-8")
html = pathlib.Path("virtual-tour.html").read_text(encoding="utf-8")
m = re.search(r'<script id="scenesData">\n(.*?)</script>', html, re.S)
assert m and m.group(1) == js, "OUT OF SYNC: sync_scenes.py を実行せよ"
print("SYNC OK")
PY
# ※B1 でマニフェストの持ち方を変えた場合は、この検査もその仕様に合わせて更新してよい。
#   ただし「scenes.js とHTML内蔵データが一致していることを機械検査する」目的は維持すること。

# G3: シーングラフ検査（リンク切れ・到達不能・フロア整合・写真対応）
node -e "const fs=require('fs');const {scenes,startId}=new Function(fs.readFileSync('scenes.js','utf8')+';return {scenes,startId};')();const ids=Object.keys(scenes);let ng=[];for(const [id,s] of Object.entries(scenes))for(const l of s.links){if(!scenes[l.to])ng.push('broken:'+id+'->'+l.to);if(l.dir==='down'&&!(s.floor==='1F'&&scenes[l.to].floor==='B1'))ng.push('bad down:'+id);if(l.dir==='up'&&!(s.floor==='B1'&&scenes[l.to].floor==='1F'))ng.push('bad up:'+id);}const seen=new Set([startId]),q=[startId];while(q.length){const c=q.pop();for(const l of scenes[c].links)if(!seen.has(l.to)){seen.add(l.to);q.push(l.to);}}for(const i of ids)if(!seen.has(i))ng.push('unreachable:'+i);const photos=new Set(fs.readdirSync('photos'));for(const id of ids){const have=['n','e','s','w'].some(d=>photos.has(id+'_'+d+'.jpg'));if(!have&&!photos.has(id+'.jpg'))ng.push('no photo:'+id);}if(ng.length){console.error(ng);process.exit(1);}console.log('GRAPH OK');"
```

### 4.2 ブラウザ一括検査（AC 判定）

ローカルサーバを立て、ブラウザ（Browser pane）で `virtual-tour.html` を開き、**390×844（mobile）と 1280×800（desktop）の両ビューポート**で以下を実行する。コンソールエラーが 1 件でもあれば FAIL。

擬似コード（javascript_tool で実装して流す。全地点×全表示方角を機械的に巡回する）:

```js
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rectsOverlap = (a,b) => !(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);
  const report = {placeholderSeen: 0, overlaps: [], offPhoto: [], photoDup: {}};
  for (const id of Object.keys(scenes)) {
    goTo(id); await wait(700);
    const dirs = availableDirs(id);            // B1 で実装するヘルパー
    for (const d of dirs) {
      setDir(d); await wait(700);
      // AC-B1: プレースホルダ禁止
      if (document.querySelector(".photoLayer.show .missing")) report.placeholderSeen++;
      // AC-B3: hotspot 同士・UI 要素との矩形交差ゼロ
      const els = [...document.querySelectorAll(".hotspot, .navChip, .turnBtn")];
      const rs = els.map(e => e.getBoundingClientRect());
      for (let i=0;i<rs.length;i++) for (let j=i+1;j<rs.length;j++)
        if (rectsOverlap(rs[i],rs[j])) report.overlaps.push(`${id}/${d}: ${i}-${j}`);
      // AC-B2: hotspot が写真表示領域内にあるか（実装した領域算出関数で判定）
      // AC-B5: 表示写真の src を記録（yaesu_south_bento の方角別重複検査）
      const bg = document.querySelector(".photoLayer.show")?.style.backgroundImage;
      (report.photoDup[id] ||= []).push(`${d}:${bg}`);
    }
  }
  return JSON.stringify(report);
})()
```

チェックリスト（全項目 PASS が必要）:

| # | 検査 | PASS 条件 | ビューポート |
|---|------|-----------|-------------|
| C1 | プレースホルダ非表示 (AC-B1) | placeholderSeen === 0 | 両方 |
| C2 | 回転スキップ (AC-B1) | 写真の無い方角に turnView で到達しない | 両方 |
| C3 | 写真全幅表示 or パン (AC-B2) | 写真の左右端が視認可能 | 390×844 |
| C4 | PC 表示維持 (AC-B2) | 崩れなし・全画面表示 | 1280×800 |
| C5 | ボタン交差ゼロ (AC-B3) | overlaps.length === 0 | 両方 |
| C6 | マップ初期ラベル交差ゼロ (AC-B4) | openMap 直後のラベル矩形交差 0・現在地ピン可視 | 両方 |
| C7 | 弁当屋写真の重複なし (AC-B5) | yaesu_south_bento の方角別 bg がすべて異なる | 両方 |
| C8 | コンソールエラーゼロ | read_console_messages でエラー 0 件 | 両方 |
| C9 | 誤字消滅 (A1) | 画面表示・scenes.js 双方に "north のりかえ" が存在しない | — |
| C10 | 回帰なし | 最低 1 本の通し動線（yaesu_central → 中央通路 → B1 銀の鈴 → 戻る）が正常動作、履歴 back 動作 | 両方 |

### 4.3 ループ条件（終了判定）

```
while (true):
    修正を実装する
    scenes.js を触ったら sync_scenes.py を実行
    §4.1 G1〜G3 を実行 → 1つでも FAIL なら continue（修正に戻る）
    §4.2 C1〜C10 を両ビューポートで実行 → 1つでも FAIL なら continue（修正に戻る）
    ここに到達 = 「最後のコード変更以降に、G1〜G3 と C1〜C10 がすべて連続で PASS」
    break
```

- **判定は必ず「最後の修正のあと」に全件通しで行うこと。** 途中で 1 か所でも直したら、直す前に取った PASS は無効。G1 から取り直す。
- **同一の検査が 3 回連続で同じ理由により FAIL した場合**は、無限に試行せず、原因分析と選択肢（例: B2 案1→案2 への切替）をユーザーに報告して判断を仰ぐこと。
- 全 PASS 後の完了処理: (1) 本計画書の各項目に完了マークを付けるか完了報告を書く、(2) `git add` は公開してよいファイルのみか確認（`photos_original/`・`photos_masked/`・`faces.json` が含まれていないこと）、(3) コミットメッセージ例 `v3.1: 方角制限・iPhone表示改善・ボタン/ピン重なり解消ほかレビュー指摘修正`。**push・デプロイはユーザーの指示を待つ。**

---

## 5. やってはいけないこと

- `virtual-tour.html` の `scenesData` ブロックの直接編集（必ず scenes.js → sync）。
- EXIF/GPS 検証を通していない画像を `photos/` に置くこと。
- `photos_original/`・`photos_masked/`・`faces.json`・`photo-exif.js` を git にコミットすること（.gitignore 済みだが `git add -f` 等で強制追加しない）。
- 単一 HTML で動く方針を壊す変更（外部 JS/CSS への分離、CDN 依存の追加）。
- 検証ループを省略した「たぶん動く」での完了報告。
