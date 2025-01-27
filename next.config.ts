import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ビルド時に ESLint エラーを無視
  },
};

export default nextConfig;