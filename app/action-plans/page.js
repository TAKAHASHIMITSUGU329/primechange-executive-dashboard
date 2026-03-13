import { DashboardShell, HotelTable } from "../components";
import { getDashboardData } from "../../lib/dashboard-data";

function phaseLabel(hotel) {
  if (hotel.riskLevel === "high") {
    return "即時対応";
  }
  if (hotel.upsellLevel === "high") {
    return "短期提案";
  }
  return "中期改善";
}

export default function ActionPlansPage() {
  const data = getDashboardData();
  const hotels = [...data.hotels].sort((a, b) => {
    const weight = { high: 2, medium: 1, low: 0 };
    return weight[b.riskLevel] - weight[a.riskLevel] || (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0);
  });

  const columns = [
    { label: "ホテル", render: (hotel) => hotel.name },
    { label: "フェーズ", render: (hotel) => phaseLabel(hotel) },
    { label: "主要課題", render: (hotel) => hotel.mainIssue },
    { label: "次アクション", render: (hotel) => hotel.nextAction },
    { label: "担当", render: (hotel) => (hotel.riskLevel === "high" ? "運営" : "営業") }
  ];

  return (
    <DashboardShell
      currentPath="/action-plans/"
      title="アクションプラン"
      subtitle="ホテル別に即時・短期・中期の打ち手を整理し、経営会議の指示に使える形へまとめる"
      updatedAt={data.updatedAt}
    >
      <section className="card prose-card">
        <div className="card-title">3フェーズ運用</div>
        <p>即時対応は高リスクホテルの品質是正、短期提案はアップセル候補への特別清掃・監査提案、中期改善は高評価ホテルの運用標準化と横展開に分けて進めます。</p>
      </section>
      <section className="card">
        <div className="card-title">ホテル別改善計画</div>
        <HotelTable hotels={hotels} columns={columns} />
      </section>
    </DashboardShell>
  );
}
