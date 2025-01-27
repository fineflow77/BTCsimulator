"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import { MODELS, CURRENT_YEAR } from "@/constants/models";

const formatMoney = (amount: number): string => {
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(2)}億円`;
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(2)}万円`;
  return `${amount.toFixed(0)}円`;
};

const parseFormattedMoney = (formatted: string): number => {
  if (formatted.includes("億円")) return parseFloat(formatted.replace("億円", "")) * 1e8;
  if (formatted.includes("万円")) return parseFloat(formatted.replace("万円", "")) * 1e4;
  return parseFloat(formatted.replace("円", ""));
};

interface InvestmentResult {
  year: number;
  cagr: string;
  btcPrice: string;
  annualInvestment: string;
  btcPurchased: string;
  totalBtc: string;
  totalValue: string;
}

export default function InvestmentSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | "">("");
  const [monthlyInvestment, setMonthlyInvestment] = useState<number | "">("");
  const [modelKey, setModelKey] = useState<string>("balanced");
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);
  const [results, setResults] = useState<InvestmentResult[]>([]);

  const handleCalculate = () => {
    if (!btcAmount || !monthlyInvestment) {
      alert("すべての項目を入力してください。");
      return;
    }

    const model = MODELS[modelKey];
    const yearlyInvestment = parseFloat(monthlyInvestment as string) * 12 * 1_0000;
    let totalInvestment = 0;
    let totalBtc = parseFloat(btcAmount as string);
    const newResults: InvestmentResult[] = [];

    for (let i = 0; i < model.cagr.length; i++) {
      const year = CURRENT_YEAR + i;
      const cagr = model.cagr[i] / 100;
      const btcPrice = i === 0 ? model.startPrice : newResults[i - 1].btcPriceRaw * (1 + cagr);
      const btcPurchased = yearlyInvestment / (btcPrice * usdJpyRate);
      totalInvestment += yearlyInvestment;
      totalBtc += btcPurchased;

      newResults.push({
        year,
        cagr: `${(cagr * 100).toFixed(1)}%`,
        btcPrice: formatMoney(btcPrice * usdJpyRate),
        annualInvestment: formatMoney(yearlyInvestment),
        btcPurchased: `${btcPurchased.toFixed(4)} BTC`,
        totalBtc: `${totalBtc.toFixed(4)} BTC`,
        totalValue: formatMoney(totalBtc * btcPrice * usdJpyRate),
        btcPriceRaw: btcPrice, // グラフ用
      });
    }

    setResults(newResults);
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">積み立てシミュレーター</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">保有BTC量</label>
          <input
            type="number"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value ? parseFloat(e.target.value) : "")}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 0.1"
          />
        </div>
        <div>
          <label className="block mb-1">毎月の積立額 (万円)</label>
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(e.target.value ? parseFloat(e.target.value) : "")}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="例: 5"
          />
        </div>
        <div>
          <label className="block mb-1">モデル</label>
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
          <label className="block mb-1">為替レート (円/USD)</label>
          <input
            type="number"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded"
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
                <th className="border border-gray-300 px-4 py-2">年</th>
                <th className="border border-gray-300 px-4 py-2">CAGR</th>
                <th className="border border-gray-300 px-4 py-2">1BTC予測価格</th>
                <th className="border border-gray-300 px-4 py-2">年間積立額</th>
                <th className="border border-gray-300 px-4 py-2">追加BTC</th>
                <th className="border border-gray-300 px-4 py-2">累計BTC</th>
                <th className="border border-gray-300 px-4 py-2">資産評価額</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">{result.year}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.cagr}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.btcPrice}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.annualInvestment}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.btcPurchased}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.totalBtc}</td>
                  <td className="border border-gray-300 px-4 py-2">{result.totalValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}