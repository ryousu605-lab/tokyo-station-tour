from PIL import Image, ImageOps
import pathlib
root = pathlib.Path(__file__).parent.parent
SRC, DST = root / "photos_masked", root / "photos"
DST.mkdir(exist_ok=True)
total = 0
for p in sorted(SRC.glob("*.jpg")):
    im = ImageOps.exif_transpose(Image.open(p))   # 向きを画素に焼き込み
    im.thumbnail((1600, 1600), Image.LANCZOS)     # 長辺1600px（拡大はしない）
    im.convert("RGB").save(DST / p.name, "JPEG",
        quality=82, optimize=True, progressive=True)  # exif=未指定 → 全メタデータ除去
    total += (DST / p.name).stat().st_size
print(f"{len(list(DST.glob('*.jpg')))} files, {total/1e6:.1f} MB")
