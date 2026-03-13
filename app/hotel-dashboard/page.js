import { DashboardShell, HotelTable, KpiCard } from "../components";
import { getDashboardData } from "../../lib/dashboard-data";
import { formatCompactYen, formatDelta, formatPct } from "../../lib/dashboard-helpers";

export default function HotelDashboardPage() {
  const data = getDashboardData();
  const hotels = [...data.hotels].sort((a, b) => (b.avgReview || 0) - (a.avgReview || 0));
  const columns = [
    {
      label: "ホテル",
      render: (hotel) => (
        <>
          <strong>{hotel.name}</strong>
          <div className="cell-sub">{hotel.region}</div>
        </>
      )
    },
    { label: "平均評価", render: (hotel) => hotel.avgReview?.toFixed(1) ?? "未取得" },
    { label: "レビュー数", render: (hotel) => `${hotel.reviewCount}件` },
    { label: "清掃課題率", render: (hotel) => formatPct(hotel.cleaningNegativeRate) },
    { label: "前月差", render: (hotel) => formatDelta(hotel.cleaningNegativeRateDelta) },
    { label: "主要課題", render: (hotel) => hotel.mainIssue },
    { label: "主要評価", render: (hotel) => hotel.mainPraise },
    { label: "3月売上", render: (hotel) => formatCompactYen(hotel.monthlyRevenue) }
  ];

  return (
    <DashboardShell
      currentPath="/hotel-dashboard/"
      title="ホテル別口コミダッシュボード"
      subtitle={`19ホテルのレビュー品質を比較し、低評価リスクと高評価ホテルを一覧化`}
      updatedAt={data.updatedAt}
    >
      <section className="kpi-grid">
        <KpiCard label="対象ホテル" value={`${data.summary.activeHotels}件`} sub="レビュー対象" />
        <KpiCard label="総レビュー数" value={`${data.metadata.reviewCount.toLocaleString("ja-JP")}件`} sub="取得済み口コミ" tone="green" />
        <KpiCard label="平均スコア" value={`${data.summary.avgReviewScore.toFixed(2)}`} sub="/ 10 点" tone="green" />
        <KpiCard label="清掃課題率" value={formatPct(data.summary.cleaningNegativeRate)} sub="全体平均" tone="red" />
      </section>
      <section className="card">
        <div className="card-title">ホテル別レビュー一覧</div>
        <HotelTable hotels={hotels} columns={columns} />
      </section>
    </DashboardShell>
  );
}
