import fs from "node:fs";
import path from "node:path";

const fallbackData = {
  updatedAt: "未生成",
  summary: {},
  revenueTrend: [],
  hotels: [],
  actions: [],
  executiveSummary: ["ダッシュボードデータがまだ生成されていません。"]
};

export function getDashboardData() {
  const filePath = path.join(process.cwd(), "data", "generated-dashboard.json");

  if (!fs.existsSync(filePath)) {
    return fallbackData;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallbackData;
  }
}
