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

export default function WithdrawalSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [startYear, setStartYear] = useState<number | "">(2025);
  const [withdrawalType, setWithdrawalType] = useState<"fixed" | "percentage">("fixed");
  const [withdrawalAmount, setWithdrawalAmount] = useState<number | "">("");
  const [withdrawalRate, setWithdrawalRate] = useState<number | "">("");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [taxRate, setTaxRate] = useState<number>(20.315);
  const [results, setResults] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = () => {
    setErrorMessage(null);

    if (btcAmount === "" || startYear === "" || (withdrawalType === "fixed" && withdrawalAmount === "") || (withdrawalType === "percentage" && withdrawalRate === "")) {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }

    const model = MODELS[modelKey];
    const parsedBtcAmount = parseFloat(btcAmount as string);
    const parsedStartYear = parseInt(startYear as string);
    const parsedWithdrawalAmount = withdrawalType === "fixed" ? parseFloat(withdrawalAmount as string) * 1_0000 : 0;
    const parsedWithdrawalRate = withdrawalType === "percentage" ? parseFloat(withdrawalRate as string) : 0;

    const newResults = [];
    let remainingBtc = parsedBtcAmount;

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;
      const btcPriceUsd = i === 0 ? model.startPrice : newResults[i - 1].btcPriceUsd * (1 + cagr);
      const btcPriceJpy = btcPriceUsd * usdJpyRate;

      const portfolioValue = remainingBtc * btcPriceJpy;

      const withdrawalAmountJpy =
        year >= parsedStartYear
          ? withdrawalType === "fixed"
            ? parsedWithdrawalAmount
            : portfolioValue * (parsedWithdrawalRate / 100)
          : 0;

      const withdrawalBtc = withdrawalAmountJpy / btcPriceJpy;

      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        withdrawalAmount: formatMoney(withdrawalAmountJpy),
        remainingBtc: `${Math.max(remainingBtc - withdrawalBtc, 0).toFixed(8)} BTC`,
        assetValue: formatMoney(portfolioValue),
        withdrawalRate: `${((withdrawalAmountJpy / portfolioValue) * 100).toFixed(1)}%`,
        btcPriceUsd, // グラフ用の生データ
        remainingBtcRaw: Math.max(remainingBtc - withdrawalBtc, 0), // グラフ用
      });

      remainingBtc = year >= parsedStartYear ? Math.max(remainingBtc - withdrawalBtc, 0) : remainingBtc;
    }

    setResults(newResults);
  };

  const chartData = {
    labels: results.map((result) => result.year.toString()),
    datasets: [
      {
        label: "残りBTC",
        data: results.map((result) => result.remainingBtcRaw),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "btc-axis",
      },
      {
        label: "資産評価額 (円)",
        data: results.map((result) => parseFormattedMoney(result.assetValue)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "value-axis",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "残りBTCと資産評価額の推移",
      },
    },
    scales: {
      "btc-axis": {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "残りBTC",
        },
        min: 0, // 残りBTCの最小値を0に設定
      },
      "value-axis": {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "資産評価額 (円)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-bold mb-4">取り崩しシミュレーター</h1>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <div className="space-y-4">
        <div>
          <label className="block font-bold">保有BTC量</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            placeholder="例: 2.0"
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
          <label className="block font-bold">取り崩し開始年</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="例: 2025"
          />
        </div>
        <div>
          <label className="block font-bold">取り崩し方法</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="fixed"
                checked={withdrawalType === "fixed"}
                onChange={() => setWithdrawalType("fixed")}
              />
              定額
            </label>
            <label>
              <input
                type="radio"
                value="percentage"
                checked={withdrawalType === "percentage"}
                onChange={() => setWithdrawalType("percentage")}
              />
              定率
            </label>
          </div>
        </div>
        {withdrawalType === "fixed" && (
          <div>
            <label className="block font-bold">年間取り崩し額 (万円)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="例: 50"
            />
          </div>
        )}
        {withdrawalType === "percentage" && (
          <div>
            <label className="block font-bold">取り崩し率 (%)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={withdrawalRate}
              onChange={(e) => setWithdrawalRate(e.target.value)}
              placeholder="例: 4"
            />
          </div>
        )}
        <div>
          <label className="block font-bold">税率 (%)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            placeholder="例: 20.315"
          />
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
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">シミュレーション結果</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">年</th>
                <th className="border p-2">CAGR</th>
                <th className="border p-2">1BTC価格</th>
                <th className="border p-2">年間取り崩し額</th>
                <th className="border p-2">取り崩し率</th>
                <th className="border p-2">残りBTC</th>
                <th className="border p-2">資産評価額</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{result.year}</td>
                  <td className="border p-2">{result.cagr}</td>
                  <td className="border p-2">{result.btcPrice}</td>
                  <td className="border p-2">{result.withdrawalAmount}</td>
                  <td className="border p-2">{result.withdrawalRate}</td>
                  <td className="border p-2">{result.remainingBtc}</td>
                  <td className="border p-2">{result.assetValue}</td>
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