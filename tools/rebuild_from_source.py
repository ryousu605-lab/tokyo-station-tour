# -*- coding: utf-8 -*-
"""iCloud の写真グループ（正本）から photos_renamed/ を新しい地点IDで再構築する。

・グループ1つ = 地点1つ。ファイル末尾の 北/東/南/西 を _n/_e/_s/_w に変換。
・接尾辞なしのファイルは共通写真（地点ID.jpg）としてフォールバック用に配置。
・OVERRIDE は EXIF方位＋写真内のサインで確証した方角の訂正。
・CUT は今回ツアーに含めないファイル。
既存の photos_original/ は一切変更しない（安全のため別フォルダに出力する）。
"""
import os, shutil, re, sys, pathlib

SRC = r"C:\Users\ryous\iCloudDrive\Claude\写真"
root = pathlib.Path(__file__).parent.parent
DST = root / "photos_renamed"

GROUP2ID = {
    "八重洲北口": "yaesu_north",
    "北通路東寄": "north_yaesu",
    "北通路": "north_center",
    "北通路西寄": "north_maru",
    "丸の内北口": "maru_north",
    "丸の内北口→丸の内中央口道中": "maru_path_north",
    "丸の内中央口": "maru_central",
    "丸の内中央→南口道中": "maru_path_south",
    "丸の内南口": "maru_south",
    "丸の内南口→八重洲南口道中": "south_maru",
    "中央通路丸の内寄り": "central_maru",
    "中央通路中心": "central_center",
    "中央通り八重洲寄り": "central_yaesu",
    "八重洲中央口": "yaesu_central",
    "新幹線中央乗り換え口": "shinkansen_central",
    "新幹線北乗り換え口": "shinkansen_north",
    "新幹線南乗り換え口弁当屋": "shinkansen_south_bento",
    "新幹線南乗り換え口西寄": "shinkansen_south_west",
    "八重洲南口周辺新幹線口弁当屋": "yaesu_south_shinkansen_bento",
    "八重洲南口周辺弁当屋": "yaesu_south_bento",
    "八重洲南口周辺新幹線": "yaesu_south_shinkansen",
    "八重洲地下中央口": "b1_yaesu",
    "地下銀の鈴": "b1_ginsuzu",
    "地下弁当屋前": "b1_gransta",
}

# フォルダ直下の単独ファイル → (地点ID, 方角)
SINGLES = {
    "八重洲南口周辺南寄り新幹線西.jpg": ("yaesu_south_shinkansen", "w"),
    "丸の内地下中央口手前西.jpg":       ("maru_chika_front", "w"),
    "中央通り中心地下入口東.jpg":       ("chika_escalator", "e"),
    "八重洲北口改札外広場北.jpg":       ("yaesu_north_plaza", "n"),
    "八重洲北口改札外広場北西.jpg":     ("yaesu_north_plaza", "w"),  # 326°=北西 → 最寄りの西
}

CUT = {
    "南通路新幹線周辺南東.jpg",   # ユーザー指示によりカット
    "八重洲中央口改札東.jpg",     # 八重洲中央口_e と重複するため保留
}

DIRMAP = {"北": "n", "東": "e", "南": "s", "西": "w"}

# EXIF方位＋写真内のサインで確証した方角の訂正
OVERRIDE = {
    "丸の内南口東.jpg": "n",            # 20°=北（正面に丸の内中央口・北口）
    "八重洲南口周辺新幹線東.jpg": "s",  # 166°=南（京葉線 舞浜方面）
}


def main():
    DST.mkdir(exist_ok=True)
    rows, n, skipped = [], 0, []
    for cur, dirs, files in os.walk(SRC):
        grp = os.path.relpath(cur, SRC)
        if grp == "Not Tokyo station":
            continue
        for f in sorted(files):
            if not f.lower().endswith(".jpg"):
                continue
            if f in CUT:
                skipped.append((grp, f, "カット"))
                continue
            if grp == ".":
                if f not in SINGLES:
                    skipped.append((grp, f, "未定義"))
                    continue
                sid, d = SINGLES[f]
                new = f"{sid}_{d}.jpg"
            else:
                sid = GROUP2ID.get(grp)
                if not sid:
                    skipped.append((grp, f, "グループ未定義"))
                    continue
                if f in OVERRIDE:
                    new = f"{sid}_{OVERRIDE[f]}.jpg"
                else:
                    m = re.search(r"([北東南西])$", f[:-4])
                    new = f"{sid}_{DIRMAP[m.group(1)]}.jpg" if m else f"{sid}.jpg"
            dstp = DST / new
            if dstp.exists():
                raise SystemExit(f"衝突: {new} ({grp}/{f})")
            shutil.copy2(os.path.join(cur, f), dstp)
            rows.append((grp, f, new))
            n += 1

    for g, f, new in sorted(rows):
        print(f"{g:<28s} {f:<34s} -> {new}")
    print()
    for g, f, why in skipped:
        print(f"[{why}] {g}/{f}")
    print(f"\n{n} 枚を {DST.name}/ に生成（photos_original/ は未変更）")


if __name__ == "__main__":
    main()
