const MAPS = {
  "1F": { image: "maps/1f.png", width: 3368, height: 2382, label: "1F" },
  "B1": { image: "maps/b1.png", width: 3368, height: 2382, label: "B1" }
};
const startId = "yaesu_central";

/* 地点は「撮影時の写真グループ」と 1:1 で対応する。
   map:{x,y} は構内図(公式1F/B1平面図)上の位置(%)。?edit のピンドラッグで最終調整する。 */
const scenes = {
  /* ---- 八重洲北口 ---- */
  yaesu_north_plaza: {
    name: "八重洲北口 改札外広場",
    desc: "八重洲北口を出た改札外の広場。",
    floor: "1F",
    map: {x: 32.5, y: 22.7}, dest: true,
    links: [
      {to: "yaesu_north", dir: "forward", label: "八重洲北口 改札へ", x: 50, y: 45}
    ]
  },
  yaesu_north: {
    name: "八重洲北口 改札前",
    desc: "大丸東京店側の改札。",
    floor: "1F",
    map: {x: 30.4, y: 35.1}, dest: true,
    links: [
      {to: "north_yaesu", dir: "forward", label: "北通路へ", x: 50, y: 45},
      {to: "yaesu_north_plaza", dir: "back", label: "改札外広場へ", x: 50, y: 86}
    ]
  },

  /* ---- 北通路 ---- */
  north_yaesu: {
    name: "北通路（八重洲寄り）",
    desc: "八重洲北口から丸の内方面へ延びる通路。",
    floor: "1F",
    map: {x: 31, y: 42}, dest: false,
    links: [
      {to: "north_center", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "yaesu_north", dir: "back", label: "八重洲北口へ戻る", x: 50, y: 86},
      {to: "shinkansen_north", dir: "left", label: "新幹線北乗換口へ", x: 15, y: 58}
    ]
  },
  north_center: {
    name: "北通路 中程",
    desc: "各ホームへのエスカレーター・階段が並ぶ。",
    floor: "1F",
    map: {x: 31, y: 56}, dest: true,
    links: [
      {to: "north_maru", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "north_yaesu", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86},
      {to: "b1_gransta", dir: "down", label: "地下弁当屋前へ（B1）", x: 85, y: 58}
    ]
  },
  north_maru: {
    name: "北通路（丸の内寄り）",
    desc: "丸の内北口はもうすぐ。",
    floor: "1F",
    map: {x: 31, y: 70}, dest: false,
    links: [
      {to: "maru_north", dir: "forward", label: "丸の内北口へ", x: 50, y: 45},
      {to: "north_center", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 新幹線 乗換口（北・中央） ---- */
  shinkansen_north: {
    name: "新幹線北乗換口 前",
    desc: "東北・上越・北陸新幹線への北のりかえ口。",
    floor: "1F",
    map: {x: 33.7, y: 55.6}, dest: true,
    links: [
      {to: "north_yaesu", dir: "back", label: "北通路へ戻る", x: 50, y: 86}
    ]
  },
  shinkansen_central: {
    name: "新幹線中央乗換口 前",
    desc: "東海道・山陽新幹線への中央のりかえ口。",
    floor: "1F",
    map: {x: 47.3, y: 54.7}, dest: true,
    links: [
      {to: "central_yaesu", dir: "back", label: "中央通路へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 八重洲中央口・中央通路 ---- */
  yaesu_central: {
    name: "八重洲中央口 改札前",
    desc: "八重洲側のメイン改札。グランルーフ正面。",
    floor: "1F",
    map: {x: 55.8, y: 36}, dest: true,
    links: [
      {to: "central_yaesu", dir: "forward", label: "中央通路へ", x: 50, y: 45}
    ]
  },
  central_yaesu: {
    name: "中央通路（八重洲寄り・駅弁屋 祭 前）",
    desc: "駅弁屋「祭」やグランスタの店舗が並ぶ賑やかなエリア。",
    floor: "1F",
    map: {x: 52.5, y: 54.7}, dest: true,
    links: [
      {to: "central_center", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "shinkansen_central", dir: "left", label: "新幹線中央乗換口へ", x: 15, y: 58},
      {to: "yaesu_central", dir: "back", label: "八重洲中央口へ戻る", x: 50, y: 86},
      {to: "b1_ginsuzu", dir: "down", label: "地下銀の鈴へ（B1）", x: 85, y: 58}
    ]
  },
  central_center: {
    name: "中央通路 中程",
    desc: "各ホームへの階段・エスカレーターが続く。",
    floor: "1F",
    map: {x: 52.3, y: 63.1}, dest: false,
    links: [
      {to: "central_maru", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "central_yaesu", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },
  central_maru: {
    name: "中央通路（丸の内寄り）",
    desc: "丸の内中央口方面。",
    floor: "1F",
    map: {x: 52.3, y: 75.7}, dest: false,
    links: [
      {to: "maru_central", dir: "forward", label: "丸の内中央口へ", x: 50, y: 45},
      {to: "central_center", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 丸の内側 ---- */
  maru_north: {
    name: "丸の内北口 改札前",
    desc: "ドーム天井の丸の内駅舎北側。",
    floor: "1F",
    map: {x: 30.6, y: 77.8}, dest: true,
    links: [
      {to: "north_maru", dir: "back", label: "北通路へ戻る", x: 50, y: 86},
      {to: "maru_path_north", dir: "left", label: "丸の内中央口方面", x: 15, y: 58}
    ]
  },
  maru_path_north: {
    name: "丸の内側通路（北口〜中央口）",
    desc: "丸の内北口と丸の内中央口を結ぶ通路。",
    floor: "1F",
    map: {x: 41.1, y: 78.8}, dest: false,
    links: [
      {to: "maru_chika_front", dir: "forward", label: "丸の内地下中央口 手前へ", x: 50, y: 45},
      {to: "maru_north", dir: "back", label: "丸の内北口へ戻る", x: 50, y: 86}
    ]
  },
  maru_chika_front: {
    name: "丸の内地下中央口 手前",
    desc: "丸の内地下中央口へ下りる手前。",
    floor: "1F",
    map: {x: 47, y: 81.2}, dest: false,
    links: [
      {to: "maru_central", dir: "forward", label: "丸の内中央口へ", x: 50, y: 45},
      {to: "maru_path_north", dir: "back", label: "丸の内北口方面へ戻る", x: 50, y: 86}
    ]
  },
  maru_central: {
    name: "丸の内中央口 前",
    desc: "皇居・行幸通りの正面。ICカード専用改札。",
    floor: "1F",
    map: {x: 51.3, y: 79.6}, dest: true,
    links: [
      {to: "central_maru", dir: "back", label: "中央通路へ戻る", x: 50, y: 86},
      {to: "maru_chika_front", dir: "right", label: "丸の内北口方面", x: 85, y: 58},
      {to: "chika_escalator", dir: "forward", label: "地下入口（エスカレーター）へ", x: 50, y: 45},
      {to: "maru_path_south", dir: "left", label: "丸の内南口方面", x: 15, y: 58}
    ]
  },
  chika_escalator: {
    name: "地下入口（B1エスカレーター）",
    desc: "B1 グランスタへ下りるエスカレーター。",
    floor: "1F",
    map: {x: 51.5, y: 69.4}, dest: false,
    links: [
      {to: "maru_central", dir: "back", label: "丸の内中央口へ戻る", x: 50, y: 86},
      {to: "b1_ginsuzu", dir: "down", label: "地下銀の鈴へ（B1）", x: 50, y: 65}
    ]
  },
  maru_path_south: {
    name: "丸の内側通路（中央口〜南口）",
    desc: "丸の内中央口と丸の内南口を結ぶ通路。",
    floor: "1F",
    map: {x: 63.1, y: 80.6}, dest: false,
    links: [
      {to: "maru_south", dir: "forward", label: "丸の内南口へ", x: 50, y: 45},
      {to: "maru_central", dir: "back", label: "丸の内中央口へ戻る", x: 50, y: 86}
    ]
  },
  maru_south: {
    name: "丸の内南口 改札前",
    desc: "ドーム天井の丸の内駅舎南側。KITTE方面。",
    floor: "1F",
    map: {x: 80.3, y: 77.6}, dest: true,
    links: [
      {to: "maru_path_south", dir: "back", label: "丸の内中央口方面へ戻る", x: 50, y: 86},
      {to: "south_maru", dir: "forward", label: "南通路へ", x: 50, y: 45}
    ]
  },

  /* ---- 南通路・新幹線南・八重洲南口 ---- */
  south_maru: {
    name: "南通路（丸の内寄り）",
    desc: "丸の内南口から八重洲南口へ続く南通路。",
    floor: "1F",
    map: {x: 75, y: 68}, dest: false,
    links: [
      {to: "shinkansen_south_west", dir: "forward", label: "新幹線南乗換口方面へ", x: 50, y: 45},
      {to: "maru_south", dir: "back", label: "丸の内南口へ戻る", x: 50, y: 86}
    ]
  },
  shinkansen_south_west: {
    name: "新幹線南乗換口（西寄り）",
    desc: "東北・上越・北陸新幹線 南のりかえ口の西側。",
    floor: "1F",
    map: {x: 64.9, y: 59.4}, dest: true,
    links: [
      {to: "shinkansen_south_bento", dir: "forward", label: "新幹線南乗換口 弁当屋前へ", x: 50, y: 45},
      {to: "south_maru", dir: "back", label: "南通路（丸の内寄り）へ戻る", x: 50, y: 86}
    ]
  },
  shinkansen_south_bento: {
    name: "新幹線南乗換口 弁当屋前",
    desc: "東海道・山陽新幹線 南のりかえ口そばの弁当屋。",
    floor: "1F",
    map: {x: 63, y: 54.5}, dest: true,
    links: [
      {to: "yaesu_south_shinkansen_bento", dir: "forward", label: "八重洲南口周辺 新幹線口弁当屋へ", x: 50, y: 45},
      {to: "shinkansen_south_west", dir: "back", label: "新幹線南乗換口（西寄り）へ戻る", x: 50, y: 86}
    ]
  },
  yaesu_south_shinkansen_bento: {
    name: "八重洲南口周辺 新幹線口弁当屋",
    desc: "新幹線のりかえ口そばの駅弁・土産店。",
    floor: "1F",
    map: {x: 72.2, y: 54.9}, dest: false,
    links: [
      {to: "yaesu_south_bento", dir: "forward", label: "八重洲南口周辺 弁当屋へ", x: 50, y: 45},
      {to: "shinkansen_south_bento", dir: "back", label: "新幹線南乗換口 弁当屋前へ戻る", x: 50, y: 86}
    ]
  },
  yaesu_south_bento: {
    name: "八重洲南口周辺 弁当屋",
    desc: "八重洲南口改札そばの駅弁・土産店（HANAGATAYA）。",
    floor: "1F",
    map: {x: 78.9, y: 37.8}, dest: true,
    links: [
      {to: "yaesu_south_shinkansen", dir: "forward", label: "八重洲南口周辺（新幹線・南寄り）へ", x: 50, y: 45},
      {to: "yaesu_south_shinkansen_bento", dir: "back", label: "新幹線口弁当屋へ戻る", x: 50, y: 86}
    ]
  },
  yaesu_south_shinkansen: {
    name: "八重洲南口周辺 新幹線（南寄り）",
    desc: "八重洲南口の南寄り。京葉線方面もこちら。",
    floor: "1F",
    map: {x: 75, y: 45.9}, dest: true,
    links: [
      {to: "yaesu_south_bento", dir: "back", label: "八重洲南口周辺 弁当屋へ戻る", x: 50, y: 86}
    ]
  },

  /* ==================== B1 ==================== */
  b1_yaesu: {
    name: "八重洲地下中央口 改札前",
    desc: "八重洲地下街・東京駅一番街に直結する地下改札。",
    floor: "B1",
    map: {x: 44.2, y: 29.3}, dest: true,
    links: [
      {to: "b1_ginsuzu", dir: "back", label: "地下銀の鈴へ戻る", x: 50, y: 86}
    ]
  },
  b1_ginsuzu: {
    name: "地下銀の鈴",
    desc: "定番の待ち合わせ場所。グランスタ東京の中心部。",
    floor: "B1",
    map: {x: 44, y: 36}, dest: true,
    links: [
      {to: "b1_yaesu", dir: "forward", label: "八重洲地下中央口へ", x: 50, y: 45},
      {to: "b1_gransta", dir: "left", label: "地下弁当屋前へ", x: 15, y: 58},
      {to: "central_yaesu", dir: "up", label: "1F 中央通路へ", x: 85, y: 58},
      {to: "chika_escalator", dir: "up", label: "1F 丸の内中央口方面へ（エスカレーター）", x: 15, y: 65}
    ]
  },
  b1_gransta: {
    name: "地下弁当屋前",
    desc: "土産・スイーツ・弁当の店舗が並ぶ地下コンコース。",
    floor: "B1",
    map: {x: 47.2, y: 46.9}, dest: true,
    links: [
      {to: "b1_ginsuzu", dir: "right", label: "地下銀の鈴へ", x: 85, y: 58},
      {to: "north_center", dir: "up", label: "1F 北通路へ", x: 50, y: 86}
    ]
  }
};

/* ---- 公開写真マニフェスト ----
   tools/sync_scenes.py が photos/*.jpg から自動生成する。手で編集しない。 */
/* PHOTOS:BEGIN */
const PHOTOS = new Set([
  "b1_ginsuzu_e.jpg",
  "b1_ginsuzu_n.jpg",
  "b1_ginsuzu_s.jpg",
  "b1_ginsuzu_w.jpg",
  "b1_gransta_n.jpg",
  "b1_gransta_s.jpg",
  "b1_gransta_w.jpg",
  "b1_yaesu_e.jpg",
  "b1_yaesu_w.jpg",
  "central_center_e.jpg",
  "central_center_n.jpg",
  "central_center_s.jpg",
  "central_center_w.jpg",
  "central_maru_e.jpg",
  "central_maru_n.jpg",
  "central_maru_s.jpg",
  "central_maru_w.jpg",
  "central_yaesu_e.jpg",
  "central_yaesu_n.jpg",
  "central_yaesu_s.jpg",
  "central_yaesu_w.jpg",
  "chika_escalator_e.jpg",
  "maru_central_e.jpg",
  "maru_central_w.jpg",
  "maru_chika_front_w.jpg",
  "maru_north_e.jpg",
  "maru_north_s.jpg",
  "maru_north_w.jpg",
  "maru_path_north_e.jpg",
  "maru_path_north_n.jpg",
  "maru_path_north_s.jpg",
  "maru_path_south_n.jpg",
  "maru_path_south_s.jpg",
  "maru_south_n.jpg",
  "maru_south_w.jpg",
  "north_center_e.jpg",
  "north_center_w.jpg",
  "north_maru_n.jpg",
  "north_maru_w.jpg",
  "north_yaesu_e.jpg",
  "north_yaesu_s.jpg",
  "shinkansen_central_e.jpg",
  "shinkansen_central_n.jpg",
  "shinkansen_central_s.jpg",
  "shinkansen_central_w.jpg",
  "shinkansen_north_n.jpg",
  "shinkansen_north_s.jpg",
  "shinkansen_north_w.jpg",
  "shinkansen_south_bento_e.jpg",
  "shinkansen_south_bento_n.jpg",
  "shinkansen_south_bento_s.jpg",
  "shinkansen_south_bento_w.jpg",
  "shinkansen_south_west_e.jpg",
  "shinkansen_south_west_n.jpg",
  "shinkansen_south_west_s.jpg",
  "south_maru_e.jpg",
  "south_maru_w.jpg",
  "yaesu_central_e.jpg",
  "yaesu_central_n.jpg",
  "yaesu_central_s.jpg",
  "yaesu_central_w.jpg",
  "yaesu_north_e.jpg",
  "yaesu_north_plaza_n.jpg",
  "yaesu_north_plaza_w.jpg",
  "yaesu_north_w.jpg",
  "yaesu_south_bento_e.jpg",
  "yaesu_south_bento_s.jpg",
  "yaesu_south_shinkansen_bento_n.jpg",
  "yaesu_south_shinkansen_bento_w.jpg",
  "yaesu_south_shinkansen_n.jpg",
  "yaesu_south_shinkansen_s.jpg",
  "yaesu_south_shinkansen_w.jpg",
]);
/* PHOTOS:END */
