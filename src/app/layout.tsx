import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="light">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Simulate Bitcoin investment and withdrawals." />
        <title>Bitcoin Power Law Simulator</title>
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900" role="main">
        {children}
      </body>
    </html>
  );
}