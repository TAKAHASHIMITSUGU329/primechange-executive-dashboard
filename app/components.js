import Link from "next/link";
import {
  formatCompactYen,
  formatDelta,
  formatPct,
  toneForAttainment
} from "../lib/dashboard-helpers";

const navItems = [
  { href: "/", label: "ポータル" },
  { href: "/hotel-dashboard/", label: "ホテル別口コミ" },
  { href: "/cleaning-strategy/", label: "清掃戦略" },
  { href: "/deep-analysis/", label: "深掘り分析" },
  { href: "/revenue-impact/", label: "品質×売上" },
  { href: "/action-plans/", label: "アクションプラン" }
];

export function DashboardShell({ currentPath, title, subtitle, updatedAt, children }) {
  return (
    <div className="portal-shell">
      <nav className="main-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            PRIMECHANGE
          </Link>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${currentPath === item.href ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="portal-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
          <div className="page-stamp">
            <span>更新時刻</span>
            <strong>{updatedAt}</strong>
          </div>
        </header>
        {children}
      </main>
      <footer className="footer">© 2026 PRIMECHANGE Executive Portal</footer>
    </div>
  );
}

export function KpiCard({ label, value, sub, tone = "accent" }) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </article>
  );
}

export function LinkCard({ href, icon, title, description, stat }) {
  return (
    <Link href={href} className="link-card">
      <article className="card link-card-inner">
        <div className="link-card-icon">{icon}</div>
        <div className="link-card-title">{title}</div>
        <div className="link-card-desc">{description}</div>
        <div className="link-card-stat">{stat}</div>
      </article>
    </Link>
  );
}

export function AlertHotelCard({ hotel }) {
  return (
    <article className="alert-item">
      <div className="alert-item-title">{hotel.name}</div>
      <div className="alert-item-detail">
        スコア: <strong>{hotel.avgReview?.toFixed(1) ?? "未取得"}</strong> / 清掃課題率:{" "}
        <strong>{formatPct(hotel.cleaningNegativeRate)}</strong>
      </div>
      <div className="alert-item-sub">
        主要課題: {hotel.mainIssue} / 利益率差 {formatDelta(hotel.marginDelta)}
      </div>
    </article>
  );
}

export function GoalCard({ goal }) {
  const ratio = Number.isFinite(goal.value) && Number.isFinite(goal.target) && goal.target !== 0
    ? Math.max(0, Math.min(100, (goal.lowerIsBetter ? (goal.target / goal.value) * 100 : (goal.value / goal.target) * 100)))
    : 0;
  const tone = goal.lowerIsBetter
    ? goal.value <= goal.target ? "good" : "warn"
    : goal.value >= goal.target ? "good" : "warn";

  return (
    <article className="goal-card">
      <div className="goal-head">
        <span>{goal.label}</span>
        <strong className={`goal-tone ${tone}`}>{Number.isFinite(goal.value) ? `${goal.value.toFixed(1)}${goal.unit}` : "未連携"}</strong>
      </div>
      <div className="goal-track">
        <div className={`goal-fill ${tone}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
      </div>
      <div className="goal-meta">目標 {goal.target}{goal.unit}</div>
    </article>
  );
}

export function TrendBars({ items }) {
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1);
  return (
    <div className="trend-bars">
      {items.map((item) => (
        <article className="trend-bar-group" key={item.month}>
          <span className="trend-value">{formatCompactYen(item.revenue)}</span>
          <div className="trend-bar" style={{ height: `${Math.max(56, (item.revenue / maxRevenue) * 220)}px` }} />
          <span className="trend-label">{item.month}</span>
        </article>
      ))}
    </div>
  );
}

export function HotelTable({ hotels, columns }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.name} className={toneForAttainment(hotel.projectedTargetAttainmentPct) === "high" ? "row-alert" : ""}>
              {columns.map((column) => (
                <td key={`${hotel.name}-${column.label}`}>{column.render(hotel)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InsightList({ hotels, variant = "risk" }) {
  return (
    <div className="stack">
      {hotels.map((hotel) => (
        <article
          className={`list-item ${variant === "forecast" ? `alert-${toneForAttainment(hotel.projectedTargetAttainmentPct)}` : ""}`}
          key={hotel.name}
        >
          <div className="item-top">
            <strong>{hotel.name}</strong>
            <span className={`badge ${variant === "forecast" ? toneForAttainment(hotel.projectedTargetAttainmentPct) : hotel.riskLevel}`}>
              {variant === "forecast" ? formatPct(hotel.projectedTargetAttainmentPct) : hotel.riskLevel.toUpperCase()}
            </span>
          </div>
          <p>{hotel.mainIssue}</p>
          <small>
            {variant === "forecast"
              ? `現進捗 ${formatPct(hotel.targetProgressPct)} / 着地見込 ${formatCompactYen(hotel.projectedRevenue)}`
              : `評価 ${hotel.avgReview?.toFixed(1) ?? "未取得"} / 清掃ネガ率 ${formatPct(hotel.cleaningNegativeRate)}`}
          </small>
        </article>
      ))}
    </div>
  );
}
