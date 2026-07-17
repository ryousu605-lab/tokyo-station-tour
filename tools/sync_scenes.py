import re, pathlib
root = pathlib.Path(__file__).parent.parent
js = (root / "scenes.js").read_text(encoding="utf-8")
html_p = root / "virtual-tour.html"
html = html_p.read_text(encoding="utf-8")
new, n = re.subn(
    r'(<script id="scenesData">\n).*?(</script>)',
    lambda m: m.group(1) + js + m.group(2),
    html, count=1, flags=re.S)
assert n == 1, "scenesData ブロックが見つからない"
html_p.write_text(new, encoding="utf-8")
print("synced", len(js), "bytes")
