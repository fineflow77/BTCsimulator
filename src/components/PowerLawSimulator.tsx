"use client";

import { useState } from "react";

const MODELS = {
  aggressive: { name: "積極的モデル", startPrice: 100000, slope: 0.168 },
  balanced: { name: "標準的モデル", startPrice: 68000, slope: 0.152 },
  conservative: { name: "保守的モデル", startPrice: 36000, slope: 0.136 },
};

const calculatePrice = (startYear: number, currentYear: number, model: any) => {
  const yearsElapsed = currentYear - startYear + 1;
  if (yearsElapsed <= 0) return model.startPrice;
  const logPrice = Math.log10(model.startPrice) + model.slope * Math.log10(yearsElapsed);
  return Math.pow(10, logPrice);
};

const formatToYen = (amount: number): string => {
  const yen = Math.round(amount);
  const oku = Math.floor(yen / 1_0000_0000);
  const man = Math.floor((yen % 1_0000_0000) / 1_0000);
  return `${oku > 0 ? `${oku}億` : ""}${man}万円`;
};

export default function BitcoinSimulator() {
  const [btcAmount, setBtcAmount] = useState<number | null>(null);
  const [modelKey, setModelKey] = useState<string>("balanced"); // デフォルトモデル
  const [startYear, setStartYear] = useState<number | null>(2025); // デフォルト開始年
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150);

  const handleSubmit = () => {
    if (!btcAmount || !startYear) return;
    const model = MODELS[modelKey];
    const price2025 = calculatePrice(startYear, 2025, model);
    const price2030 = calculatePrice(startYear, 2030, model);
    alert(`2025年価格: ${formatToYen(price2025)}, 2030年価格: ${formatToYen(price2030)}`);
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">シミュレーター設定</h2>
      <div className="mb-4">
        <label className="block font-medium mb-2">保有BTC量</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={btcAmount ?? ""}
          onChange={(e) => setBtcAmount(parseFloat(e.target.value) || null)}
          placeholder="例: 0.5"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">モデル選択</label>
        <select
          className="border p-2 rounded w-full"
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

      <div className="mb-4">
        <label className="block font-medium mb-2">取り崩し開始年</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={startYear ?? ""}
          onChange={(e) => setStartYear(parseInt(e.target.value, 10) || null)}
          placeholder="例: 2025"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">為替レート (円/USD)</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={usdJpyRate}
          onChange={(e) => setUsdJpyRate(parseFloat(e.target.value) || 150)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        計算する
      </button>
    </div>
  );
}