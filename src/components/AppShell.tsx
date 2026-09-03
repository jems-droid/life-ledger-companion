import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: "◆", chip: "bg-blossom/60", ic: "bg-surface text-coral-deep" },
  { to: "/allergy", label: "Allergy Diary", icon: "✿", chip: "bg-mint/50", ic: "bg-mint/60 text-leaf" },
  { to: "/spending", label: "Spending Recorder", icon: "₹", chip: "bg-sky/50", ic: "bg-sky/60 text-lagoon" },
  { to: "/ai-check", label: "Spending Check", icon: "✷", chip: "bg-lilac/50", ic: "bg-lilac/60 text-plum" },
] as const;

export function AppShell({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col rounded-[28px] bg-surface/90 p-5 ring-1 ring-ink/5 lg:flex">
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="grid size-10 place-items-center rounded-2xl bg-coral font-display text-lg font-bold text-surface">
            L
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Life Ledger</p>
            <p className="text-xs text-soft">my personal ledger</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1.5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-soft transition-colors hover:bg-canvas"
              activeProps={{ className: `${n.chip} font-semibold text-ink` }}
            >
              <span className={`grid size-8 place-items-center rounded-xl ${n.ic}`}>
                {n.icon}
              </span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-butter/50 p-4">
          <p className="font-display text-sm font-semibold">Hi there</p>
          <p className="mt-1 text-xs text-soft">
            You're doing fine. One gentle nudge a day.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="mx-auto max-w-6xl px-4 pt-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-deep">
                {eyebrow}
              </p>
              <h1 className="mt-1 max-w-[20ch] text-balance font-display text-3xl font-semibold leading-tight">
                {title}
              </h1>
            </div>
            {action}
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="whitespace-nowrap rounded-2xl bg-surface px-4 py-2 text-sm font-medium text-soft ring-1 ring-ink/5"
                activeProps={{ className: "bg-blossom/70 font-semibold text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-[32px] bg-surface p-6 ring-1 ring-ink/5 ${className}`}>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-sm text-soft">
      {children}
    </p>
  );
}
