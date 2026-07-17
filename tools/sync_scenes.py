"""正本 scenes.js を virtual-tour.html の scenesData ブロックへ反映する。

あわせて公開写真マニフェスト(PHOTOS)を photos/*.jpg から scenes.js 内へ自動生成する。
JS はファイルの有無を同期的に判定できないため、写真のある方角だけを表示するには
この一覧をデータとして内蔵する必要がある。
生成先を scenes.js 側にすることで「正本 scenes.js + sync で HTML 反映」の運用と、
「scenes.js と HTML 内蔵データが一致する」検査をそのまま保てる。
"""
import re, pathlib, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

root = pathlib.Path(__file__).parent.parent
scenes_p = root / "scenes.js"
html_p = root / "virtual-tour.html"

BEGIN, END = "/* PHOTOS:BEGIN */", "/* PHOTOS:END */"

names = sorted(p.name for p in (root / "photos").glob("*.jpg"))
block = (
    BEGIN + "\n"
    + "const PHOTOS = new Set([\n"
    + "".join(f'  "{n}",\n' for n in names)
    + "]);\n"
    + END
)

js = scenes_p.read_text(encoding="utf-8")
if BEGIN in js and END in js:
    js, n = re.subn(re.escape(BEGIN) + r".*?" + re.escape(END), lambda m: block, js, count=1, flags=re.S)
    assert n == 1
else:
    js = js.rstrip("\n") + (
        "\n\n/* ---- 公開写真マニフェスト ----\n"
        "   tools/sync_scenes.py が photos/*.jpg から自動生成する。手で編集しない。 */\n"
        + block + "\n"
    )
scenes_p.write_text(js, encoding="utf-8")

html = html_p.read_text(encoding="utf-8")
new, n = re.subn(
    r'(<script id="scenesData">\n).*?(</script>)',
    lambda m: m.group(1) + js + m.group(2),
    html, count=1, flags=re.S)
assert n == 1, "scenesData ブロックが見つからない"
html_p.write_text(new, encoding="utf-8")
print(f"PHOTOS: {len(names)} 枚 / synced {len(js)} bytes")
