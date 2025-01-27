/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // src配下の全てを含む
  ],
  darkMode: "class", // クラスベースでダークモードをサポート
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4F46E5", // ライトモード用のプライマリカラー
          dark: "#6366F1",  // ダークモード用のプライマリカラー
        },
        background: {
          light: "#FFFFFF", // 白
          dark: "#1A202C",  // ダークグレー
        },
        text: {
          light: "#1F2937", // 黒
          dark: "#F9FAFB",  // 白
        },
      },
    },
  },
  plugins: [],
};