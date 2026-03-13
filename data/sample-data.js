window.primeChangeData = {
  updatedAt: "2026-03-13 09:00 JST",
  summary: {
    monthlyRevenue: 18450000,
    revenueDeltaPct: 8.4,
    activeHotels: 19,
    atRiskHotels: 4,
    upsellCandidates: 6,
    specialCleaningRevenue: 1320000,
    avgReviewScore: 8.4,
    cleaningNegativeRate: 11.8
  },
  revenueTrend: [
    { month: "2025-10", revenue: 15300000 },
    { month: "2025-11", revenue: 15900000 },
    { month: "2025-12", revenue: 16500000 },
    { month: "2026-01", revenue: 17150000 },
    { month: "2026-02", revenue: 17020000 },
    { month: "2026-03", revenue: 18450000 }
  ],
  hotels: [
    {
      name: "ダイワロイネットホテル東京大崎",
      region: "東京",
      monthlyRevenue: 1680000,
      marginPct: 21.4,
      avgReview: 8.7,
      cleaningNegativeRate: 9.2,
      mainIssue: "水回りの臭い",
      mainPraise: "清潔感",
      riskLevel: "medium",
      upsellLevel: "high",
      nextAction: "臭気対策と水回り重点点検を提案"
    },
    {
      name: "コンフォートイン六本木",
      region: "東京",
      monthlyRevenue: 1240000,
      marginPct: 18.9,
      avgReview: 8.1,
      cleaningNegativeRate: 14.6,
      mainIssue: "清掃不足感",
      mainPraise: "スタッフ対応",
      riskLevel: "high",
      upsellLevel: "medium",
      nextAction: "客室仕上がり監査を増やす"
    },
    {
      name: "アパホテル蒲田駅東",
      region: "東京",
      monthlyRevenue: 980000,
      marginPct: 16.8,
      avgReview: 7.8,
      cleaningNegativeRate: 12.4,
      mainIssue: "館内清潔感のばらつき",
      mainPraise: "立地",
      riskLevel: "high",
      upsellLevel: "low",
      nextAction: "共用部点検の追加導入を検討"
    },
    {
      name: "コンフォートホテル博多",
      region: "福岡",
      monthlyRevenue: 1110000,
      marginPct: 24.1,
      avgReview: 8.9,
      cleaningNegativeRate: 5.4,
      mainIssue: "特記事項なし",
      mainPraise: "清潔感と朝食",
      riskLevel: "low",
      upsellLevel: "high",
      nextAction: "高品質事例として横展開"
    },
    {
      name: "川崎日航ホテル",
      region: "神奈川",
      monthlyRevenue: 1430000,
      marginPct: 19.6,
      avgReview: 8.5,
      cleaningNegativeRate: 7.3,
      mainIssue: "設備古さ由来の不満",
      mainPraise: "立地と安定感",
      riskLevel: "low",
      upsellLevel: "medium",
      nextAction: "特別清掃メニューの提案余地を確認"
    }
  ],
  actions: [
    {
      priority: "High",
      hotel: "コンフォートイン六本木",
      reason: "清掃関連ネガティブ率が前月比で上昇",
      owner: "Operations"
    },
    {
      priority: "High",
      hotel: "アパホテル蒲田駅東",
      reason: "低評価レビューが継続し品質是正が必要",
      owner: "Operations"
    },
    {
      priority: "Medium",
      hotel: "ダイワロイネットホテル東京大崎",
      reason: "臭気対策を起点に追加サービス提案が可能",
      owner: "Sales"
    },
    {
      priority: "Medium",
      hotel: "コンフォートホテル博多",
      reason: "高評価実績を他ホテル標準へ展開したい",
      owner: "Management"
    }
  ]
};
