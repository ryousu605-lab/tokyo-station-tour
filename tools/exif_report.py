from PIL import Image
import os, re, json
DIR = r"..\photos_original"
DECL = -8.0  # 東京の磁気偏角補正
out = {}
base = os.path.join(os.path.dirname(__file__), DIR)
for f in sorted(os.listdir(base)):
    if not f.endswith(".jpg"): continue
    g = Image.open(os.path.join(base, f)).getexif().get_ifd(0x8825)
    if 17 in g: out[f] = round((float(g[17]) + DECL) % 360, 1)
with open(os.path.join(os.path.dirname(__file__), "..", "photo-exif.js"), "w", encoding="utf-8") as fp:
    fp.write("const EXIF_DIR = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
