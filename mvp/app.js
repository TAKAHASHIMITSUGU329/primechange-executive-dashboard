const data = window.primeChangeDataLive || window.primeChangeData;

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function formatYen(value) {
  return Number.isFinite(value) ? yen.format(value) : "未連携";
}

function formatPct(value, suffix = "%") {
  return Number.isFinite(value) ? `${pct.format(value)}${suffix}` : "未連携";
}

function formatCompactYen(value) {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return `${Math.round(value / 10000).toLocaleString("ja-JP")}万円`;
}

function formatGap(current, target) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return "未連携";
  }
  const gap = current - target;
  const sign = gap > 0 ? "+" : "";
  return `${sign}${Math.round(gap / 10000).toLocaleString("ja-JP")}万円`;
}

function formatScore(value) {
  return Number.isFinite(value) ? pct.format(value) : "未取得";
}

function formatDelta(value, suffix = "pt") {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${pct.format(value)}${suffix}`;
}

function attainmentTone(value) {
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

function renderExecutiveSummary() {
  const items = data.executiveSummary || [];
  document.getElementById("executive-summary").innerHTML = items
    .map(
      (item) => `
        <article class="summary-item">
          <span class="summary-mark"></span>
          <p>${item}</p>
        </article>
      `
    )
    .join("");

  const focusItems = [
    {
      label: "着地見込",
      value: formatCompactYen(data.summary.projectedMonthlyRevenue),
      tone: attainmentTone(data.summary.avgProjectedTargetAttainmentPct)
    },
    {
      label: "悪化ホテル",
      value: `${data.summary.worsenedHotels}件`,
      tone: data.summary.worsenedHotels > data.summary.improvedHotels ? "high" : "medium"
    },
    {
      label: "要注意",
      value: `${data.summary.atRiskHotels}件`,
      tone: data.summary.atRiskHotels >= 4 ? "high" : "medium"
    }
  ];

  document.getElementById("focus-strip").innerHTML = focusItems
    .map(
      (item) => `
        <article class="focus-card tone-${item.tone}">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `
    )
    .join("");
}

function renderKpis() {
  const items = [
    ["当月売上", formatYen(data.summary.monthlyRevenue), `前月比 ${formatPct(data.summary.revenueDeltaPct)}`],
    ["前月売上", formatYen(data.summary.previousMonthlyRevenue), `${PREVIOUS_MONTH_LABEL} 実績`],
    [
      "月末着地見込",
      formatYen(data.summary.projectedMonthlyRevenue),
      `${data.summary.elapsedDays}/${data.summary.daysInMonth}日 時点`
    ],
    [
      "目標達成見込",
      formatPct(data.summary.avgProjectedTargetAttainmentPct),
      `現在進捗 ${formatPct(data.summary.avgTargetProgressPct)}`
    ],
    ["アクティブホテル数", `${data.summary.activeHotels}件`, "契約中ホテル"],
    ["要注意ホテル", `${data.summary.atRiskHotels}件`, "品質悪化または不満増加"],
    ["アップセル候補", `${data.summary.upsellCandidates}件`, "追加提案優先"],
    ["特別清掃売上", formatYen(data.summary.specialCleaningRevenue), "追加売上の現状"],
    ["平均レビュー", `${pct.format(data.summary.avgReviewScore)} / 10`, `前月差 ${formatDelta(data.summary.avgReviewDelta, "")}`],
    ["清掃ネガ率", `${pct.format(data.summary.cleaningNegativeRate)}%`, `前月差 ${formatDelta(data.summary.cleaningNegativeRateDelta)}`],
    ["改善/悪化", `${data.summary.improvedHotels} / ${data.summary.worsenedHotels}`, "改善ホテル数 / 悪化ホテル数"]
  ];

  document.getElementById("kpi-grid").innerHTML = items
    .map(
      ([label, value, delta]) => `
        <article class="kpi">
          <p class="kpi-label">${label}</p>
          <p class="kpi-value">${value}</p>
          <div class="kpi-delta">${delta}</div>
        </article>
      `
    )
    .join("");
}

const PREVIOUS_MONTH_LABEL = "2026年2月";

function renderChart() {
  if (!data.revenueTrend.length) {
    document.getElementById("revenue-chart").innerHTML =
      '<div class="empty-state">売上推移データはまだ未連携です。契約売上データを接続すると表示されます。</div>';
    return;
  }

  const maxRevenue = Math.max(...data.revenueTrend.map((item) => item.revenue));
  document.getElementById("revenue-chart").innerHTML = data.revenueTrend
    .map((item) => {
      const height = Math.round((item.revenue / maxRevenue) * 170) + 30;
      return `
        <div class="bar-group">
          <div class="bar-value">${Math.round(item.revenue / 10000)}万円</div>
          <div class="bar" style="height:${height}px"></div>
          <div class="bar-label">${item.month}</div>
        </div>
      `;
    })
    .join("");
}

function renderHotelLists() {
  const riskHotels = data.hotels
    .filter((hotel) => hotel.riskLevel === "high" || hotel.riskLevel === "medium")
    .sort((a, b) => {
      const riskWeight = { high: 2, medium: 1, low: 0 };
      return (
        riskWeight[b.riskLevel] - riskWeight[a.riskLevel] ||
        b.cleaningNegativeRate - a.cleaningNegativeRate ||
        (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0)
      );
    });

  const upsellHotels = data.hotels
    .filter((hotel) => hotel.upsellLevel === "high")
    .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0));

  document.getElementById("risk-hotels").innerHTML = riskHotels
    .map(
      (hotel) => `
        <article class="item">
          <div class="item-top">
            <strong>${hotel.name}</strong>
            <span class="badge ${hotel.riskLevel}">${hotel.riskLevel.toUpperCase()}</span>
          </div>
          <p>${hotel.mainIssue}</p>
          <small>評価 ${formatScore(hotel.avgReview)} / 清掃ネガ率 ${pct.format(hotel.cleaningNegativeRate)}%</small>
        </article>
      `
    )
    .join("");

  document.getElementById("upsell-hotels").innerHTML = upsellHotels
    .map(
      (hotel) => `
        <article class="item">
          <div class="item-top">
            <strong>${hotel.name}</strong>
            <span class="badge ${hotel.upsellLevel}">${hotel.upsellLevel.toUpperCase()}</span>
          </div>
          <p>${hotel.nextAction}</p>
          <small>月商 ${formatCompactYen(hotel.monthlyRevenue)} / 目標差 ${formatGap(
            hotel.monthlyRevenue,
            hotel.targetRevenue
          )} / 着地見込 ${formatCompactYen(hotel.projectedRevenue)}</small>
        </article>
      `
    )
    .join("");

  const forecastAlerts = data.hotels
    .filter((hotel) => Number.isFinite(hotel.projectedTargetAttainmentPct) && hotel.projectedTargetAttainmentPct < 90)
    .sort((a, b) => a.projectedTargetAttainmentPct - b.projectedTargetAttainmentPct)
    .slice(0, 6);

  const worseningHotels = data.hotels
    .filter(
      (hotel) =>
        Number.isFinite(hotel.cleaningNegativeRateDelta) ||
        Number.isFinite(hotel.reviewDelta) ||
        Number.isFinite(hotel.marginDelta)
    )
    .map((hotel) => ({
      ...hotel,
      worsenScore:
        (Number.isFinite(hotel.cleaningNegativeRateDelta) ? hotel.cleaningNegativeRateDelta * 2 : 0) +
        (Number.isFinite(hotel.reviewDelta) && hotel.reviewDelta < 0 ? Math.abs(hotel.reviewDelta) * 5 : 0) +
        (Number.isFinite(hotel.marginDelta) && hotel.marginDelta < 0 ? Math.abs(hotel.marginDelta) : 0)
    }))
    .sort((a, b) => b.worsenScore - a.worsenScore)
    .slice(0, 6);

  document.getElementById("forecast-alerts").innerHTML = forecastAlerts
    .map(
      (hotel) => `
        <article class="item alert-${attainmentTone(hotel.projectedTargetAttainmentPct)}">
          <div class="item-top">
            <strong>${hotel.name}</strong>
            <span class="badge ${attainmentTone(hotel.projectedTargetAttainmentPct)}">${formatPct(
              hotel.projectedTargetAttainmentPct
            )}</span>
          </div>
          <p>達成見込みが低く、月末着地のフォローが必要です。</p>
          <small>現進捗 ${formatPct(hotel.targetProgressPct)} / 着地見込 ${formatCompactYen(
            hotel.projectedRevenue
          )}</small>
        </article>
      `
    )
    .join("");

  document.getElementById("worsening-hotels").innerHTML = worseningHotels
    .map(
      (hotel) => `
        <article class="item">
          <div class="item-top">
            <strong>${hotel.name}</strong>
            <span class="badge ${hotel.riskLevel}">${hotel.riskLevel.toUpperCase()}</span>
          </div>
          <p>${hotel.mainIssue}</p>
          <small>レビュー差 ${formatDelta(hotel.reviewDelta, "")} / ネガ率差 ${formatDelta(
            hotel.cleaningNegativeRateDelta
          )} / 利益率差 ${formatDelta(hotel.marginDelta)}</small>
        </article>
      `
    )
    .join("");
}

function renderTable() {
  document.getElementById("hotel-table-body").innerHTML = data.hotels
    .map(
      (hotel) => `
        <tr class="${attainmentTone(hotel.projectedTargetAttainmentPct) === "high" ? "row-alert" : ""}">
          <td>${hotel.name}</td>
          <td>${hotel.region}</td>
          <td>${formatCompactYen(hotel.monthlyRevenue)}</td>
          <td>${formatCompactYen(hotel.projectedRevenue)}</td>
          <td>${formatCompactYen(hotel.previousRevenue)}</td>
          <td>${formatGap(hotel.monthlyRevenue, hotel.targetRevenue)}</td>
          <td>${formatPct(hotel.targetProgressPct)}</td>
          <td>${formatPct(hotel.projectedTargetAttainmentPct)}</td>
          <td>${formatPct(hotel.marginPct)}</td>
          <td>${formatDelta(hotel.marginDelta)}</td>
          <td>${formatPct(hotel.occupancyPct)}</td>
          <td>${formatDelta(hotel.occupancyDelta)}</td>
          <td>${formatScore(hotel.avgReview)}</td>
          <td>${formatDelta(hotel.reviewDelta, "")}</td>
          <td>${pct.format(hotel.cleaningNegativeRate)}%</td>
          <td>${formatDelta(hotel.cleaningNegativeRateDelta)}</td>
          <td>${formatCompactYen(hotel.specialCleaningRevenue)}</td>
          <td>${hotel.mainIssue}</td>
          <td>${hotel.nextAction}</td>
        </tr>
      `
    )
    .join("");
}

function renderActions() {
  document.getElementById("action-list").innerHTML = data.actions
    .map(
      (action) => `
        <article class="action-item">
          <div class="item-top">
            <strong>${action.hotel}</strong>
            <span class="badge priority-${action.priority.toLowerCase()}">${action.priority}</span>
          </div>
          <p>${action.reason}</p>
          <small>Owner: ${action.owner}</small>
        </article>
      `
    )
    .join("");
}

function init() {
  document.getElementById("updated-at").textContent = `Updated: ${data.updatedAt}`;
  renderExecutiveSummary();
  renderKpis();
  renderChart();
  renderHotelLists();
  renderTable();
  renderActions();
}

init();
