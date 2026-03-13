import { getDashboardData } from "../lib/dashboard-data";

function formatYen(value) {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(value);
}

function formatCompactYen(value) {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return `${Math.round(value / 10000).toLocaleString("ja-JP")}万円`;
}

function formatPct(value, suffix = "%") {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return `${value.toFixed(1)}${suffix}`;
}

function formatDelta(value, suffix = "pt") {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

function formatGap(current, target) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return "未連携";
  }
  const gap = current - target;
  const sign = gap > 0 ? "+" : "";
  return `${sign}${Math.round(gap / 10000).toLocaleString("ja-JP")}万円`;
}

function toneForAttainment(value) {
  if (!Number.isFinite(value)) {
    return "medium";
  }
  if (value < 90) {
    return "high";
  }
  if (value < 100) {
    return "medium";
  }
  return "low";
}

function buildWorseningHotels(hotels) {
  return hotels
    .map((hotel) => ({
      ...hotel,
      worsenScore:
        (Number.isFinite(hotel.cleaningNegativeRateDelta) ? hotel.cleaningNegativeRateDelta * 2 : 0) +
        (Number.isFinite(hotel.reviewDelta) && hotel.reviewDelta < 0 ? Math.abs(hotel.reviewDelta) * 5 : 0) +
        (Number.isFinite(hotel.marginDelta) && hotel.marginDelta < 0 ? Math.abs(hotel.marginDelta) : 0)
    }))
    .sort((a, b) => b.worsenScore - a.worsenScore)
    .slice(0, 6);
}

function buildForecastAlerts(hotels) {
  return hotels
    .filter((hotel) => Number.isFinite(hotel.projectedTargetAttainmentPct) && hotel.projectedTargetAttainmentPct < 90)
    .sort((a, b) => a.projectedTargetAttainmentPct - b.projectedTargetAttainmentPct)
    .slice(0, 6);
}

function buildRiskHotels(hotels) {
  const riskWeight = { high: 2, medium: 1, low: 0 };
  return hotels
    .filter((hotel) => hotel.riskLevel === "high" || hotel.riskLevel === "medium")
    .sort(
      (a, b) =>
        riskWeight[b.riskLevel] - riskWeight[a.riskLevel] ||
        b.cleaningNegativeRate - a.cleaningNegativeRate ||
        (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0)
    )
    .slice(0, 6);
}

function buildUpsellHotels(hotels) {
  return hotels
    .filter((hotel) => hotel.upsellLevel === "high")
    .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
    .slice(0, 6);
}

function KpiCard({ label, value, meta }) {
  return (
    <article className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className="kpi-meta">{meta}</p>
    </article>
  );
}

