const MAPS = {
  "1F": { image: "maps/1f.png", width: 4000, height: 4000, label: "1F" },
  "B1": { image: "maps/b1.png", width: 3368, height: 2382, label: "B1" }
};
const startId = "yaesu_central";

const scenes = {
  /* ---- 八重洲側 改札前 ---- */
  yaesu_north: {
    name: "八重洲北口 改札前",
    desc: "大丸東京店側の改札。",
    floor: "1F",
    map: {x: 32, y: 24}, dest: true,
    links: [
      {to: "north_yaesu", dir: "forward", label: "北通路へ", x: 50, y: 45},
      {to: "yaesu_central", dir: "right", label: "八重洲中央口方面", x: 84, y: 58}
    ]
  },
  yaesu_central: {
    name: "八重洲中央口 改札前",
    desc: "八重洲側のメイン改札。グランルーフ正面。",
    floor: "1F",
    map: {x: 45, y: 23}, dest: true,
    links: [
      {to: "central_yaesu", dir: "forward", label: "中央通路へ", x: 50, y: 45},
      {to: "yaesu_north", dir: "left", label: "八重洲北口方面", x: 15, y: 58},
      {to: "yaesu_south", dir: "right", label: "八重洲南口方面", x: 85, y: 58}
    ]
  },
  yaesu_south: {
    name: "八重洲南口 改札前",
    desc: "高速バスターミナル側の改札。",
    floor: "1F",
    map: {x: 54, y: 17}, dest: true,
    links: [
      {to: "south_yaesu", dir: "forward", label: "南通路へ", x: 50, y: 45},
      {to: "yaesu_central", dir: "left", label: "八重洲中央口方面", x: 15, y: 58},
      {to: "yaesu_south_bento", dir: "right", label: "駅弁・土産店（HANAGATAYA）前へ", x: 85, y: 58}
    ]
  },

  /* ---- 新幹線乗換口 ---- */
  shinkansen_central: {
    name: "新幹線中央乗換口 前",
    desc: "東海道・山陽新幹線への乗り換え。",
    floor: "1F",
    map: {x: 40, y: 28}, dest: true,
    links: [
      {to: "central_yaesu", dir: "back", label: "中央通路へ戻る", x: 50, y: 86}
    ]
  },
  shinkansen_south: {
    name: "新幹線南乗換口 前",
    desc: "新幹線南のりかえ口。東北・上越・北陸方面もこちら。",
    floor: "1F",
    map: {x: 50, y: 29}, dest: true,
    links: [
      {to: "south_yaesu", dir: "back", label: "南通路へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 北通路 ---- */
  north_yaesu: {
    name: "北通路（八重洲寄り）",
    desc: "八重洲北口から丸の内方面へ延びる通路。",
    floor: "1F",
    map: {x: 30, y: 27}, dest: false,
    links: [
      {to: "north_center", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "yaesu_north", dir: "back", label: "八重洲北口へ戻る", x: 50, y: 86},
      {to: "shinkansen_north", dir: "left", label: "新幹線北乗換口へ", x: 15, y: 58}
    ]
  },
  north_center: {
    name: "北通路 中程（エスカレーター付近）",
    desc: "各ホームへのエスカレーター・階段が並ぶ。",
    floor: "1F",
    map: {x: 28, y: 33}, dest: true,
    links: [
      {to: "north_maru", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "north_yaesu", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86},
      {to: "b1_gransta", dir: "down", label: "グランスタ地下へ（B1）", x: 85, y: 58}
    ]
  },
  north_maru: {
    name: "北通路（丸の内寄り）",
    desc: "丸の内北口はもうすぐ。",
    floor: "1F",
    map: {x: 26, y: 40}, dest: false,
    links: [
      {to: "maru_north", dir: "forward", label: "丸の内北口へ", x: 50, y: 45},
      {to: "north_center", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 中央通路 ---- */
  central_yaesu: {
    name: "中央通路（駅弁屋 祭 前）",
    desc: "駅弁屋「祭」やグランスタの店舗が並ぶ賑やかなエリア。",
    floor: "1F",
    map: {x: 44, y: 25}, dest: true,
    links: [
      {to: "central_center", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "shinkansen_central", dir: "left", label: "新幹線中央乗換口へ", x: 15, y: 58},
      {to: "yaesu_central", dir: "back", label: "八重洲中央口へ戻る", x: 50, y: 86},
      {to: "b1_ginsuzu", dir: "down", label: "銀の鈴広場へ（B1）", x: 85, y: 58}
    ]
  },
  central_center: {
    name: "中央通路 中程",
    desc: "各ホームへの階段・エスカレーターが続く。",
    floor: "1F",
    map: {x: 43, y: 33}, dest: false,
    links: [
      {to: "central_maru", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "central_yaesu", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },
  central_maru: {
    name: "中央通路（丸の内寄り）",
    desc: "丸の内中央口方面。",
    floor: "1F",
    map: {x: 42, y: 40}, dest: false,
    links: [
      {to: "maru_central", dir: "forward", label: "丸の内中央口へ", x: 50, y: 45},
      {to: "central_center", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },

  /* ---- 南通路 ---- */
  south_yaesu: {
    name: "南通路（八重洲寄り）",
    desc: "八重洲南口から続く通路。新幹線南乗換口が近い。",
    floor: "1F",
    map: {x: 57, y: 26}, dest: false,
    links: [
      {to: "south_center", dir: "forward", label: "丸の内方面へ進む", x: 50, y: 45},
      {to: "shinkansen_south", dir: "left", label: "新幹線南乗換口へ", x: 15, y: 58},
      {to: "yaesu_south", dir: "back", label: "八重洲南口へ戻る", x: 50, y: 86},
      {to: "yaesu_south_bento", dir: "right", label: "駅弁・土産店（HANAGATAYA）前へ", x: 85, y: 58}
    ]
  },
  south_center: {
    name: "南通路 中程",
    desc: "各ホームへの階段・エスカレーターが続く。",
    floor: "1F",
    map: {x: 57, y: 34}, dest: false,
    links: [
      {to: "maru_south", dir: "forward", label: "丸の内南口へ", x: 50, y: 45},
      {to: "south_yaesu", dir: "back", label: "八重洲方面へ戻る", x: 50, y: 86}
    ]
  },
  /* ---- 丸の内側 改札前 ---- */
  maru_north: {
    name: "丸の内北口 改札前",
    desc: "ドーム天井の丸の内駅舎北側。",
    floor: "1F",
    map: {x: 30, y: 44}, dest: true,
    links: [
      {to: "north_maru", dir: "back", label: "北通路へ戻る", x: 50, y: 86},
      {to: "maru_path_north", dir: "left", label: "丸の内中央口方面", x: 15, y: 58}
    ]
  },
  maru_central: {
    name: "丸の内中央口 前",
    desc: "皇居・行幸通りの正面。ICカード専用改札。",
    floor: "1F",
    map: {x: 48, y: 50}, dest: true,
    links: [
      {to: "central_maru", dir: "back", label: "中央通路へ戻る", x: 50, y: 86},
      {to: "maru_path_north", dir: "right", label: "丸の内北口方面", x: 85, y: 58},
      {to: "maru_path_south", dir: "left", label: "丸の内南口方面", x: 15, y: 58},
      {to: "b1_maru_chika_central", dir: "down", label: "丸の内地下改札へ（B1）", x: 50, y: 65}
    ]
  },
  maru_south: {
    name: "丸の内南口 改札前",
    desc: "ドーム天井の丸の内駅舎南側。KITTE方面。",
    floor: "1F",
    map: {x: 55, y: 44}, dest: true,
    links: [
      {to: "south_center", dir: "back", label: "南通路へ戻る", x: 50, y: 86},
      {to: "maru_path_south", dir: "right", label: "丸の内中央口方面", x: 85, y: 58}
    ]
  },

  /* ---- 追加地点（位置は目測。?edit で微調整前提） ---- */
  shinkansen_north: {
    name: "新幹線北乗換口 前",
    desc: "新幹線北のりかえ口。北通路から乗り換えできる。",
    floor: "1F",
    map: {x: 26, y: 30}, dest: true,
    links: [
      {to: "north_yaesu", dir: "back", label: "北通路へ戻る", x: 50, y: 86}
    ]
  },
  yaesu_south_bento: {
    name: "八重洲南口 駅弁・土産店前",
    desc: "駅弁・土産のHANAGATAYA。新幹線南乗換口のそば。",
    floor: "1F",
    map: {x: 53, y: 21}, dest: false,
    links: [
      {to: "yaesu_south", dir: "back", label: "八重洲南口へ戻る", x: 50, y: 86},
      {to: "south_yaesu", dir: "forward", label: "南通路へ", x: 50, y: 45}
    ]
  },
  maru_path_north: {
    name: "丸の内側通路（北口〜中央口）",
    desc: "丸の内北口と丸の内中央口を結ぶ通路。",
    floor: "1F",
    map: {x: 39, y: 47}, dest: false,
    links: [
      {to: "maru_central", dir: "forward", label: "丸の内中央口へ", x: 50, y: 45},
      {to: "maru_north", dir: "back", label: "丸の内北口へ戻る", x: 50, y: 86}
    ]
  },
  maru_path_south: {
    name: "丸の内側通路（中央口〜南口）",
    desc: "丸の内中央口と丸の内南口を結ぶ通路。",
    floor: "1F",
    map: {x: 52, y: 47}, dest: false,
    links: [
      {to: "maru_south", dir: "forward", label: "丸の内南口へ", x: 50, y: 45},
      {to: "maru_central", dir: "back", label: "丸の内中央口へ戻る", x: 50, y: 86}
    ]
  },

  /* ==================== B1 ==================== */
  b1_yaesu: {
    name: "八重洲地下中央口 改札前",
    desc: "八重洲地下街・東京駅一番街に直結する地下改札。",
    floor: "B1",
    map: {x: 51.5, y: 27}, dest: true,
    links: [
      {to: "b1_ginsuzu", dir: "back", label: "銀の鈴広場へ戻る", x: 50, y: 86}
    ]
  },
  b1_ginsuzu: {
    name: "銀の鈴広場",
    desc: "定番の待ち合わせ場所。グランスタ東京の中心部。",
    floor: "B1",
    map: {x: 44, y: 36}, dest: true,
    links: [
      {to: "b1_yaesu", dir: "forward", label: "八重洲地下中央口へ", x: 50, y: 45},
      {to: "b1_gransta", dir: "left", label: "グランスタ中央へ", x: 15, y: 58},
      {to: "central_yaesu", dir: "up", label: "1F 中央通路へ", x: 85, y: 58}
    ]
  },
  b1_gransta: {
    name: "グランスタ地下 中央（スクエア ゼロ付近）",
    desc: "土産・スイーツ店舗が並ぶ地下コンコースの中心。",
    floor: "B1",
    map: {x: 38, y: 49}, dest: false,
    links: [
      {to: "b1_ginsuzu", dir: "right", label: "銀の鈴広場へ", x: 85, y: 58},
      {to: "b1_maru_chika_central", dir: "forward", label: "丸の内地下方面へ", x: 50, y: 45},
      {to: "north_center", dir: "up", label: "1F 北通路へ", x: 50, y: 86}
    ]
  },
  b1_maru_chika_central: {
    name: "丸の内地下中央口 改札前",
    desc: "東京メトロ丸ノ内線への連絡口。総武・横須賀線ホームが近い。",
    floor: "B1",
    map: {x: 39, y: 79}, dest: true,
    links: [
      {to: "b1_gransta", dir: "forward", label: "グランスタ方面へ", x: 50, y: 45},
      {to: "maru_central", dir: "up", label: "1F 丸の内中央口へ", x: 50, y: 45}
    ]
  }
};
