"use client";

import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { MODELS, CURRENT_YEAR } from "@/constants/models";

// ... (formatMoney, parseFormattedMoney 関数)

export default function InvestmentSimulator() {
  // ... (state)

  const handleCalculate = () => {
    // ... (入力バリデーション、モデルデータの取得など)

    "use client";

// ... (インポート)

// ... (formatMoney, parseFormattedMoney 関数)

export default function InvestmentSimulator() {
  // ... (state)

  const handleCalculate = () => {
    // ... (入力バリデーション、モデルデータの取得など)

    const newResults: {
      year: number;
      cagr: string;
      btcPrice: string;
      annualInvestment: string;
      btcPurchased: string;
      totalBtc: string;
      totalValue: string;
      btcPriceUsd: number;
      totalBtcRaw: number;
    }[] = []; // resultの型を明示的に定義

    let totalBtc = parseFloat(btcAmount as string);
    let btcPriceUsd = model.startPrice; // 初期値設定 (誤って const で再宣言しないように注意)
    let totalInvestment = 0

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;
      const yearlyInvestment = parseFloat(monthlyInvestment as string) * 12 * 1_0000; // 年間投資額をループ内で計算

      btcPriceUsd *= (1 + cagr); // 毎年の価格を更新 (USD, 再宣言しない)
      const btcPriceJpy = btcPriceUsd * usdJpyRate;

      const btcPurchased = yearlyInvestment / btcPriceJpy;
      totalBtc += btcPurchased;
      totalInvestment += yearlyInvestment

      const totalValue = totalBtc * btcPriceJpy;

      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        annualInvestment: formatMoney(yearlyInvestment),
        btcPurchased: `${btcPurchased.toFixed(4)} BTC`,
        totalBtc: `${totalBtc.toFixed(4)} BTC`,
        totalValue: formatMoney(totalValue),
        btcPriceUsd, // 計算用 (USD)
        totalBtcRaw: totalBtc,
      });
    }

    setResults(newResults);
  };

  // ... (chartData, chartOptions, JSX は変更なし)
}