function ListCard({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">{title}</p>
          <h3>{subtitle}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const data = getDashboardData();
  const riskHotels = buildRiskHotels(data.hotels);
  const upsellHotels = buildUpsellHotels(data.hotels);
  const forecastAlerts = buildForecastAlerts(data.hotels);
  const worseningHotels = buildWorseningHotels(data.hotels);

  const kpis = [
    ["3月実績", formatYen(data.summary.monthlyRevenue), `前月比 ${formatPct(data.summary.revenueDeltaPct)}`],
    ["月末着地見込", formatYen(data.summary.projectedMonthlyRevenue), `${data.summary.elapsedDays}/${data.summary.daysInMonth}日 時点`],
    ["目標達成見込", formatPct(data.summary.avgProjectedTargetAttainmentPct), `現在進捗 ${formatPct(data.summary.avgTargetProgressPct)}`],
    ["要注意ホテル", `${data.summary.atRiskHotels}件`, `悪化ホテル ${data.summary.worsenedHotels}件`],
    ["アップセル候補", `${data.summary.upsellCandidates}件`, "追加提案優先"],
    ["特別清掃売上", formatYen(data.summary.specialCleaningRevenue), "追加売上の現状"],
    ["平均レビュー", `${data.summary.avgReviewScore?.toFixed(1) ?? "未取得"} / 10`, `前月差 ${formatDelta(data.summary.avgReviewDelta, "")}`],
    ["清掃ネガ率", formatPct(data.summary.cleaningNegativeRate), `前月差 ${formatDelta(data.summary.cleaningNegativeRateDelta)}`]
  ];

  const focusItems = [
    { label: "着地見込", value: formatCompactYen(data.summary.projectedMonthlyRevenue), tone: toneForAttainment(data.summary.avgProjectedTargetAttainmentPct) },
    { label: "悪化ホテル", value: `${data.summary.worsenedHotels}件`, tone: data.summary.worsenedHotels > data.summary.improvedHotels ? "high" : "medium" },
    { label: "改善ホテル", value: `${data.summary.improvedHotels}件`, tone: "low" }
  ];

  return (
    <main className="page-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">PRIMECHANGE</p>
          <h1>Executive Dashboard</h1>
          <p className="sidebar-copy">ホテル清掃売上と品質を毎朝判断するための本番画面です。</p>
        </div>
        <div className="sidebar-meta">
          <p>更新時刻</p>
          <strong>{data.updatedAt}</strong>
        </div>
        <div className="sidebar-meta">
          <p>対象ホテル</p>
          <strong>{data.summary.activeHotels}件</strong>
        </div>
      </aside>

      <div className="content">
        <section className="hero-grid">
          <section className="panel hero">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">社長向けサマリー</p>
                <h2>朝の意思決定コメント</h2>
              </div>
            </div>
            <div className="summary-list">
              {data.executiveSummary.map((line) => (
                <article className="summary-item" key={line}>
                  <span className="summary-dot" />
                  <p>{line}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel hero">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">今日の焦点</p>
                <h2>最初に見るべき指標</h2>
              </div>
            </div>
            <div className="focus-strip">
              {focusItems.map((item) => (
                <article className={`focus-card tone-${item.tone}`} key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="kpi-grid">
          {kpis.map(([label, value, meta]) => (
            <KpiCard key={label} label={label} value={value} meta={meta} />
          ))}
        </section>

        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">売上推移</p>
              <h2>2月実績と3月月中進捗</h2>
            </div>
          </div>
          <div className="chart">
            {data.revenueTrend.map((item) => {
              const maxRevenue = Math.max(...data.revenueTrend.map((entry) => entry.revenue));
              const height = Math.max(32, Math.round((item.revenue / maxRevenue) * 220));
              return (
                <article className="bar-group" key={item.month}>
                  <span className="bar-value">{formatCompactYen(item.revenue)}</span>
                  <div className="bar" style={{ height }} />
                  <span className="bar-label">{item.month}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel-grid">
          <ListCard title="品質アラート" subtitle="要注意ホテル">
            <div className="stack">
              {riskHotels.map((hotel) => (
                <article className="list-item" key={hotel.name}>
                  <div className="item-top">
                    <strong>{hotel.name}</strong>
                    <span className={`badge ${hotel.riskLevel}`}>{hotel.riskLevel.toUpperCase()}</span>
                  </div>
                  <p>{hotel.mainIssue}</p>
                  <small>評価 {hotel.avgReview?.toFixed(1) ?? "未取得"} / 清掃ネガ率 {formatPct(hotel.cleaningNegativeRate)}</small>
                </article>
              ))}
            </div>
          </ListCard>

          <ListCard title="営業アクション" subtitle="アップセル候補">
            <div className="stack">
              {upsellHotels.map((hotel) => (
                <article className="list-item" key={hotel.name}>
                  <div className="item-top">
                    <strong>{hotel.name}</strong>
                    <span className={`badge ${hotel.upsellLevel}`}>{hotel.upsellLevel.toUpperCase()}</span>
                  </div>
                  <p>{hotel.nextAction}</p>
                  <small>月商 {formatCompactYen(hotel.monthlyRevenue)} / 着地見込 {formatCompactYen(hotel.projectedRevenue)}</small>
                </article>
              ))}
            </div>
          </ListCard>
        </section>

        <section className="panel-grid">
          <ListCard title="未達見込み" subtitle="90%未満アラート">
            <div className="stack">
              {forecastAlerts.map((hotel) => (
                <article className={`list-item alert-${toneForAttainment(hotel.projectedTargetAttainmentPct)}`} key={hotel.name}>
                  <div className="item-top">
                    <strong>{hotel.name}</strong>
                    <span className={`badge ${toneForAttainment(hotel.projectedTargetAttainmentPct)}`}>
                      {formatPct(hotel.projectedTargetAttainmentPct)}
                    </span>
                  </div>
                  <p>目標達成見込みが低く、月末着地のフォローが必要です。</p>
                  <small>現進捗 {formatPct(hotel.targetProgressPct)} / 着地見込 {formatCompactYen(hotel.projectedRevenue)}</small>
                </article>
              ))}
            </div>
          </ListCard>

          <ListCard title="前月比較" subtitle="悪化ランキング">
            <div className="stack">
              {worseningHotels.map((hotel) => (
                <article className="list-item" key={hotel.name}>
                  <div className="item-top">
                    <strong>{hotel.name}</strong>
                    <span className={`badge ${hotel.riskLevel}`}>{hotel.riskLevel.toUpperCase()}</span>
                  </div>
                  <p>{hotel.mainIssue}</p>
                  <small>
                    レビュー差 {formatDelta(hotel.reviewDelta, "")} / ネガ率差 {formatDelta(hotel.cleaningNegativeRateDelta)} / 利益率差 {formatDelta(hotel.marginDelta)}
                  </small>
                </article>
              ))}
            </div>
          </ListCard>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">全ホテル比較</p>
              <h2>本番運用テーブル</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ホテル</th>
                  <th>3月実績</th>
                  <th>着地見込</th>
                  <th>2月実績</th>
                  <th>達成見込</th>
                  <th>利益率</th>
                  <th>評価差</th>
                  <th>ネガ率差</th>
                  <th>主要課題</th>
                </tr>
              </thead>
              <tbody>
                {data.hotels.map((hotel) => (
                  <tr key={hotel.name} className={toneForAttainment(hotel.projectedTargetAttainmentPct) === "high" ? "row-alert" : ""}>
                    <td>
                      <strong>{hotel.name}</strong>
                      <div className="cell-sub">{hotel.region}</div>
                    </td>
                    <td>{formatCompactYen(hotel.monthlyRevenue)}</td>
                    <td>{formatCompactYen(hotel.projectedRevenue)}</td>
                    <td>{formatCompactYen(hotel.previousRevenue)}</td>
                    <td>{formatPct(hotel.projectedTargetAttainmentPct)}</td>
                    <td>{formatPct(hotel.marginPct)}</td>
                    <td>{formatDelta(hotel.reviewDelta, "")}</td>
                    <td>{formatDelta(hotel.cleaningNegativeRateDelta)}</td>
                    <td>{hotel.mainIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
