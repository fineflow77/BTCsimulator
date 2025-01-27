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

type ResultType = {
  year: number;
  cagr: string;
  btcPrice: string;
  withdrawalAmount: string;
  withdrawalRate: string;
  remainingBtc: string;
  portfolioValue: string;
};

const formatMoney = (amount: number): string => {
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(2)}億円`;
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(2)}万円`;
  return `${amount.toFixed(0)}円`;
};

export default function WithdrawalSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [startYear, setStartYear] = useState<number>(2025);
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("fixedAmount");
  const [fixedAmount, setFixedAmount] = useState<number | "">("");
  const [percentage, setPercentage] = useState<number | "">("");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [taxRate, setTaxRate] = useState<number>(20.315);
  const [results, setResults] = useState<ResultType[]>([]);

  const handleCalculate = () => {
    if (btcAmount === "" || startYear < 2025 || (!fixedAmount && !percentage)) {
      alert("すべての項目を入力してください。");
      return;
    }

    const parsedBtcAmount = parseFloat(btcAmount as string);
    const parsedFixedAmount = parseFloat(fixedAmount as string) * 1_0000 || 0;
    const parsedPercentage = parseFloat(percentage as string) / 100 || 0;

    const model = MODELS[modelKey];
    let remainingBtc = parsedBtcAmount;
    const newResults: ResultType[] = [];

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;
      const btcPriceUsd = i === 0 ? model.startPrice : newResults[i - 1].btcPriceUsd * (1 + cagr);
      const btcPriceJpy = btcPriceUsd * usdJpyRate;

      const withdrawalAmountJpy =
        withdrawalMethod === "fixedAmount"
          ? parsedFixedAmount
          : (remainingBtc * btcPriceJpy * parsedPercentage) / (1 - taxRate / 100);

      const withdrawalBtc = withdrawalAmountJpy / btcPriceJpy;
      const portfolioValueJpy = remainingBtc * btcPriceJpy;
      const withdrawalRate = portfolioValueJpy > 0 ? (withdrawalAmountJpy / portfolioValueJpy) * 100 : 0;

      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        withdrawalAmount: formatMoney(withdrawalAmountJpy),
        withdrawalRate: `${withdrawalRate.toFixed(2)}%`,
        remainingBtc: `${Math.max(remainingBtc - withdrawalBtc, 0).toFixed(4)} BTC`,
        portfolioValue: formatMoney(portfolioValueJpy),
      });

      remainingBtc = Math.max(remainingBtc - withdrawalBtc, 0);
    }

    setResults(newResults);
  };

  const chartData = {
    labels: results.map((result) => result.year.toString()),
    datasets: [
      {
        label: "残りBTC",
        data: results.map((result) => parseFloat(result.remainingBtc)),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "btc-axis",
      },
      {
        label: "資産評価額 (円)",
        data: results.map((result) => parseFloat(result.portfolioValue)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "value-axis",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      "btc-axis": {
        type: "linear" as const,
        position: "left" as const,
        min: 0,
      },
      "value-axis": {
        type: "linear" as const,
        position: "right" as const,
        ticks: {
          callback: (value: number) => formatMoney(value),
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">取り崩しシミュレーター</h2>
      <div className="space-y-4">
        <div>
          <label>保有BTC量</label>
          <input
            type="number"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            placeholder="例: 2.0"
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div>
          <label>モデル</label>
          <select
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          >
            {Object.entries(MODELS).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>取り崩し開始年</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div>
          <label>取り崩し方法</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                value="fixedAmount"
                checked={withdrawalMethod === "fixedAmount"}
                onChange={() => setWithdrawalMethod("fixedAmount")}
              />
              定額
            </label>
            <label>
              <input
                type="radio"
                value="fixedRate"
                checked={withdrawalMethod === "fixedRate"}
                onChange={() => setWithdrawalMethod("fixedRate")}
              />
              定率
            </label>
          </div>
        </div>
        {withdrawalMethod === "fixedAmount" && (
          <div>
            <label>年間取り崩し額 (万円)</label>
            <input
              type="number"
              value={fixedAmount}
              onChange={(e) => setFixedAmount(Number(e.target.value))}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
        )}
        {withdrawalMethod === "fixedRate" && (
          <div>
            <label>取り崩し率 (%)</label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
        )}
        <button
          className="bg-blue-500 text-white rounded px-4 py-2"
          onClick={handleCalculate}
        >
          計算
        </button>
      </div>
      {results.length > 0 && (
        <div>
          <table className="w-full border-collapse border border-gray-300 mt-6">
            <thead>
              <tr>
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
                  <td className="border p-2">{result.portfolioValue}</td>
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