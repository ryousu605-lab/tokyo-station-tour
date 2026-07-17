"""Phase D-1 顔検出（OpenCV YuNet）。
photos_original/*.jpg を全数検出し、元解像度ピクセルの枠を faces.json に出力する。
検出は長辺1600pxに縮小した画像で行い、座標は元解像度へ換算する。スコア閾値 0.6。
検出0件のファイルも空配列で含める。目視補正ページ用に tools/faces.js も同時出力。

事前準備:
  pip install opencv-python
  モデル face_detection_yunet_2023mar.onnx を https://github.com/opencv/opencv_zoo
  （models/face_detection_yunet/）から tools/ にダウンロードして置く。
"""
import cv2, numpy as np
import pathlib, json

root = pathlib.Path(__file__).parent.parent
SRC = root / "photos_original"
MODEL = pathlib.Path(__file__).parent / "face_detection_yunet_2023mar.onnx"
assert MODEL.exists(), f"モデルが見つかりません: {MODEL}\n  opencv_zoo から DL して tools/ に置いてください。"

LONG = 1600
SCORE = 0.6

detector = cv2.FaceDetectorYN.create(str(MODEL), "", (320, 320), score_threshold=SCORE)

def imread_unicode(p):
    data = np.fromfile(str(p), dtype=np.uint8)   # 日本語/空白パス対策
    return cv2.imdecode(data, cv2.IMREAD_COLOR)

out = {}
for p in sorted(SRC.glob("*.jpg")):
    img = imread_unicode(p)
    if img is None:
        out[p.name] = []
        continue
    H, W = img.shape[:2]
    scale = min(1.0, LONG / max(H, W))            # 縮小のみ
    dw, dh = int(round(W * scale)), int(round(H * scale))
    small = cv2.resize(img, (dw, dh)) if scale < 1.0 else img
    detector.setInputSize((small.shape[1], small.shape[0]))
    _, faces = detector.detect(small)
    boxes = []
    if faces is not None:
        for f in faces:
            x, y, w, h = f[:4]
            # 元解像度へ換算＋クランプ
            ox, oy = x / scale, y / scale
            ow, oh = w / scale, h / scale
            ox = max(0, min(W - 1, ox)); oy = max(0, min(H - 1, oy))
            ow = min(W - ox, ow); oh = min(H - oy, oh)
            boxes.append([int(round(ox)), int(round(oy)), int(round(ow)), int(round(oh))])
    out[p.name] = boxes

(root / "faces.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
(pathlib.Path(__file__).parent / "faces.js").write_text(
    "const FACES = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")

n_boxes = sum(len(v) for v in out.values())
n_hit = sum(1 for v in out.values() if v)
print(f"{len(out)} files, {n_hit} files with faces, {n_boxes} boxes total")
print("→ faces.json / tools/faces.js を出力しました。次に tools/face_review.html で目視補正してください。")
