import { DashboardShell, GoalCard, HotelTable, TrendBars } from "../components";
import { getDashboardData } from "../../lib/dashboard-data";
import { formatCompactYen, formatPct } from "../../lib/dashboard-helpers";

export default function RevenueImpactPage() {
  const data = getDashboardData();
  const hotels = [...data.hotels].sort((a, b) => (b.projectedRevenue || 0) - (a.projectedRevenue || 0));
  const columns = [
    { label: "ホテル", render: (hotel) => hotel.name },
    { label: "3月実績", render: (hotel) => formatCompactYen(hotel.monthlyRevenue) },
    { label: "着地見込", render: (hotel) => formatCompactYen(hotel.projectedRevenue) },
    { label: "達成見込", render: (hotel) => formatPct(hotel.projectedTargetAttainmentPct) },
    { label: "利益率", render: (hotel) => formatPct(hotel.marginPct) },
    { label: "特別清掃", render: (hotel) => formatCompactYen(hotel.specialCleaningRevenue) }
  ];
  const goals = [
    { label: "3月着地見込", value: data.summary.projectedMonthlyRevenue / 1000000, target: 100, unit: "百万円", lowerIsBetter: false },
    { label: "達成見込", value: data.summary.avgProjectedTargetAttainmentPct, target: 100, unit: "%", lowerIsBetter: false },
    { label: "特別清掃売上", value: data.summary.specialCleaningRevenue / 10000, target: 120, unit: "万円", lowerIsBetter: false }
  ];

  return (
    <DashboardShell
      currentPath="/revenue-impact/"
      title="品質×売上・ROI分析"
      subtitle="品質課題が売上進捗と着地見込みへ与える影響を経営視点で整理"
      updatedAt={data.updatedAt}
    >
      <section className="goal-grid">
        {goals.map((goal) => (
          <GoalCard key={goal.label} goal={goal} />
        ))}
      </section>
      <section className="card">
        <div className="card-title">売上トレンド</div>
        <TrendBars items={data.revenueTrend} />
      </section>
      <section className="card">
        <div className="card-title">売上・利益一覧</div>
        <HotelTable hotels={hotels} columns={columns} />
      </section>
    </DashboardShell>
  );
}
