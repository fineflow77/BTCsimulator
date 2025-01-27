"use client";

import { useState } from "react";
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
import { MODELS, CURRENT_YEAR } from "@/constants/models";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 金額をフォーマットする関数
const formatMoney = (amount: number): string => {
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(2)}億円`;
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(2)}万円`;
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
  const [results, setResults] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = () => {
    setErrorMessage(null);
  
    if (btcAmount === "" || monthlyInvestment === "") {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }
  
    const model = MODELS[modelKey];
    const yearlyInvestment = parseFloat(monthlyInvestment.toString()) * 12 * 1_0000;
    let totalInvestment = 0;
    let totalBtc = parseFloat(btcAmount.toString());
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
    }[] = [];
  
    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;
      const btcPriceUsd: number = i === 0 ? model.startPrice : newResults[i - 1].btcPriceUsd * (1 + cagr);
      const btcPriceJpy = btcPriceUsd * usdJpyRate;
  
      const btcPurchased = yearlyInvestment / btcPriceJpy;
      totalInvestment += yearlyInvestment;
      totalBtc += btcPurchased;
  
      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        annualInvestment: formatMoney(yearlyInvestment),
        btcPurchased: `${btcPurchased.toFixed(4)} BTC`,
        totalBtc: `${totalBtc.toFixed(4)} BTC`,
        totalValue: formatMoney(totalBtc * btcPriceJpy),
        btcPriceUsd,
        totalBtcRaw: totalBtc,
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
    <div className="p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-bold mb-4">積み立てシミュレーター</h1>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <div className="space-y-4">
        <div>
          <label className="block font-bold">保有BTC量</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            placeholder="例: 0.1"
          />
        </div>
        <div>
          <label className="block font-bold">毎月の積立額 (万円)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(e.target.value)}
            placeholder="例: 5"
          />
        </div>
        <div>
          <label className="block font-bold">モデル</label>
          <select
            className="w-full p-2 border rounded"
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
          >
            {Object.entries(MODELS).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold">為替レート (円/USD)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(parseFloat(e.target.value) || 0)}
            placeholder="例: 150"
          />
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleCalculate}
        >
          計算
        </button>
      </div>
      {results.length > 0 && (
        <div>
          <table className="mt-6 w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">年</th>
                <th className="border p-2">CAGR</th>
                <th className="border p-2">1BTC予測価格</th>
                <th className="border p-2">年間積立額</th>
                <th className="border p-2">追加BTC</th>
                <th className="border p-2">累計BTC</th>
                <th className="border p-2">資産評価額</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{result.year}</td>
                  <td className="border p-2">{result.cagr}</td>
                  <td className="border p-2">{result.btcPrice}</td>
                  <td className="border p-2">{result.annualInvestment}</td>
                  <td className="border p-2">{result.btcPurchased}</td>
                  <td className="border p-2">{result.totalBtc}</td>
                  <td className="border p-2">{result.totalValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}