import {
  AlertHotelCard,
  DashboardShell,
  GoalCard,
  KpiCard,
  LinkCard,
  TrendBars
} from "./components";
import { getDashboardData } from "../lib/dashboard-data";
import {
  formatPct,
  getCleaningIssueCount,
  getGoalCards,
  getHighScoreRate,
  getRiskHotels,
  getWeightedAverageScore
} from "../lib/dashboard-helpers";

export default function PortalPage() {
  const data = getDashboardData();
  const riskHotels = getRiskHotels(data.hotels, 4);
  const avgScore = getWeightedAverageScore(data.hotels);
  const highRate = getHighScoreRate(data.hotels);
  const issueCount = getCleaningIssueCount(data.hotels);
  const goalCards = getGoalCards(data.summary);

  const linkCards = [
    {
      href: "/hotel-dashboard/",
      icon: "📊",
      title: "ホテル別口コミダッシュボード",
      description: "19ホテルの口コミ品質を一覧し、評価・課題・売上を横断比較します。",
      stat: `${data.summary.activeHotels}ホテル / ${data.metadata.reviewCount.toLocaleString("ja-JP")}件 →`
    },
    {
      href: "/cleaning-strategy/",
      icon: "🧹",
      title: "清掃戦略レポート",
      description: "臭気・仕上がり不足・老朽化など、清掃品質課題と改善優先順位を整理します。",
      stat: `${issueCount}件の清掃指摘 →`
    },
    {
      href: "/deep-analysis/",
      icon: "🔎",
      title: "深掘り分析",
      description: "クレーム類型、人員配置、品質・売上など複数軸の分析へ移動します。",
      stat: "6つの分析テーマ →"
    },
    {
      href: "/revenue-impact/",
      icon: "💴",
      title: "品質×売上・ROI分析",
      description: "3月着地見込みと目標達成、利益率を経営目線で確認します。",
      stat: `${Math.round((data.summary.projectedMonthlyRevenue || 0) / 10000).toLocaleString("ja-JP")}万円見込 →`
    },
    {
      href: "/action-plans/",
      icon: "✅",
      title: "アクションプラン",
      description: "ホテル別に即時・短期・中期の打ち手を整理し、会議アジェンダへ直結させます。",
      stat: `${data.summary.atRiskHotels}件の優先対応 →`
    }
  ];

  return (
    <DashboardShell
      currentPath="/"
      title="ホテル品質管理ポータル"
      subtitle={`PRIMECHANGE ${data.summary.activeHotels}ホテル・${data.metadata.reviewCount.toLocaleString("ja-JP")}件の口コミと月次実績に基づく経営ダッシュボード`}
      updatedAt={data.updatedAt}
    >
      <section className="kpi-grid">
        <KpiCard label="管理ホテル数" value={`${data.summary.activeHotels}`} sub="ホテル" />
        <KpiCard label="総口コミ数" value={data.metadata.reviewCount.toLocaleString("ja-JP")} sub="件" tone="green" />
        <KpiCard label="平均スコア" value={avgScore?.toFixed(2) ?? "未取得"} sub="/ 10 点" tone="green" />
        <KpiCard label="高評価率" value={formatPct(highRate)} sub="平均8点以上ホテル比率" tone="green" />
        <KpiCard label="清掃課題率" value={formatPct(data.summary.cleaningNegativeRate)} sub={`${issueCount}件`} tone="red" />
      </section>

      <section className="grid-cards">
        {linkCards.map((card) => (
          <LinkCard key={card.title} {...card} />
        ))}
      </section>

      <section className="card alert-card">
        <div className="card-title">緊急対応が必要なホテル ({riskHotels.length}件)</div>
        <div className="alert-grid">
          {riskHotels.map((hotel) => (
            <AlertHotelCard key={hotel.name} hotel={hotel} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-title">口コミ・売上トレンド</div>
        <TrendBars items={data.revenueTrend} />
      </section>

      <section className="card">
        <div className="card-title">KPI目標</div>
        <div className="goal-grid">
          {goalCards.map((goal) => (
            <GoalCard key={goal.label} goal={goal} />
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
