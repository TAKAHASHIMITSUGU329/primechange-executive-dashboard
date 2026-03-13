import { DashboardShell, LinkCard } from "../components";
import { getDashboardData } from "../../lib/dashboard-data";

const analysisCards = [
  {
    icon: "1",
    title: "クレーム類型",
    description: "臭気、仕上がり不足、設備老朽化、騒音などを横断分類。",
    stat: "主要不満カテゴリを特定"
  },
  {
    icon: "2",
    title: "人員配置",
    description: "レビュー悪化ホテルと稼働率・利益率の関係を見て、配置最適化の優先順位を整理。",
    stat: "稼働率と品質の関係を見る"
  },
  {
    icon: "3",
    title: "完了品質",
    description: "仕上がり不足ホテルをチェッカー強化や最終監査追加の候補として抽出。",
    stat: "仕上がり監査対象"
  },
  {
    icon: "4",
    title: "安全・ルール",
    description: "クレーム率と現場運用を合わせて安全面の改善対象を整理。",
    stat: "クレーム率を見る"
  },
  {
    icon: "5",
    title: "品質×売上",
    description: "品質悪化が進捗や着地見込みへ与える影響を比較。",
    stat: "経営への影響を把握"
  },
  {
    icon: "6",
    title: "ベストプラクティス",
    description: "高評価かつ高利益率ホテルの運用を標準化候補として抽出。",
    stat: "横展開の成功事例"
  }
];

export default function DeepAnalysisPage() {
  const data = getDashboardData();
  return (
    <DashboardShell
      currentPath="/deep-analysis/"
      title="深掘り分析"
      subtitle={`${data.summary.activeHotels}ホテルの品質・売上・運用を複数の軸で深掘り`}
      updatedAt={data.updatedAt}
    >
      <section className="grid-cards">
        {analysisCards.map((card) => (
          <article className="card insight-card" key={card.title}>
            <div className="link-card-icon">{card.icon}</div>
            <div className="link-card-title">{card.title}</div>
            <div className="link-card-desc">{card.description}</div>
            <div className="link-card-stat">{card.stat}</div>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
