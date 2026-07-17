"""Phase D-3 顔モザイク適用。
入力 photos_original/ を全て photos_masked/ にコピーし、faces.json に枠があるファイルだけ加工する。
各枠を上下左右 15% 拡張し、その領域をブロックモザイク化（block = 幅/10 px, 最小8px）。
EXIF はこの段階では保持したまま（除去は Phase E の build_photos.py で一括）。Pillow のみ。"""
from PIL import Image
import pathlib, json

root = pathlib.Path(__file__).parent.parent
SRC = root / "photos_original"
DST = root / "photos_masked"
DST.mkdir(exist_ok=True)
faces_path = root / "faces.json"
faces = json.loads(faces_path.read_text(encoding="utf-8")) if faces_path.exists() else {}

def mosaic_region(im, x, y, w, h):
    W, H = im.size
    # 15% 拡張してクランプ
    ex, ey = int(round(w * 0.15)), int(round(h * 0.15))
    x0 = max(0, x - ex); y0 = max(0, y - ey)
    x1 = min(W, x + w + ex); y1 = min(H, y + h + ey)
    if x1 <= x0 or y1 <= y0:
        return
    rw, rh = x1 - x0, y1 - y0
    bs = max(8, rw // 10)               # ブロックサイズ
    region = im.crop((x0, y0, x1, y1))
    small = region.resize((max(1, rw // bs), max(1, rh // bs)), Image.BILINEAR)
    blocky = small.resize((rw, rh), Image.NEAREST)
    im.paste(blocky, (x0, y0))

n_files = n_boxes = 0
for p in sorted(SRC.glob("*.jpg")):
    im = Image.open(p)
    exif = im.info.get("exif")
    boxes = faces.get(p.name, [])
    if boxes:
        im = im.convert("RGB")
        for (x, y, w, h) in boxes:
            mosaic_region(im, int(x), int(y), int(w), int(h))
            n_boxes += 1
    save_kwargs = {"quality": 95}
    if exif:
        save_kwargs["exif"] = exif           # EXIF を保持（Phase E で除去）
    im.convert("RGB").save(DST / p.name, "JPEG", **save_kwargs)
    n_files += 1

print(f"{n_files} files copied to photos_masked/, {n_boxes} boxes mosaiced")
