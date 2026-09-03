import { createFileRoute, Link } from "@tanstack/react-router";

import { AllergyCalendar } from "@/components/AllergyCalendar";
import { AppShell, Card, Empty } from "@/components/AppShell";
import {
  allergyStats,
  currentMonthKey,
  formatINR,
  monthLabel,
  spendStats,
  todayISO,
  useAllergyEntries,
  useAllowance,
  useSpendEntries,
  weekOfMonth,
  CATEGORY_COLORS,
} from "@/lib/ledger";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life Ledger — Your month at a glance" },
      {
        name: "description",
        content:
          "A gentle personal dashboard for tracking allergy days and everyday rupee spending, with weekly totals and friendly insights.",
      },
      { property: "og:title", content: "Life Ledger — Your month at a glance" },
      {
        property: "og:description",
        content:
          "Track allergy days and daily spending in one soft, playful personal dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const mKey = currentMonthKey();
  const { allowance } = useAllowance();
  const { entries: spends } = useSpendEntries();
  const { entries: allergies } = useAllergyEntries();

  const s = spendStats(spends, mKey, allowance);
  const a = allergyStats(allergies, mKey);
  const maxWeek = Math.max(...s.weeks.map((w) => w.total), 1);
  const weekTones = ["bg-blossom", "bg-sky", "bg-butter", "bg-mint", "bg-coral"];

  return (
    <AppShell
      eyebrow={`${monthLabel(mKey)} · week ${weekOfMonth(todayISO())}`}
      title="Your month at a glance"
      action={
        <Link
          to="/spending"
          className="rounded-2xl bg-coral-deep px-4 py-2.5 text-sm font-semibold text-surface ring-1 ring-coral-deep/50"
        >
          New entry
        </Link>
      }
    >
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-ink/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Allowance
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {formatINR(allowance)}
          </p>
          <p className="mt-1 text-xs text-soft">editable · saved</p>
        </div>
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-ink/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">Spent</p>
          <p className="mt-2 font-display text-3xl font-semibold">{formatINR(s.total)}</p>
          <p className="mt-1 text-xs text-soft">
            {Math.round(s.percent)}% of allowance
          </p>
        </div>
        <div className="rounded-3xl bg-mint/40 p-5 ring-1 ring-leaf/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
            Remaining
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {formatINR(s.remaining)}
          </p>
          <p className="mt-1 text-xs text-leaf/80">
            this week {formatINR(s.thisWeek)}
          </p>
        </div>
        <div className="rounded-3xl bg-sky/40 p-5 ring-1 ring-lagoon/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-lagoon">
            Allergy days
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">{a.days}</p>
          <p className="mt-1 text-xs text-lagoon/80">
            {a.breakdown.map((b) => `${b.count} ${b.severity.toLowerCase()}`).join(" · ")}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="max-w-[26ch] text-balance font-display text-xl font-semibold">
                Spending trend
              </h2>
              <p className="text-pretty text-sm text-soft">
                Weeks of {monthLabel(mKey)}, ₹ per week
              </p>
            </div>
            <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold text-coral-deep">
              avg {formatINR(s.avgWeekly)}
            </span>
          </div>
          {s.total === 0 ? (
            <div className="mt-6">
              <Empty>No spending recorded yet.</Empty>
            </div>
          ) : (
            <div className="mt-6 flex h-44 items-stretch gap-3">
              {s.weeks.map((w, i) => (
                <div key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className={`w-full rounded-b-md rounded-t-2xl ${weekTones[i]}`}
                    style={{ height: `${Math.max(2, (w.total / maxWeek) * 100)}%`, minHeight: 6 }}
                    title={formatINR(w.total)}
                  />
                  <span
                    className={`text-xs font-semibold ${w.week === s.currentWeek ? "text-coral-deep" : "text-soft"}`}
                  >
                    W{w.week}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-soft">
            <span>
              Top category:{" "}
              <span className="font-semibold text-ink">
                {s.topCategory
                  ? `${s.topCategory.category} · ${formatINR(s.topCategory.total)}`
                  : "—"}
              </span>
            </span>
            <span>
              This week:{" "}
              <span className="font-semibold text-ink">{formatINR(s.thisWeek)}</span>
            </span>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="max-w-[20ch] text-balance font-display text-xl font-semibold">
              Allergy mini-calendar
            </h2>
            <span className="text-xs font-semibold text-leaf">{a.trend}</span>
          </div>
          <div className="mt-5">
            <AllergyCalendar mKey={mKey} byDate={a.byDate} />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-lilac text-plum">
              ✷
            </span>
            <div>
              <h2 className="max-w-[24ch] text-balance font-display text-xl font-semibold">
                Where your money goes
              </h2>
              <p className="text-pretty text-sm text-soft">
                Category share for {monthLabel(mKey)}
              </p>
            </div>
          </div>
          {s.byCategory.length === 0 ? (
            <div className="mt-4">
              <Empty>No spending recorded yet.</Empty>
            </div>
          ) : (
            <>
              <div className="mt-4 flex h-4 items-center overflow-hidden rounded-full bg-canvas">
                {s.byCategory.map((c) => (
                  <div
                    key={c.category}
                    className={`h-full ${CATEGORY_COLORS[c.category]}`}
                    style={{ width: `${(c.total / s.total) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-soft">
                {s.byCategory.map((c) => (
                  <span key={c.category} className="inline-flex items-center gap-1.5">
                    <i
                      className={`size-2.5 rounded-full ${CATEGORY_COLORS[c.category]}`}
                    />
                    {c.category} {formatINR(c.total)}
                  </span>
                ))}
              </div>
            </>
          )}
          <Link
            to="/ai-check"
            className="mt-5 inline-block rounded-2xl bg-lilac/50 px-4 py-2 text-sm font-semibold text-plum"
          >
            Run this week's spending check →
          </Link>
        </Card>

        <div className="rounded-[32px] bg-gradient-to-br from-blossom/40 to-lilac/30 p-6 ring-1 ring-ink/5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-surface text-coral-deep">
              ✦
            </span>
            <h2 className="max-w-[18ch] text-balance font-display text-xl font-semibold">
              Combined insights
            </h2>
          </div>
          <p className="mt-3 text-pretty text-sm text-soft">
            Two separate trackers, one gentle summary.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-surface/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
                Allergy
              </p>
              <p className="mt-1 text-pretty text-sm">
                {a.monthEntries.length === 0
                  ? "No allergy entries yet this month."
                  : `${a.days} symptom ${a.days === 1 ? "day" : "days"} logged — ${a.trend}.${
                      a.triggers[0]
                        ? ` Most noted trigger: ${a.triggers[0].trigger}.`
                        : ""
                    }`}
              </p>
            </div>
            <div className="rounded-2xl bg-surface/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-coral-deep">
                Spending
              </p>
              <p className="mt-1 text-pretty text-sm">
                {s.total === 0
                  ? "No spending recorded yet."
                  : `${formatINR(s.total)} spent so far, ${Math.round(s.percent)}% of your allowance.${
                      s.topCategory ? ` ${s.topCategory.category} leads the month.` : ""
                    }`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
