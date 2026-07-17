"""Phase E 検証: 公開用 photos/ が (1)EXIF空 (2)長辺<=1600 (3)photos_masked と 1:1 対応 を満たすか検査。
NG が 1 件でもあれば例外で停止。全通過で ALL CLEAR を出力する。
photos_masked/ が無い環境（worktree・クローン直後）では (3) をスキップし (1)(2) のみ検査する。"""
from PIL import Image
import pathlib, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

root = pathlib.Path(__file__).parent.parent
PUB = root / "photos"
MASK = root / "photos_masked"

pub_names = {p.name for p in PUB.glob("*.jpg")}
has_mask = MASK.is_dir()
mask_names = {p.name for p in MASK.glob("*.jpg")} if has_mask else set()

ng = []

# (3) ファイル名の 1:1 対応
if has_mask:
    missing = mask_names - pub_names   # マスク済みにあって公開に無い
    extra   = pub_names - mask_names   # 公開にあってマスク済みに無い
    if missing:
        ng.append(f"公開漏れ {len(missing)}件: {sorted(missing)}")
    if extra:
        ng.append(f"由来不明 {len(extra)}件: {sorted(extra)}")
else:
    print("[警告] photos_masked/ が無いため 1:1 検査をスキップ")

# (1) EXIF空 / (2) 長辺<=1600
for p in sorted(PUB.glob("*.jpg")):
    im = Image.open(p)
    exif = im.getexif()
    if len(exif) != 0:
        ng.append(f"{p.name}: EXIF が残存 (tags={list(exif.keys())})")
    long_side = max(im.size)
    if long_side > 1600:
        ng.append(f"{p.name}: 長辺 {long_side}px が 1600 超過")

if has_mask:
    print(f"検査対象: 公開 {len(pub_names)}枚 / マスク済み {len(mask_names)}枚")
else:
    print(f"検査対象: 公開 {len(pub_names)}枚")
if ng:
    print(f"\n=== NG {len(ng)}件 ===")
    for m in ng:
        print("  NG:", m)
    sys.exit(1)
print("ALL CLEAR")
