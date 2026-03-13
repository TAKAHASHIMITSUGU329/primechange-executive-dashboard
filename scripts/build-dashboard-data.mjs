import { mkdir, writeFile } from "node:fs/promises";

const MASTER_SHEET_ID = "1f3DjbrRJifbIK1n-Xpfup-O5cFExnqr4G3cs75Aa43U";
const MASTER_GID = "117684960";
const MASTER_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${MASTER_SHEET_ID}/export?format=csv&gid=${MASTER_GID}`;

const POSITIVE_CATEGORIES = {
  清潔感: ["清潔", "きれい", "綺麗", "clean", "tidy", "well maintained", "清掃"],
  スタッフ対応: ["スタッフ", "親切", "helpful", "friendly", "service", "接客"],
  立地: ["立地", "駅近", "location", "station", "便利", "アクセス"],
  朝食: ["朝食", "breakfast", "ビュッフェ"],
  快適性: ["快適", "静か", "comfortable", "居心地", "quiet"]
};

const NEGATIVE_CATEGORIES = {
  水回り臭気: ["臭い", "におい", "匂い", "下水", "sewage", "smell", "odor", "odour"],
  仕上がり不足: ["汚", "ほこり", "埃", "髪", "dirty", "not so clean", "unclean", "dust"],
  "薬剤・アレルギー": ["アレルギー", "allergy", "chemicals", "洗剤", "pests", "害虫"],
  設備老朽化: ["古い", "old", "老朽", "古さ"],
  騒音: ["騒音", "noise", "うるさい", "noisy"]
};

const CLEANING_KEYWORDS = [
  "清潔",
  "きれい",
  "綺麗",
  "清掃",
  "汚",
  "ほこり",
  "埃",
  "髪",
  "臭い",
  "におい",
  "匂い",
  "下水",
  "sewage",
  "smell",
  "odour",
  "odor",
  "allergy",
  "アレルギー",
  "洗剤",
  "dirty",
  "clean",
  "tidy"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

async function fetchCsv(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function findHeaderIndex(rows) {
  return rows.findIndex((row) => row.includes("サイト名") && row.includes("評価") && row.includes("投稿日"));
}

function normalizeRating(source, rawRating) {
  const value = Number(rawRating);
  if (!Number.isFinite(value)) {
    return null;
  }

  const fivePointSources = ["Google", "じゃらん", "楽天トラベル"];
  if (fivePointSources.includes(source) || value <= 5) {
    return value * 2;
  }

  return value;
}

function getCategory(text, dictionary) {
  const target = `${text || ""}`.toLowerCase();
  for (const [category, keywords] of Object.entries(dictionary)) {
    if (keywords.some((keyword) => target.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return "未分類";
}

function isCleaningRelated(text) {
  const target = `${text || ""}`.toLowerCase();
  return CLEANING_KEYWORDS.some((keyword) => target.includes(keyword.toLowerCase()));
}

function inferRiskLevel(avgReview, cleaningNegativeRate) {
  if (avgReview < 8 || cleaningNegativeRate >= 12) {
    return "high";
  }
  if (avgReview < 8.6 || cleaningNegativeRate >= 7) {
    return "medium";
  }
  return "low";
}

function inferUpsellLevel(hotel) {
  if (hotel.reviewCount >= 20 && hotel.cleaningNegativeRate >= 4 && hotel.cleaningNegativeRate < 12) {
    return "high";
  }
  if (hotel.reviewCount >= 10) {
    return "medium";
  }
  return "low";
}

function buildNextAction(mainIssue, riskLevel) {
  const actions = {
    水回り臭気: "臭気対策と水回り重点点検を提案",
    仕上がり不足: "客室仕上がり監査と最終チェック強化を提案",
    "薬剤・アレルギー": "洗剤運用と寝具まわり点検の見直しを提案",
    設備老朽化: "設備由来不満と清掃改善の切り分け報告を実施",
    騒音: "清掃起因外のためホテル側課題として切り分け報告",
    未分類: riskLevel === "low" ? "高評価運用を標準化して横展開" : "レビュー内容の手動確認を優先"
  };

  return actions[mainIssue] || actions.未分類;
}

function topCategory(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] || "特記事項なし";
}

function uniqueKey(review) {
  return [
    review.source,
    review.reviewDate,
    review.author,
    review.ratingRaw,
    review.fullComment,
    review.positiveComment,
    review.negativeComment
  ].join("|");
}

function parseReviews(rows, hotelName) {
  const headerIndex = findHeaderIndex(rows);
  if (headerIndex === -1) {
    return [];
  }

  const reviews = [];
  const seen = new Set();

  for (const row of rows.slice(headerIndex + 1)) {
    const source = row[2]?.trim();
    const ratingRaw = row[3]?.trim();
    const reviewDate = row[4]?.trim();

    if (!source || !ratingRaw || !reviewDate) {
      continue;
    }

    const review = {
      hotelName,
      source,
      ratingRaw,
      normalizedRating: normalizeRating(source, ratingRaw),
      reviewDate,
      fullComment: row[5]?.trim() || "",
      positiveComment: row[6]?.trim() || "",
      negativeComment: row[7]?.trim() || "",
      author: row[11]?.trim() || "不明"
    };

    review.positiveCategory = getCategory(`${review.fullComment} ${review.positiveComment}`, POSITIVE_CATEGORIES);
    review.negativeCategory = getCategory(`${review.fullComment} ${review.negativeComment}`, NEGATIVE_CATEGORIES);
    review.cleaningRelated = isCleaningRelated(
      `${review.fullComment} ${review.positiveComment} ${review.negativeComment}`
    );

    const key = uniqueKey(review);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    reviews.push(review);
  }

  return reviews;
}

function aggregateHotel(hotelName, reviews) {
  const normalizedRatings = reviews.map((review) => review.normalizedRating).filter(Number.isFinite);
  const avgReview = normalizedRatings.length
    ? normalizedRatings.reduce((sum, value) => sum + value, 0) / normalizedRatings.length
    : 0;

  const positiveCounts = {};
  const negativeCounts = {};
  let cleaningNegativeCount = 0;
  let cleaningPositiveCount = 0;

  for (const review of reviews) {
    positiveCounts[review.positiveCategory] = (positiveCounts[review.positiveCategory] || 0) + 1;
    negativeCounts[review.negativeCategory] = (negativeCounts[review.negativeCategory] || 0) + 1;

    if (review.cleaningRelated && review.negativeComment) {
      cleaningNegativeCount += 1;
    }

    if (review.cleaningRelated && (review.positiveComment || review.fullComment)) {
      cleaningPositiveCount += 1;
    }
  }

  const reviewCount = reviews.length;
  const cleaningNegativeRate = reviewCount ? (cleaningNegativeCount / reviewCount) * 100 : 0;
  const riskLevel = inferRiskLevel(avgReview, cleaningNegativeRate);
  const mainIssue = topCategory(negativeCounts);

  const hotel = {
    name: hotelName,
    region: "未設定",
    monthlyRevenue: null,
    marginPct: null,
    avgReview: Number(avgReview.toFixed(1)),
    reviewCount,
    cleaningNegativeRate: Number(cleaningNegativeRate.toFixed(1)),
    cleaningPositiveCount,
    cleaningNegativeCount,
    mainIssue,
    mainPraise: topCategory(positiveCounts),
    riskLevel,
    upsellLevel: "low",
    nextAction: ""
  };

  hotel.upsellLevel = inferUpsellLevel(hotel);
  hotel.nextAction = buildNextAction(mainIssue, riskLevel);

  return hotel;
}

function buildActions(hotels) {
  return hotels
    .filter((hotel) => hotel.riskLevel !== "low" || hotel.upsellLevel === "high")
    .sort((a, b) => {
      const riskWeight = { high: 2, medium: 1, low: 0 };
      return (
        riskWeight[b.riskLevel] - riskWeight[a.riskLevel] ||
        b.cleaningNegativeRate - a.cleaningNegativeRate ||
        b.reviewCount - a.reviewCount
      );
    })
    .slice(0, 8)
    .map((hotel) => ({
      priority: hotel.riskLevel === "high" ? "High" : hotel.upsellLevel === "high" ? "Medium" : "Low",
      hotel: hotel.name,
      reason:
        hotel.riskLevel === "high"
          ? `清掃関連ネガ率 ${hotel.cleaningNegativeRate}% / 主課題: ${hotel.mainIssue}`
          : `追加提案余地あり / 主課題: ${hotel.mainIssue}`,
      owner: hotel.riskLevel === "high" ? "Operations" : "Sales"
    }));
}

function buildDashboardData(hotels, reviews) {
  const activeHotels = hotels.length;
  const atRiskHotels = hotels.filter((hotel) => hotel.riskLevel === "high").length;
  const upsellCandidates = hotels.filter((hotel) => hotel.upsellLevel === "high").length;
  const avgReviewScore = hotels.length
    ? hotels.reduce((sum, hotel) => sum + hotel.avgReview, 0) / hotels.length
    : 0;
  const totalReviews = reviews.length;
  const totalCleaningNegative = hotels.reduce((sum, hotel) => sum + hotel.cleaningNegativeCount, 0);
  const cleaningNegativeRate = totalReviews ? (totalCleaningNegative / totalReviews) * 100 : 0;

  return {
    updatedAt: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    summary: {
      monthlyRevenue: null,
      revenueDeltaPct: null,
      activeHotels,
      atRiskHotels,
      upsellCandidates,
      specialCleaningRevenue: null,
      avgReviewScore: Number(avgReviewScore.toFixed(1)),
      cleaningNegativeRate: Number(cleaningNegativeRate.toFixed(1))
    },
    revenueTrend: [],
    hotels,
    actions: buildActions(hotels),
    metadata: {
      sourceSheetId: MASTER_SHEET_ID,
      sourceGid: MASTER_GID,
      reviewCount: totalReviews,
      note: "売上・利益などの財務項目は未連携のため null"
    }
  };
}

async function main() {
  const masterCsv = await fetchCsv(MASTER_EXPORT_URL);
  const masterRows = parseCsv(masterCsv).slice(1).filter((row) => row[0] && row[1]);

  const hotels = [];
  const reviews = [];

  for (const row of masterRows) {
    const hotelName = row[2]?.trim() || row[0]?.trim();
    const reportUrl = row[1]?.trim();
    const sheetId = extractSheetId(reportUrl);

    if (!sheetId) {
      console.warn(`Skipping ${hotelName}: sheet id not found.`);
      continue;
    }

    try {
      console.log(`Fetching ${hotelName}...`);
      const reportCsv = await fetchCsv(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`);
      const reportRows = parseCsv(reportCsv);
      const hotelReviews = parseReviews(reportRows, hotelName);
      hotels.push(aggregateHotel(hotelName, hotelReviews));
      reviews.push(...hotelReviews);
    } catch (error) {
      console.warn(`Skipping ${hotelName}: ${error.message}`);
    }
  }

  const dashboardData = buildDashboardData(hotels, reviews);

  await mkdir(new URL("../data", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../data/generated-dashboard.json", import.meta.url),
    JSON.stringify(dashboardData, null, 2),
    "utf8"
  );
  await writeFile(
    new URL("../data/live-data.js", import.meta.url),
    `window.primeChangeDataLive = ${JSON.stringify(dashboardData, null, 2)};\n`,
    "utf8"
  );

  console.log(`Generated dashboard data for ${dashboardData.summary.activeHotels} hotels.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
