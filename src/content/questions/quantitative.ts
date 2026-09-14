import type { Question } from "@/lib/types";

/** 数量关系样例题 15 */
export const quantitativeQuestions: Question[] = [
  {
    id: "quantitative-001",
    module: "quantitative",
    type: "single-choice",
    stem: "某工程甲单独做 12 天完成，乙单独做 18 天完成。两人合作，需要多少天完成？",
    options: ["6.2", "7.2", "7.5", "8"],
    answer: 1,
    analysis:
      "设总量 36（12 与 18 的最小公倍数），甲效率 3，乙效率 2，合作效率 5，36÷5=7.2 天。",
    tags: ["工程问题", "效率合作"],
  },
  {
    id: "quantitative-002",
    module: "quantitative",
    type: "single-choice",
    stem: "一项工作，甲单独做 20 天完成。甲做了 5 天后，乙加入，两人又做了 10 天完成。乙单独做需要多少天？",
    options: ["15", "20", "25", "30"],
    answer: 2,
    analysis:
      "甲效率 1/20。甲共做 15 天完成 15/20=3/4，剩 1/4 由乙在 10 天完成，乙效率 1/40？不对：甲做 5 天后乙加入，合作 10 天，甲共 15 天。剩余由乙 10 天完成的是 5/20=1/4，乙效率 1/40，乙单独 40 天——选项无 40。重算：总工作甲 5 天 + 甲乙 10 天。甲完成 (5+10)/20=3/4，乙完成 1/4 用 10 天，乙单独 40 天。调整题干使答案落在选项：若乙单独 25 天，则乙效率 1/25，10 天完成 2/5，甲 15 天 3/4，总和 1.55>1，不合。改题：甲 5 天，甲乙 8 天完成。甲 13/20，乙 7/20 用 8 天，乙单独 160/7≈22.9。用整数题替代。",
    tags: ["工程问题", "分段合作"],
  },
  {
    id: "quantitative-003",
    module: "quantitative",
    type: "single-choice",
    stem: "某商品进价 80 元，标价 120 元，商场打八折出售，利润率是多少？",
    options: ["10%", "15%", "20%", "25%"],
    answer: 2,
    analysis:
      "售价=120×0.8=96，利润=16，利润率=16/80=20%。注意利润率是利润/成本。",
    tags: ["经济利润", "打折"],
  },
  {
    id: "quantitative-004",
    module: "quantitative",
    type: "single-choice",
    stem: "一列火车通过 300 米长的桥用 20 秒，通过 500 米长的桥用 30 秒。火车长多少米？",
    options: ["80", "100", "120", "150"],
    answer: 1,
    analysis:
      "设车长 L，速度 v。(300+L)/20=(500+L)/30。解得 L=100，v=20 m/s。",
    tags: ["行程问题", "过桥"],
  },
  {
    id: "quantitative-005",
    module: "quantitative",
    type: "single-choice",
    stem: "甲、乙两人从相距 60 千米的两地同时出发相向而行，甲速 4 km/h，乙速 6 km/h。几小时后相遇？",
    options: ["5", "6", "6.5", "7"],
    answer: 1,
    analysis: "相遇时间=路程和÷速度和=60÷(4+6)=6 小时。",
    tags: ["行程问题", "相遇"],
  },
  {
    id: "quantitative-006",
    module: "quantitative",
    type: "single-choice",
    stem: "某班男女生人数比为 3∶2，女生比男生少 8 人。全班共多少人？",
    options: ["32", "36", "40", "48"],
    answer: 2,
    analysis: "一份=8 人，总份数 5，8×5=40 人。",
    tags: ["比例问题", "份数法"],
  },
  {
    id: "quantitative-007",
    module: "quantitative",
    type: "single-choice",
    stem: "数列：2，6，12，20，30，（ ）",
    options: ["40", "42", "44", "48"],
    answer: 1,
    analysis: "差为 4，6，8，10，下一差 12，30+12=42。通项 n(n+1)。",
    tags: ["数字推理", "多级差"],
  },
  {
    id: "quantitative-008",
    module: "quantitative",
    type: "single-choice",
    stem: "一项任务，甲效率是乙的 2 倍。两人合作 6 天完成。甲单独做需要几天？",
    options: ["8", "9", "10", "12"],
    answer: 1,
    analysis:
      "设乙效率 1，甲效率 2，合作效率 3，总量=18。甲单独 18÷2=9 天。",
    tags: ["工程问题", "效率比"],
  },
  {
    id: "quantitative-009",
    module: "quantitative",
    type: "single-choice",
    stem: "一个水池有甲、乙两进水管，单开甲 10 小时注满，单开乙 15 小时注满。两管同开，几小时注满？",
    options: ["5", "6", "7", "8"],
    answer: 1,
    analysis: "1/(1/10+1/15)=1/(1/6)=6 小时。",
    tags: ["工程问题", "注水"],
  },
  {
    id: "quantitative-010",
    module: "quantitative",
    type: "single-choice",
    stem: "某单位组织 60 人植树，男职工每人植 4 棵，女职工每人植 3 棵，共植树 210 棵。女职工有多少人？",
    options: ["20", "25", "30", "35"],
    answer: 2,
    analysis:
      "鸡兔同笼。若全是男：240 棵，多了 30。每把一名男换成女少 1 棵，故女=30 人。",
    tags: ["鸡兔同笼", "方程法"],
  },
  {
    id: "quantitative-011",
    module: "quantitative",
    type: "single-choice",
    stem: "浓度为 20% 的盐水 200 克，加入多少克水后浓度变为 10%？",
    options: ["150", "200", "250", "300"],
    answer: 1,
    analysis: "溶质=40 克不变。新总量=40/0.1=400，加水 200 克。",
    tags: ["浓度问题", "溶质不变"],
  },
  {
    id: "quantitative-012",
    module: "quantitative",
    type: "single-choice",
    stem: "一环形跑道周长 400 米，甲、乙同地反向出发，甲速 5 m/s，乙速 3 m/s。首次相遇时甲跑了多少米？",
    options: ["200", "250", "300", "350"],
    answer: 1,
    analysis: "相遇时间=400/(5+3)=50 s，甲跑 5×50=250 米。",
    tags: ["行程问题", "环形相遇"],
  },
  {
    id: "quantitative-013",
    module: "quantitative",
    type: "single-choice",
    stem: "某公司去年产值 500 万元，今年增长 20%，明年计划再增长 20%。两年产值之和是多少万元？",
    options: ["1200", "1250", "1280", "1300"],
    answer: 2,
    analysis:
      "今年=600，明年=720，两年和=1320——不在选项。重算：题意两年产值之和指今年+明年=600+720=1320。调整选项。用去年+今年+明年更合理：500+600+720=1820。改为只问今年产值：600。本题改为：今年产值比去年增长 20%，去年 500 万，今年产值？",
    tags: ["增长率", "经济"],
  },
  {
    id: "quantitative-014",
    module: "quantitative",
    type: "single-choice",
    stem: "把 9 本书分给 3 人，每人至少 1 本，共有多少种不同分法？（不要求区分书的不同）",
    options: ["10", "21", "28", "36"],
    answer: 2,
    analysis:
      "书相同、人不同时是整数拆分加排列——通常公考题若书不同用隔板法 C(8,2)=28。按书不同、每人至少 1 本：C(8,2)=28。",
    tags: ["排列组合", "隔板法"],
  },
  {
    id: "quantitative-015",
    module: "quantitative",
    type: "single-choice",
    stem: "钟表在 3 点与 4 点之间，时针与分针何时重合？",
    options: ["3 点 12 分", "3 点 15 分", "3 点 16 分 22 秒", "3 点 18 分"],
    answer: 2,
    analysis:
      "3 点整时针领先 90°。相对速度 5.5°/min，追上需 90/5.5=16 又 4/11 分≈16 分 22 秒。",
    tags: ["钟表问题", "追及"],
  },
];

// 修正第 2 题与第 13 题为干净可算题
quantitativeQuestions[1] = {
  id: "quantitative-002",
  module: "quantitative",
  type: "single-choice",
  stem: "一项工作，甲单独做 20 天完成。甲做了 5 天后，乙加入，两人又合作 10 天完成全部工作。乙单独完成这项工作需要多少天？",
  options: ["30", "35", "40", "45"],
  answer: 2,
  analysis:
    "甲共工作 15 天，完成 15/20=3/4。乙 10 天完成 1/4，乙效率=1/40，乙单独 40 天。",
  tags: ["工程问题", "分段合作"],
};

quantitativeQuestions[12] = {
  id: "quantitative-013",
  module: "quantitative",
  type: "single-choice",
  stem: "某公司去年产值 500 万元，今年比去年增长 20%。今年产值是多少万元？",
  options: ["550", "600", "650", "700"],
  answer: 1,
  analysis: "500×(1+20%)=600 万元。",
  tags: ["增长率", "经济"],
};
