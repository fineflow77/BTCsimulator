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

// 金額をフォーマットする関数
const formatMoney = (amount: number): string => {
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(2)}億円`;
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(1)}万円`;
  return `${amount.toFixed(0)}円`;
};

// ... (インポート)

// ... (formatMoney, parseFormattedMoney 関数)

export default function InvestmentSimulator() {
  // ... (state)

  const handleCalculate = () => {
    // ... (入力バリデーション)

    const model = MODELS[modelKey];
    if (!model || !model.cagr) {
      setErrorMessage("選択したモデルまたはCAGRデータが無効です。");
      return;
    }

    const yearlyInvestment = parseFloat(monthlyInvestment as string) * 12 * 1_0000;
    let totalInvestment = 0;
    let totalBtc = parseFloat(btcAmount as string);
    let btcPriceUsd = model.startPrice; // 初期値を明示的に設定
    const newResults: {
      year: number;
      cagr: string;
      btcPrice: string;
      annualInvestment: string;
      btcPurchased: string;
      totalBtc: string;
      totalValue: string;
      btcPriceUsd: number; // btcPriceUsd を number 型に
      totalBtcRaw: number;
    }[] = []; // results の型を明示的に定義

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;

      btcPriceUsd = btcPriceUsd * (1 + cagr); // 今年のBTC価格を計算 (USD)
      const btcPriceJpy = btcPriceUsd * usdJpyRate;
      const btcPurchased = yearlyInvestment / btcPriceJpy;
      totalBtc += btcPurchased;
      totalInvestment += yearlyInvestment;
      const totalValue = totalBtc * btcPriceJpy;


      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        annualInvestment: formatMoney(yearlyInvestment),
        btcPurchased: `${btcPurchased.toFixed(4)} BTC`,
        totalBtc: `${totalBtc.toFixed(4)} BTC`,
        totalValue: formatMoney(totalValue),
        btcPriceUsd: btcPriceUsd, // 計算用
        totalBtcRaw: totalBtc, // 計算用
      });
    }

    setResults(newResults);
  };

  // ... (chartData, chartOptions, JSX は変更なし)
}