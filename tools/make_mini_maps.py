"""ミニマップ用の縮小構内図 maps/*_mini.png を原寸 maps/*.png から生成する。

ミニマップの枠は 124〜170px で、そこに MINI_ZOOM=2 倍で構内図全体を敷く。
原寸(3368px・約1.8MB)を初回表示で読ませる必要はなく、縮小版で十分に見える。
全体マップ(?の +/- で 300% まで拡大)は従来どおり原寸を使うので、原寸は消さない。

  python tools/make_mini_maps.py
"""
import pathlib
import sys

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

WIDTH = 720    # ミニマップ最大 170px × MINI_ZOOM 2 = 340px。高DPI(2x)でも足りる幅
COLORS = 96    # 124px 枠で見る図なので減色は判別できない。フルカラーPNGの1/6以下になる

root = pathlib.Path(__file__).parent.parent
maps = root / "maps"

for src in sorted(maps.glob("*.png")):
    if src.stem.endswith("_mini"):
        continue
    dst = maps / f"{src.stem}_mini.png"
    im = Image.open(src)
    h = round(im.height * WIDTH / im.width)
    small = im.convert("RGB").resize((WIDTH, h), Image.LANCZOS)
    small.quantize(colors=COLORS, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG).save(dst, optimize=True)
    before, after = src.stat().st_size, dst.stat().st_size
    print(f"{src.name} {im.width}px/{before/1024:.0f}KB -> {dst.name} {WIDTH}px/{after/1024:.0f}KB")
