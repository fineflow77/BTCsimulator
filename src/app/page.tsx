import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="relative grid min-h-screen grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-white [--pattern-fg:var(--color-gray-950)]/5 dark:bg-gray-950 dark:[--pattern-fg:var(--color-white)]/10">
        <div className="col-start-3 row-start-3 flex max-w-lg flex-col bg-gray-100 p-2 dark:bg-white/10">
          <div className="rounded-xl bg-white p-10 text-sm/7 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <img src="/img/logo.svg" className="mb-11.5 h-6 dark:hidden" alt="Tailwind Play" />
            <img src="/img/logo-dark.svg" className="mb-11.5 h-6 not-dark:hidden" alt="Tailwind Play" />
            <p>An advanced online playground for Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}