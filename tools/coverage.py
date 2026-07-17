"""Phase G-2 撮影カバレッジ集計。
scenes.js の全地点×4方角(n/e/s/w)について写真の存在を照合し、
未撮影一覧を Markdown 表として 撮影リスト.md に全面書き出す。

写真ディレクトリは既定で photos_original/（Phase B〜D 期）。
Phase E 後は `python tools/coverage.py photos` のように引数で photos/ を指定する。
各方角は  ID_方角.jpg があれば撮影済み。無くても共通写真 ID.jpg があればフォールバックで撮影済み扱い。"""
import pathlib, re, sys, datetime

root = pathlib.Path(__file__).parent.parent

# 対象ディレクトリ決定
arg = sys.argv[1] if len(sys.argv) > 1 else None
if arg:
    DIR = root / arg
elif (root / "photos_original").exists():
    DIR = root / "photos_original"
else:
    DIR = root / "photos"

# scenes.js を行単位でパース（id / name / floor を順序保持で抽出）
scenes = []  # [(id, name, floor)]
cur = None
name = floor = None
for line in (root / "scenes.js").read_text(encoding="utf-8").splitlines():
    m = re.match(r'^  (\w+): \{', line)
    if m:
        if cur:
            scenes.append((cur, name, floor))
        cur, name, floor = m.group(1), "", ""
        continue
    if cur:
        mn = re.match(r'\s*name:\s*"(.*?)"', line)
        if mn and not name:
            name = mn.group(1)
        mf = re.match(r'\s*floor:\s*"(.*?)"', line)
        if mf:
            floor = mf.group(1)
if cur:
    scenes.append((cur, name, floor))

DIRS = [("n", "北"), ("e", "東"), ("s", "南"), ("w", "西")]
existing = {p.name for p in DIR.glob("*.jpg")}

rows = []
total_missing = 0
for sid, nm, fl in scenes:
    has_common = f"{sid}.jpg" in existing
    miss = []
    for d, dlabel in DIRS:
        if has_common or f"{sid}_{d}.jpg" in existing:
            continue
        miss.append(f"{dlabel}(_{d})")
    if miss:
        total_missing += len(miss)
        rows.append((fl, sid, nm, miss))

lines = []
lines.append("# 残り撮影リスト（自動生成）")
lines.append("")
lines.append(f"生成日時: {datetime.date.today().isoformat()} / 照合元: `{DIR.name}/`")
lines.append("")
lines.append(f"未撮影ビュー数: **{total_missing}**（共通写真 `ID.jpg` があれば全方向カバー済みとして除外）")
lines.append("")
if rows:
    lines.append("| フロア | 地点ID | 地点名 | 未撮影の方角 |")
    lines.append("|---|---|---|---|")
    for fl, sid, nm, miss in rows:
        lines.append(f"| {fl} | `{sid}` | {nm} | {'、'.join(miss)} |")
else:
    lines.append("すべての地点×方角が撮影済みです。")
lines.append("")

out = "\n".join(lines)
(root / "撮影リスト.md").write_text(out, encoding="utf-8")
print(out)
print(f"\n→ 撮影リスト.md に書き出しました（未撮影 {total_missing} ビュー）")
