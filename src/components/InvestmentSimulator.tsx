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

// フォーマットされた金額を数値に変換する関数
const parseFormattedMoney = (formatted: string): number => {
  if (formatted.includes("億円")) {
    return parseFloat(formatted.replace("億円", "")) * 1e8;
  }
  if (formatted.includes("万円")) {
    return parseFloat(formatted.replace("万円", "")) * 1e4;
  }
  return parseFloat(formatted.replace("円", ""));
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
    btcPriceUsd: number;
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
    if (!model || !model.cagr) {
      setErrorMessage("選択したモデルまたはCAGRデータが無効です。");
      return;
    }

    const yearlyInvestment = parsedMonthlyInvestment * 12 * 1_0000; // 年間投資額 (円)
    let totalBtc = parsedBtcAmount; // 初期BTC量
    let btcPriceUsd = model.startPrice; // 初期価格を設定
    let totalInvestment = 0; // 初期投資額
    const newResults = [];

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;

      btcPriceUsd = btcPriceUsd * (1 + cagr); // 今年のBTC価格を計算 (USD)
      const btcPriceJpy = btcPriceUsd * usdJpyRate; // BTC価格を円に変換

      const btcPurchased = yearlyInvestment / btcPriceJpy; // 購入したBTC量
      totalBtc += btcPurchased; // BTCの合計量を更新
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


  const chartData = {
    labels: results.map((result) => result.year.toString()),
    datasets: [
      {
        label: "資産評価額 (円)",
        data: results.map((result) => parseFormattedMoney(result.totalValue)),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "value-axis",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "資産評価額の推移",
      },
    },
    scales: {
      "value-axis": {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "資産評価額 (円)",
        },
        ticks: {
          callback: (value: number) =>
            value >= 1_0000_0000
              ? `${(value / 1_0000_0000).toFixed(1)}億`
              : value >= 1_0000
              ? `${(value / 1_0000).toFixed(1)}万`
              : value,
        },
      },
      x: {
        title: {
          display: true,
          text: "年",
        },
      },
    },
  };

  return (
    // ... (JSXは変更なし)
  );
}