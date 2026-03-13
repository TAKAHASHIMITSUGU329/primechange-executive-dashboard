import { DashboardShell, GoalCard, HotelTable } from "../components";
import { getDashboardData } from "../../lib/dashboard-data";
import { formatDelta, formatPct } from "../../lib/dashboard-helpers";

export default function CleaningStrategyPage() {
  const data = getDashboardData();
  const hotels = [...data.hotels].sort((a, b) => (b.cleaningNegativeRate || 0) - (a.cleaningNegativeRate || 0));
  const goals = [
    { label: "清掃課題率", value: data.summary.cleaningNegativeRate, target: 3, unit: "%", lowerIsBetter: true },
    { label: "悪化ホテル数", value: data.summary.worsenedHotels, target: 4, unit: "件", lowerIsBetter: true },
    { label: "要注意ホテル数", value: data.summary.atRiskHotels, target: 2, unit: "件", lowerIsBetter: true }
  ];
  const columns = [
    { label: "ホテル", render: (hotel) => hotel.name },
    { label: "清掃課題率", render: (hotel) => formatPct(hotel.cleaningNegativeRate) },
    { label: "前月差", render: (hotel) => formatDelta(hotel.cleaningNegativeRateDelta) },
    { label: "主要課題", render: (hotel) => hotel.mainIssue },
    { label: "推奨施策", render: (hotel) => hotel.nextAction }
  ];

  return (
    <DashboardShell
      currentPath="/cleaning-strategy/"
      title="清掃戦略レポート"
      subtitle="臭気・仕上がり不足・設備老朽化など、清掃品質課題を横断比較"
      updatedAt={data.updatedAt}
    >
      <section className="goal-grid">
        {goals.map((goal) => (
          <GoalCard key={goal.label} goal={goal} />
        ))}
      </section>
      <section className="card prose-card">
        <div className="card-title">優先戦略</div>
        <p>直近では「水回り臭気」と「仕上がり不足」が上位に集中しています。臭気対策は定期特別清掃と点検強化、仕上がり不足は最終チェック強化とチェッカー配置の見直しが有効です。</p>
      </section>
      <section className="card">
        <div className="card-title">清掃課題ヒートマップ相当一覧</div>
        <HotelTable hotels={hotels} columns={columns} />
      </section>
    </DashboardShell>
  );
}
