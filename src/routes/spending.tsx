import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, Card, Empty } from "@/components/AppShell";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  currentMonthKey,
  formatDay,
  formatINR,
  monthKey,
  monthLabel,
  shiftMonth,
  spendStats,
  todayISO,
  useAllowance,
  useSpendEntries,
  weekOfMonth,
  type Category,
  type SpendEntry,
} from "@/lib/ledger";

export const Route = createFileRoute("/spending")({
  head: () => ({
    meta: [
      { title: "Spending Recorder — Life Ledger" },
      {
        name: "description",
        content:
          "Record daily spending in rupees with descriptions and categories, set a monthly allowance, and see weekly and monthly totals automatically.",
      },
      { property: "og:title", content: "Spending Recorder — Life Ledger" },
      {
        property: "og:description",
        content:
          "Track every rupee with descriptions, categories and automatic weekly totals.",
      },
    ],
  }),
  component: SpendingPage,
});

const inputCls =
  "w-full rounded-2xl bg-canvas px-4 py-2.5 text-sm outline-none ring-1 ring-ink/5 focus:ring-2 focus:ring-coral";

const emptyForm = () => ({
  date: todayISO(),
  description: "",
  category: "Food" as Category,
  amount: "",
});

function SpendingPage() {
  const { entries, add, update, remove } = useSpendEntries();
  const { allowance, setAllowance } = useAllowance();
  const [mKey, setMKey] = useState(currentMonthKey());
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<"all" | number>("all");
  const [catFilter, setCatFilter] = useState<"all" | Category>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [allowanceDraft, setAllowanceDraft] = useState<string | null>(null);

  const s = spendStats(entries, mKey, allowance);

  const rows = useMemo(() => {
    let list = s.monthEntries;
    if (weekFilter !== "all")
      list = list.filter((e) => weekOfMonth(e.date) === weekFilter);
    if (catFilter !== "all") list = list.filter((e) => e.category === catFilter);
    return [...list].sort((a, b) => {
      const v =
        sortBy === "date" ? a.date.localeCompare(b.date) : a.amount - b.amount;
      return sortDir === "asc" ? v : -v;
    });
  }, [s.monthEntries, weekFilter, catFilter, sortBy, sortDir]);

  const filteredTotal = rows.reduce((sum, e) => sum + e.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const payload = {
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount,
    };
    if (editingId) {
      update({ ...payload, id: editingId } as SpendEntry);
      setEditingId(null);
    } else {
      add(payload);
      setMKey(monthKey(form.date));
    }
    setForm({ ...emptyForm(), date: form.date });
  };

  const startEdit = (e: SpendEntry) => {
    setEditingId(e.id);
    setForm({
      date: e.date,
      description: e.description,
      category: e.category,
      amount: String(e.amount),
    });
  };

  const toggleSort = (key: "date" | "amount") => {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  return (
    <AppShell eyebrow={monthLabel(mKey)} title="Every rupee, softly recorded">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-ink/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Monthly allowance
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold">₹</span>
            <input
              type="number"
              min={0}
              value={allowanceDraft ?? allowance}
              onChange={(e) => setAllowanceDraft(e.target.value)}
              onBlur={() => {
                const v = Number(allowanceDraft);
                if (allowanceDraft !== null && Number.isFinite(v) && v >= 0)
                  setAllowance(v);
                setAllowanceDraft(null);
              }}
              className="w-full min-w-0 bg-transparent font-display text-3xl font-semibold outline-none"
              aria-label="Monthly allowance"
            />
          </div>
          <p className="mt-1 text-xs text-soft">editable · saved</p>
        </div>
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-ink/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Total spent
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">{formatINR(s.total)}</p>
          <p className="mt-1 text-xs text-soft">{Math.round(s.percent)}% used</p>
        </div>
        <div className="rounded-3xl bg-mint/40 p-5 ring-1 ring-leaf/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
            Remaining
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {formatINR(s.remaining)}
          </p>
          <p className="mt-1 text-xs text-leaf/80">
            avg weekly {formatINR(s.avgWeekly)}
          </p>
        </div>
        <div className="rounded-3xl bg-sky/40 p-5 ring-1 ring-lagoon/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-lagoon">
            This week
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {formatINR(s.thisWeek)}
          </p>
          <p className="mt-1 text-xs text-lagoon/80">week {s.currentWeek}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">
            {editingId ? "Edit spending" : "Add spending"}
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-soft">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soft">Description</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="snacks from canteen"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-soft">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as Category })
                  }
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-soft">Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-2xl bg-coral-deep px-4 py-2.5 text-sm font-semibold text-surface"
              >
                {editingId ? "Save changes" : "Add entry"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm());
                  }}
                  className="rounded-2xl bg-canvas px-4 py-2.5 text-sm font-semibold text-soft"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Weekly totals</h2>
              <p className="text-sm text-soft">{monthLabel(mKey)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMKey(shiftMonth(mKey, -1))}
                className="rounded-xl bg-canvas px-3 py-1.5 text-sm font-semibold text-soft"
              >
                ←
              </button>
              <button
                onClick={() => setMKey(currentMonthKey())}
                className="rounded-xl bg-canvas px-3 py-1.5 text-xs font-semibold text-soft"
              >
                Today
              </button>
              <button
                onClick={() => setMKey(shiftMonth(mKey, 1))}
                className="rounded-xl bg-canvas px-3 py-1.5 text-sm font-semibold text-soft"
              >
                →
              </button>
            </div>
          </div>
          {s.total === 0 ? (
            <div className="mt-6">
              <Empty>No spending recorded yet.</Empty>
            </div>
          ) : (
            <div className="mt-6 flex h-40 items-stretch gap-3">
              {s.weeks.map((w, i) => {
                const max = Math.max(...s.weeks.map((x) => x.total), 1);
                const tones = ["bg-blossom", "bg-sky", "bg-butter", "bg-mint", "bg-coral"];
                return (
                  <div key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[11px] font-semibold text-soft">
                      {w.total ? formatINR(w.total) : ""}
                    </span>
                    <div
                      className={`w-full rounded-b-md rounded-t-2xl ${tones[i]}`}
                      style={{ height: `${Math.max(2, (w.total / max) * 100)}%`, minHeight: 6 }}
                    />
                    <span className="text-xs font-semibold text-soft">W{w.week}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Spending log</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={weekFilter}
              onChange={(e) =>
                setWeekFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="rounded-xl bg-canvas px-3 py-2 font-semibold text-soft outline-none"
            >
              <option value="all">All weeks</option>
              {[1, 2, 3, 4, 5].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as Category | "all")}
              className="rounded-xl bg-canvas px-3 py-2 font-semibold text-soft outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="rounded-full bg-coral/15 px-3 py-1.5 font-semibold text-coral-deep">
              {formatINR(filteredTotal)}
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-4">
            <Empty>No spending recorded yet.</Empty>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-soft">
                  <th className="pb-2">
                    <button onClick={() => toggleSort("date")} className="font-semibold">
                      Date {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2">
                    <button onClick={() => toggleSort("amount")} className="font-semibold">
                      Amount {sortBy === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 font-semibold">Week</th>
                  <th className="pb-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-t border-canvas">
                    <td className="py-2.5 font-semibold">{formatDay(e.date)}</td>
                    <td className="py-2.5 text-soft">{e.description}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold">
                        <i
                          className={`size-2 rounded-full ${CATEGORY_COLORS[e.category]}`}
                        />
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold">{formatINR(e.amount)}</td>
                    <td className="py-2.5 text-soft">W{weekOfMonth(e.date)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => startEdit(e)}
                        className="rounded-xl bg-canvas px-3 py-1 text-xs font-semibold text-lagoon"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(e.id)}
                        className="ml-2 rounded-xl bg-canvas px-3 py-1 text-xs font-semibold text-coral-deep"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
