"use client";

import AppShell from "@/components/AppShell";
import Image from "next/image";

export default function Home() {
  return (
    <AppShell>
      <div className="relative grid min-h-screen grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        <div className="col-start-3 row-start-3 flex max-w-lg flex-col bg-gray-100 p-6 rounded-lg shadow-lg dark:bg-gray-800">
          <div className="rounded-xl bg-white p-6 text-sm/7 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {/* Next.js の Image コンポーネントで LCP を最適化 */}
            <div className="flex justify-center mb-8">
              <Image
                src="/img/logo.svg"
                alt="Tailwind Play"
                width={150}
                height={40}
                className="dark:hidden"
                priority
              />
              <Image
                src="/img/logo-dark.svg"
                alt="Tailwind Play Dark"
                width={150}
                height={40}
                className="hidden dark:block"
                priority
              />
            </div>
            {/* 説明文 */}
            <p className="mb-4">
              An advanced online playground for Tailwind CSS, including support for things like:
            </p>
            {/* リスト */}
            <ul className="list-disc list-inside space-y-2">
              <li>
                Customizing your theme with{" "}
                <code className="font-mono text-blue-600 dark:text-blue-400">@theme</code>
              </li>
              <li>
                Adding custom utilities with{" "}
                <code className="font-mono text-blue-600 dark:text-blue-400">@utility</code>
              </li>
              <li>Code completion with instant preview</li>
              <li>Prototyping and sharing your ideas online</li>
            </ul>
            <hr className="my-6 border-gray-300 dark:border-gray-700" />
            {/* ドキュメントへのリンク */}
            <p className="text-center">
              <a
                href="https://tailwindcss.com/docs"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Read the docs &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}