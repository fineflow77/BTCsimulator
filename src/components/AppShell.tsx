"use client";

import { useState } from "react";
import WithdrawalSimulator from "@/components/WithdrawalSimulator";
import InvestmentSimulator from "@/components/InvestmentSimulator";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("withdrawal");

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Bitcoin Power Law Simulator
      </h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("withdrawal")}
          aria-pressed={activeTab === "withdrawal"}
          className={`px-6 py-2 rounded transition-colors ${
            activeTab === "withdrawal"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          取り崩しシミュレーター
        </button>
        <button
          onClick={() => setActiveTab("investment")}
          aria-pressed={activeTab === "investment"}
          className={`px-6 py-2 rounded transition-colors ${
            activeTab === "investment"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          積み立てシミュレーター
        </button>
      </div>
      <div className="container mx-auto">
        {activeTab === "withdrawal" && <WithdrawalSimulator />}
        {activeTab === "investment" && <InvestmentSimulator />}
      </div>
    </div>
  );
}