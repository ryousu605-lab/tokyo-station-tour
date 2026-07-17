# -*- coding: utf-8 -*-
"""?edit の「scenes.js 書き出し」で得たエクスポートから、map.x / map.y の数値だけを
正本 scenes.js に転記する（コメント・整形・links には一切触れない）。

使い方:  python tools/apply_pins.py New/scenes.js

安全策:
・エクスポート側と正本側で「座標以外」が一致しない場合は中止する。
・全地点を転記できたか照合し、漏れがあれば中止する。
"""
import json, re, subprocess, sys, pathlib

root = pathlib.Path(__file__).parent.parent


def load_scenes(path):
    """node で scenes.js を評価し {id: {...}} を JSON で取り出す"""
    # scenes.js の const 宣言は eval のスコープ内に閉じるため、同一 eval 内で global へ公開する
    code = (
        'const fs=require("fs");'
        f'eval(fs.readFileSync({json.dumps(str(path))},"utf-8")'
        ' + "\\nglobalThis.__d={MAPS,startId,scenes};");'
        'process.stdout.write(JSON.stringify(globalThis.__d));'
    )
    r = subprocess.run(["node", "-e", code], capture_output=True, cwd=str(root))
    if r.returncode:
        raise SystemExit(f"読み込み失敗 {path}: {r.stderr.decode('utf-8','replace')}")
    return json.loads(r.stdout.decode("utf-8"))


def skeleton(d):
    """座標を除いた比較用の骨格"""
    return json.dumps({
        "MAPS": d["MAPS"], "startId": d["startId"],
        "scenes": {k: {kk: vv for kk, vv in v.items() if kk != "map"}
                   for k, v in d["scenes"].items()},
    }, ensure_ascii=False, sort_keys=True)


def main():
    src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "New" / "scenes.js"
    cur_p = root / "scenes.js"
    cur, exp = load_scenes(cur_p), load_scenes(src)

    if skeleton(cur) != skeleton(exp):
        raise SystemExit("中止: 座標以外に差分があります（地点構成/リンク/名称）。手動で確認してください。")

    text = cur_p.read_text(encoding="utf-8")
    lines = text.split("\n")
    cur_id, applied = None, {}
    for i, line in enumerate(lines):
        m = re.match(r"^  (\w+): \{", line)
        if m:
            cur_id = m.group(1)
            continue
        if cur_id and re.match(r"^    map: \{x: [\d.]+, y: [\d.]+\}", line):
            p = exp["scenes"][cur_id]["map"]
            x, y = p["x"], p["y"]
            fmt = lambda v: str(int(v)) if float(v) == int(v) else str(v)
            lines[i] = re.sub(r"^    map: \{x: [\d.]+, y: [\d.]+\}",
                              f"    map: {{x: {fmt(x)}, y: {fmt(y)}}}", line)
            applied[cur_id] = (x, y)
            cur_id = None

    missing = set(exp["scenes"]) - set(applied)
    if missing:
        raise SystemExit(f"中止: 転記できなかった地点があります: {sorted(missing)}")

    cur_p.write_text("\n".join(lines), encoding="utf-8")

    # 検証: 書き戻した結果がエクスポートと一致するか
    after = load_scenes(cur_p)
    for k, v in exp["scenes"].items():
        a = after["scenes"][k]["map"]
        if abs(a["x"] - v["map"]["x"]) > 1e-9 or abs(a["y"] - v["map"]["y"]) > 1e-9:
            raise SystemExit(f"中止: 転記結果が不一致 {k}: {a} != {v['map']}")

    print(f"転記完了: {len(applied)} 地点（座標のみ / 漏れ0 / 検証OK）")


if __name__ == "__main__":
    main()
