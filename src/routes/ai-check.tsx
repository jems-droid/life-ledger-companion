import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";

import { AppShell, Card, Empty } from "@/components/AppShell";
import {
  CATEGORY_COLORS,
  currentMonthKey,
  formatINR,
  monthLabel,
  spendStats,
  useAllowance,
  useSpendEntries,
} from "@/lib/ledger";
import { analyzeSpending } from "@/lib/spending-ai.functions";

export const Route = createFileRoute("/ai-check")({
  head: () => ({
    meta: [
      { title: "AI Spending Check — Life Ledger" },
      {
        name: "description",
        content:
          "A friendly AI read on your recorded spending: category shares, weekly consistency, recurring patterns and gentle tracking tips.",
      },
      { property: "og:title", content: "AI Spending Check — Life Ledger" },
      {
        property: "og:description",
        content: "This week's spending check, generated from your own recorded data.",
      },
    ],
  }),
  component: AiCheckPage,
});

function AiCheckPage() {
  const mKey = currentMonthKey();
  const { allowance } = useAllowance();
  const { entries } = useSpendEntries();
  const s = spendStats(entries, mKey, allowance);
  const analyze = useServerFn(analyzeSpending);

  const mutation = useMutation({
    mutationFn: () =>
      analyze({
        data: {
          allowance,
          monthLabel: monthLabel(mKey),
          monthTotal: s.total,
          weekTotal: s.thisWeek,
          avgWeekly: s.avgWeekly,
          weeks: s.weeks,
          categories: s.byCategory,
          recentDescriptions: [...s.monthEntries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 25)
            .map((e) => ({
              date: e.date,
              description: e.description,
              amount: e.amount,
            })),
        },
      }),
  });

  const lines = (mutation.data?.text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <AppShell
      eyebrow="Spending check"
      title="This week's spending check"
      action={
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || s.total === 0}
          className="rounded-2xl bg-coral-deep px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-50"
        >
          {mutation.isPending ? "Thinking…" : "Generate check"}
        </button>
      }
    >
      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-lilac text-plum">
              ✷
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Your friendly read</h2>
              <p className="text-sm text-soft">
                Based on {s.monthEntries.length} entries in {monthLabel(mKey)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            {s.total === 0 ? (
              <Empty>No spending recorded yet — add a few entries first.</Empty>
            ) : mutation.isPending ? (
              <p className="text-sm text-soft">Reading your week…</p>
            ) : mutation.isError ? (
              <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral-deep">
                {(mutation.error as Error).message}
              </p>
            ) : lines.length === 0 ? (
              <Empty>Tap “Generate check” for a summary of your week.</Empty>
            ) : (
              <ul className="space-y-2.5 text-pretty text-sm">
                {lines.map((line, i) => {
                  const heading = /^(SUMMARY|OBSERVATIONS|TIPS):?/i.exec(line);
                  if (heading && line.replace(heading[0], "").trim() === "") {
                    return (
                      <li
                        key={i}
                        className="pt-2 text-xs font-semibold uppercase tracking-wide text-coral-deep"
                      >
                        {(heading[1] ?? "").toLowerCase()}
                      </li>
                    );
                  }
                  const text = line.replace(/^(SUMMARY|OBSERVATIONS|TIPS):?/i, "").replace(/^[-*]\s*/, "").trim();
                  return (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-coral" />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Category breakdown</h2>
          <p className="text-sm text-soft">{monthLabel(mKey)}</p>
          {s.byCategory.length === 0 ? (
            <div className="mt-4">
              <Empty>No spending recorded yet.</Empty>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {s.byCategory.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{c.category}</span>
                    <span className="text-soft">
                      {formatINR(c.total)} · {Math.round((c.total / s.total) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-canvas">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[c.category]}`}
                      style={{ width: `${(c.total / s.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-canvas p-4">
              <p className="text-xs text-soft">This week</p>
              <p className="font-display text-lg font-semibold">
                {formatINR(s.thisWeek)}
              </p>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <p className="text-xs text-soft">Weekly average</p>
              <p className="font-display text-lg font-semibold">
                {formatINR(s.avgWeekly)}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
