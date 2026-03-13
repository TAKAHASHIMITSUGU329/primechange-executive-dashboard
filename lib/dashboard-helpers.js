export function formatYen(value) {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCompactYen(value) {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return `${Math.round(value / 10000).toLocaleString("ja-JP")}万円`;
}

export function formatPct(value, suffix = "%") {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  return `${value.toFixed(1)}${suffix}`;
}

export function formatDelta(value, suffix = "pt") {
  if (!Number.isFinite(value)) {
    return "未連携";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

export function toneForAttainment(value) {
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

export function getWeightedAverageScore(hotels) {
  const weightedTotal = hotels.reduce(
    (sum, hotel) => sum + (hotel.avgReview || 0) * (hotel.reviewCount || 0),
    0
  );
  const totalReviews = hotels.reduce((sum, hotel) => sum + (hotel.reviewCount || 0), 0);
  return totalReviews ? weightedTotal / totalReviews : null;
}

export function getHighScoreRate(hotels) {
  const totalReviews = hotels.reduce((sum, hotel) => sum + (hotel.reviewCount || 0), 0);
  const highScoreReviews = hotels.reduce((sum, hotel) => {
    if (!Number.isFinite(hotel.avgReview) || !hotel.reviewCount) {
      return sum;
    }
    return sum + (hotel.avgReview >= 8 ? hotel.reviewCount : 0);
  }, 0);
  return totalReviews ? (highScoreReviews / totalReviews) * 100 : null;
}

export function getCleaningIssueCount(hotels) {
  return hotels.reduce((sum, hotel) => sum + (hotel.cleaningNegativeCount || 0), 0);
}

export function getRiskHotels(hotels, limit = 6) {
  const riskWeight = { high: 2, medium: 1, low: 0 };
  return hotels
    .filter((hotel) => hotel.riskLevel === "high" || hotel.riskLevel === "medium")
    .sort(
      (a, b) =>
        riskWeight[b.riskLevel] - riskWeight[a.riskLevel] ||
        b.cleaningNegativeRate - a.cleaningNegativeRate ||
        (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0)
    )
    .slice(0, limit);
}

export function getUpsellHotels(hotels, limit = 6) {
  return hotels
    .filter((hotel) => hotel.upsellLevel === "high")
    .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
    .slice(0, limit);
}

export function getForecastAlerts(hotels, limit = 6) {
  return hotels
    .filter((hotel) => Number.isFinite(hotel.projectedTargetAttainmentPct) && hotel.projectedTargetAttainmentPct < 90)
    .sort((a, b) => a.projectedTargetAttainmentPct - b.projectedTargetAttainmentPct)
    .slice(0, limit);
}

export function getWorseningHotels(hotels, limit = 6) {
  return hotels
    .map((hotel) => ({
      ...hotel,
      worsenScore:
        (Number.isFinite(hotel.cleaningNegativeRateDelta) ? hotel.cleaningNegativeRateDelta * 2 : 0) +
        (Number.isFinite(hotel.reviewDelta) && hotel.reviewDelta < 0 ? Math.abs(hotel.reviewDelta) * 5 : 0) +
        (Number.isFinite(hotel.marginDelta) && hotel.marginDelta < 0 ? Math.abs(hotel.marginDelta) : 0)
    }))
    .sort((a, b) => b.worsenScore - a.worsenScore)
    .slice(0, limit);
}

export function getGoalCards(summary) {
  return [
    {
      label: "平均スコア",
      value: summary.avgReviewScore,
      target: 8.9,
      unit: "",
      lowerIsBetter: false
    },
    {
      label: "清掃課題率",
      value: summary.cleaningNegativeRate,
      target: 3.0,
      unit: "%",
      lowerIsBetter: true
    },
    {
      label: "目標達成見込",
      value: summary.avgProjectedTargetAttainmentPct,
      target: 100,
      unit: "%",
      lowerIsBetter: false
    },
    {
      label: "悪化ホテル数",
      value: summary.worsenedHotels,
      target: 4,
      unit: "件",
      lowerIsBetter: true
    }
  ];
}
