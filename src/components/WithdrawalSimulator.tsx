"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import { MODELS, CURRENT_YEAR } from "@/constants/models";

// 金額フォーマット関数
const formatMoney = (amount: number): string => {
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(2)}億円`;
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(1)}万円`;
  return `${amount.toFixed(0)}円`;
};

// 金額を数値に変換する関数
const parseFormattedMoney = (formatted: string): number => {
  if (formatted.includes("億円")) return parseFloat(formatted.replace("億円", "")) * 1e8;
  if (formatted.includes("万円")) return parseFloat(formatted.replace("万円", "")) * 1e4;
  return parseFloat(formatted.replace("円", ""));
};

export default function WithdrawalSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [startYear, setStartYear] = useState<number | "">(2025);
  const [withdrawalType, setWithdrawalType] = useState<"fixed" | "rate">("fixed"); // 定額か定率かの選択
  const [withdrawalValue, setWithdrawalValue] = useState<number | "">(""); // 定額または定率の入力値
  const [taxRate, setTaxRate] = useState<number>(20.315);
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [results, setResults] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = () => {
    setErrorMessage(null);

    if (btcAmount === "" || startYear === "" || withdrawalValue === "") {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }

    const parsedBtcAmount = parseFloat(btcAmount as string);
    const parsedStartYear = parseInt(startYear as string);
    const parsedWithdrawalValue = parseFloat(withdrawalValue as string);

    if (isNaN(parsedBtcAmount) || isNaN(parsedStartYear) || isNaN(parsedWithdrawalValue)) {
      setErrorMessage("数値を正しく入力してください。");
      return;
    }

    const model = MODELS[modelKey];
    let remainingBtc = parsedBtcAmount;
    let previousPriceUsd = model.startPrice;

    const newResults = [];

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;

      const btcPriceUsd = previousPriceUsd * (1 + cagr);
      const btcPriceJpy = btcPriceUsd * usdJpyRate;
      const portfolioValueJpy = remainingBtc * btcPriceJpy;

      let withdrawalAmountJpy = 0;
      if (year >= parsedStartYear) {
        if (withdrawalType === "fixed") {
          withdrawalAmountJpy = parsedWithdrawalValue * 1_0000; // 定額（万円 -> 円）
        } else if (withdrawalType === "rate") {
          withdrawalAmountJpy = (portfolioValueJpy * parsedWithdrawalValue) / 100; // 定率
        }
      }

      const withdrawalBtc = withdrawalAmountJpy / btcPriceJpy;
      const withdrawalRate = portfolioValueJpy > 0 ? (withdrawalAmountJpy / portfolioValueJpy) * 100 : 0;

      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPriceJpy),
        withdrawalRate: `${withdrawalRate.toFixed(1)}%`,
        withdrawalAmount: formatMoney(withdrawalAmountJpy),
        remainingBtc: `${Math.max(remainingBtc - withdrawalBtc, 0).toFixed(4)} BTC`,
        assetValue: formatMoney(portfolioValueJpy),
        remainingBtcRaw: Math.max(remainingBtc - withdrawalBtc, 0),
      });

      remainingBtc =
        year >= parsedStartYear ? Math.max(remainingBtc - withdrawalBtc, 0) : remainingBtc;
      previousPriceUsd = btcPriceUsd;
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
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "年",
        },
      },
      "btc-axis": {
        type: "linear",
        position: "left",
        min: 0,
        title: {
          display: true,
          text: "残りBTC",
        },
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
        ticks: {
          callback: function (value: number) {
            return formatMoney(value);
          },
        },
      },
    },
  };

  return (
    <div className="p-4 bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">取り崩しシミュレーター</h1>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      <div className="space-y-4">
        <div>
          <label className="block font-bold">保有BTC量</label>
          <input
            type="number"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value ? parseFloat(e.target.value) : "")}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 2.0"
          />
        </div>
        <div>
          <label className="block font-bold">モデル</label>
          <select
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
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
            value={startYear}
            onChange={(e) => setStartYear(e.target.value ? parseInt(e.target.value) : "")}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 2025"
          />
        </div>
        <div>
          <label className="block font-bold">取り崩し方法</label>
          <select
            value={withdrawalType}
            onChange={(e) => setWithdrawalType(e.target.value as "fixed" | "rate")}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="fixed">定額 (万円)</option>
            <option value="rate">定率 (%)</option>
          </select>
        </div>
        <div>
          <label className="block font-bold">
            {withdrawalType === "fixed" ? "年間取り崩し額 (税引き後・万円)" : "年間取り崩し率 (%)"}
          </label>
          <input
            type="number"
            value={withdrawalValue}
            onChange={(e) => setWithdrawalValue(e.target.value ? parseFloat(e.target.value) : "")}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={withdrawalType === "fixed" ? "例: 50" : "例: 5"}
          />
        </div>
        <div>
          <label className="block font-bold">税率 (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 20.315"
          />
        </div>
        <div>
          <label className="block font-bold">為替レート (円/USD)</label>
          <input
            type="number"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(parseFloat(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 150"
          />
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleCalculate}>
          計算
        </button>
      </div>
      {results.length > 0 && (
        <div>
          <table className="mt-6 w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">年</th>
                <th className="border border-gray-300 px-4 py-2">CAGR</th>
                <th className="border border-gray-300 px-4 py-2">1BTC価格</th>
                <th className="border border-gray-300 px-4 py-2">取り崩し率</th>
                <th className="border border-gray-300 px-4 py-2">年間取り崩し額</th>
                <th className="border border-gray-300 px-4 py-2">残りBTC</th>
                <th className="border border-gray-300 px-4 py-2">資産評価額</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">{result.year}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.cagr}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.btcPrice}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.withdrawalRate}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.withdrawalAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.remainingBtc}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.assetValue}</td>
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