"use client";

import React, { useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [activeTab, setActiveTab] = useState("withdrawal");

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Bitcoin Power Law Simulator
      </h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("withdrawal")}
          className={`px-6 py-2 rounded ${
            activeTab === "withdrawal" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          取り崩しシミュレーター
        </button>
        <button
          onClick={() => setActiveTab("investment")}
          className={`px-6 py-2 rounded ${
            activeTab === "investment" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          積み立てシミュレーター
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}