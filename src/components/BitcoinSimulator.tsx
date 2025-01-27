"use client";

import { useState } from "react";
import WithdrawalSimulator from "@/components/WithdrawalSimulator";
import InvestmentSimulator from "@/components/InvestmentSimulator";

export default function App() {
  const [activeTab, setActiveTab] = useState("withdrawal");

  return (
    <div className="min-h-screen p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">Bitcoin Simulator</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab("withdrawal")}
          className={`px-4 py-2 mr-2 ${
            activeTab === "withdrawal" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          取り崩しシミュレーター
        </button>
        <button
          onClick={() => setActiveTab("investment")}
          className={`px-4 py-2 ${
            activeTab === "investment" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          積み立てシミュレーター
        </button>
      </div>
      {activeTab === "withdrawal" && <WithdrawalSimulator />}
      {activeTab === "investment" && <InvestmentSimulator />}
    </div>
  );
}

"use client";

import { useState } from "react";

const MODELS = {
  aggressive: {
    name: "積極的モデル",
    startPrice: 100000,
    cagr: [
      48.4, 44.9, 42.1, 39.2, 37.1, 34.8, 33.1, 31.2, 29.5, 28.3, 27.0, 25.6, 24.5,
      23.4, 22.2, 21.0, 19.8, 18.6, 17.7, 16.8, 15.9, 15.1, 14.4, 13.6, 12.9, 12.3,
      11.7, 11.1, 10.5, 10.0,
    ],
  },
  balanced: {
    name: "標準的モデル",
    startPrice: 68000,
    cagr: [
      48.8, 46.2, 42.6, 39.2, 37.0, 34.9, 33.1, 31.3, 29.5, 28.1, 27.0, 25.7, 24.6,
      23.7, 22.7, 21.6, 20.6, 19.6, 18.6, 17.7, 16.8, 15.9, 15.1, 14.4, 13.6, 12.9,
      12.3, 11.7, 11.1, 10.5,
    ],
  },
  conservative: {
    name: "保守的モデル",
    startPrice: 36000,
    cagr: [
      50.0, 50.0, 41.7, 39.1, 36.6, 34.9, 32.8, 31.4, 29.5, 28.4, 27.1, 25.7, 24.6,
      23.7, 22.8, 21.7, 20.4, 19.6, 18.6, 17.7, 16.8, 15.9, 15.1, 14.4, 13.6, 12.9,
      12.3, 11.7, 11.1, 10.5,
    ],
  },
};

const CURRENT_YEAR = 2025;

const formatToYen = (amount: number): string => {
  const yen = Math.round(amount);
  const oku = Math.floor(yen / 1_0000_0000);
  const man = Math.floor((yen % 1_0000_0000) / 1_0000);
  return `${oku > 0 ? `${oku}億` : ""}${man}万円`;
};

export default function BitcoinSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [startYear, setStartYear] = useState<number | "">("");
  const [withdrawalAmount, setWithdrawalAmount] = useState<number | "">("");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [taxRate, setTaxRate] = useState<number>(20.315);
  const [results, setResults] = useState<any[]>([]);

  const handleCalculate = () => {
    if (
      btcAmount === "" ||
      startYear === "" ||
      withdrawalAmount === ""
    ) {
      alert("すべての項目を入力してください。");
      return;
    }

    const model = MODELS[modelKey];
    const newResults = [];
    let remainingBtc = parseFloat(btcAmount as string);

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i];

      const priceUsd =
        i === 0 ? model.startPrice : newResults[i - 1].priceUsd * (1 + cagr / 100);
      const priceJpy = priceUsd * usdJpyRate;

      const withdrawalAfterTax =
        year >= (startYear as number)
          ? parseFloat(withdrawalAmount as string) * 1_0000
          : 0;
      const withdrawalBtc = withdrawalAfterTax / priceJpy;
      const totalValue = remainingBtc * priceJpy;

      newResults.push({
        year,
        cagr: `${cagr.toFixed(1)}%`,
        priceUsd,
        price: formatToYen(priceJpy),
        withdrawal: year >= (startYear as number) ? formatToYen(withdrawalAfterTax) : "0円",
        remainingBtc:
          year >= (startYear as number)
            ? `${Math.max(remainingBtc - withdrawalBtc, 0).toFixed(4)} BTC`
            : `${remainingBtc.toFixed(4)} BTC`,
        totalValue: formatToYen(totalValue),
      });

      remainingBtc =
        year >= (startYear as number)
          ? Math.max(remainingBtc - withdrawalBtc, 0)
          : remainingBtc;
    }

    setResults(newResults);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Bitcoin Power Law Simulator</h1>
      <div className="space-y-4">
        <div>
          <label className="block font-bold">保有BTC量</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={btcAmount}
            onChange={(e) => setBtcAmount(parseFloat(e.target.value) || "")}
          />
        </div>
        <div>
          <label className="block font-bold">選択モデル</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
          >
            {Object.entries(MODELS).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold">取り崩し開始年</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value) || "")}
          />
        </div>
        <div>
          <label className="block font-bold">税率 (%)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block font-bold">年間取り崩し額 (税引き後・万円)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || "")}
          />
        </div>
        <div>
          <label className="block font-bold">為替レート (円/USD)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(parseFloat(e.target.value) || 0)}
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
        <table className="mt-6 w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">年</th>
              <th className="border border-gray-300 px-4 py-2">CAGR</th>
              <th className="border border-gray-300 px-4 py-2">1BTC予測価格</th>
              <th className="border border-gray-300 px-4 py-2">年間取り崩し額</th>
              <th className="border border-gray-300 px-4 py-2">残りBTC</th>
              <th className="border border-gray-300 px-4 py-2">総資産額</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{result.year}</td>
                <td className="border border-gray-300 px-4 py-2">{result.cagr}</td>
                <td className="border border-gray-300 px-4 py-2">{result.price}</td>
                <td className="border border-gray-300 px-4 py-2">{result.withdrawal}</td>
                <td className="border border-gray-300 px-4 py-2">{result.remainingBtc}</td>
                <td className="border border-gray-300 px-4 py-2">{result.totalValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";

// モデルデータ
const MODELS = {
  aggressive: { name: "積極的モデル", startPrice: 100000, cagr: [48.4, 44.9, 42.1, 39.2, 37.1, 34.8, 33.1, 31.2, 29.5] },
  balanced: { name: "標準的モデル", startPrice: 68000, cagr: [48.8, 46.2, 42.6, 39.2, 37.0, 34.9, 33.1, 31.3, 29.5] },
  conservative: { name: "保守的モデル", startPrice: 36000, cagr: [50.0, 50.0, 41.7, 39.1, 36.6, 34.9, 32.8, 31.4, 29.5] },
};

const CURRENT_YEAR = 2025;

export default function InvestmentSimulator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(0);
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);

  const isInputComplete = monthlyInvestment > 0;

  const results = isInputComplete
    ? (() => {
        const model = MODELS[modelKey];
        const yearlyInvestment = monthlyInvestment * 12;
        let totalInvestment = 0;
        let totalValue = 0;
        let totalBtc = 0;

        return model.cagr.map((cagr, index) => {
          const year = CURRENT_YEAR + index;
          const growthRate = cagr / 100;

          totalInvestment += yearlyInvestment;
          const btcPrice = index === 0 ? model.startPrice : totalValue / totalBtc;
          const btcPurchased = yearlyInvestment / (btcPrice * usdJpyRate);
          totalBtc += btcPurchased;
          totalValue = totalBtc * btcPrice * usdJpyRate;

          return {
            year,
            totalInvestment,
            totalValue,
            totalBtc,
            btcPrice,
          };
        });
      })()
    : [];

  const chartData = {
    labels: results.map((result) => result.year),
    datasets: [
      {
        label: "資産評価額（円）",
        data: results.map((result) => result.totalValue),
        borderColor: "rgba(53, 162, 235, 1)",
        backgroundColor: "rgba(53, 162, 235, 0.2)",
      },
    ],
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">積み立てシミュレーター</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">毎月の積み立て額（万円）</label>
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">選択モデル</label>
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
          <label className="block mb-1">為替レート（円/USD）</label>
          <input
            type="number"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      {isInputComplete && (
        <div className="mt-6">
          <Line data={chartData} />
          <table className="mt-6 w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">年</th>
                <th className="border p-2">累計投資額（円）</th>
                <th className="border p-2">資産評価額（円）</th>
                <th className="border p-2">累計BTC</th>
                <th className="border p-2">1BTC価格（円）</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.year}>
                  <td className="border p-2">{result.year}</td>
                  <td className="border p-2">{result.totalInvestment.toLocaleString()}</td>
                  <td className="border p-2">{result.totalValue.toLocaleString()}</td>
                  <td className="border p-2">{result.totalBtc.toFixed(4)} BTC</td>
                  <td className="border p-2">{(result.btcPrice * usdJpyRate).toLocaleString()} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}