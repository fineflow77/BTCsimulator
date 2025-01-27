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

export default function InvestmentSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [monthlyInvestment, setMonthlyInvestment] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [results, setResults] = useState<{
    year: number;
    cagr: string;
    btcPrice: string;
    annualInvestment: string;
    btcPurchased: string;
    totalBtc: string;
    totalValue: string;
    btcPriceUsd: number; // 型注釈を追加
    totalBtcRaw: number;
  }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = () => {
    setErrorMessage(null);

    if (btcAmount === "" || monthlyInvestment === "") {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }

    const parsedBtcAmount = parseFloat(btcAmount as string);
    const parsedMonthlyInvestment = parseFloat(monthlyInvestment as string);

    if (isNaN(parsedBtcAmount) || isNaN(parsedMonthlyInvestment)) {
      setErrorMessage("入力値が不正です。数値を入力してください。");
      return;
    }

    const model = MODELS[modelKey];
    if (!model || !model.cagr) { // modelが存在し、cagrが定義されているかチェック
      setErrorMessage("選択したモデルまたはCAGRデータが無効です。");
      return;
    }

    const yearlyInvestment = parsedMonthlyInvestment * 12 * 1_0000; // 年間投資額 (円)
    let totalInvestment = 0; // 累計投資額
    let totalBtc = parsedBtcAmount; // 初期BTC量
    let btcPriceUsd = model.startPrice; // 初期価格を設定

    const newResults = [];

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;

      btcPriceUsd = btcPriceUsd * (1 + cagr); // 今年のBTC価格を計算 (USD)
      const btcPriceJpy = btcPriceUsd * usdJpyRate; // BTC価格を円に変換

      const btcPurchased = yearlyInvestment / btcPriceJpy; // 購入したBTC量
      totalBtc += btcPurchased; // BTCの合計量を更新
      totalInvestment += yearlyInvestment; // 累計投資額を更新

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
        totalBtcRaw: totalBtc // 計算用
      });
    }


    setResults(newResults);
  };

  // ... (chartData, chartOptions, JSX は変更なし)
  // JSX部分で<Line data={chartData} options={chartOptions} />を呼び出す際に、optionsを追加してください。
}