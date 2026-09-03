import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AllergyCalendar } from "@/components/AllergyCalendar";
import { AppShell, Card, Empty } from "@/components/AppShell";
import {
  allergyStats,
  currentMonthKey,
  formatDay,
  monthLabel,
  shiftMonth,
  todayISO,
  useAllergyEntries,
  type AllergyEntry,
  type Severity,
} from "@/lib/ledger";

export const Route = createFileRoute("/allergy")({
  head: () => ({
    meta: [
      { title: "Allergy Diary — Life Ledger" },
      {
        name: "description",
        content:
          "A calendar-based personal allergy diary: log severity, symptoms, possible triggers and notes, and see monthly patterns.",
      },
      { property: "og:title", content: "Allergy Diary — Life Ledger" },
      {
        property: "og:description",
        content:
          "Log allergy days on a calendar and spot your own patterns over the month.",
      },
    ],
  }),
  component: AllergyPage,
});

const SEVERITIES: Severity[] = ["None", "Mild", "Moderate", "Severe"];

const emptyForm = () => ({
  date: todayISO(),
  severity: "Mild" as Severity,
  symptoms: "",
  trigger: "",
  notes: "",
});

const inputCls =
  "w-full rounded-2xl bg-canvas px-4 py-2.5 text-sm outline-none ring-1 ring-ink/5 focus:ring-2 focus:ring-coral";

function AllergyPage() {
  const { entries, add, update, remove } = useAllergyEntries();
  const [mKey, setMKey] = useState(currentMonthKey());
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const a = allergyStats(entries, mKey);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      update({ ...form, id: editingId } as AllergyEntry);
      setEditingId(null);
    } else {
      add(form);
    }
    setForm(emptyForm());
  };

  const startEdit = (entry: AllergyEntry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      severity: entry.severity,
      symptoms: entry.symptoms,
      trigger: entry.trigger,
      notes: entry.notes,
    });
    setMKey(entry.date.slice(0, 7));
  };

  return (
    <AppShell eyebrow="Allergy diary" title="Days you felt it, gently logged">
      <p className="-mt-3 mb-6 max-w-2xl text-pretty text-sm text-soft">
        A personal diary and pattern tracker only — it doesn't diagnose anything or
        suggest treatment.
      </p>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">
            {editingId ? "Edit entry" : "Add an entry"}
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
              <label className="text-xs font-semibold text-soft">Allergy status</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, severity: s })}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-semibold ring-1 ring-ink/5 ${
                      form.severity === s
                        ? "bg-coral-deep text-surface"
                        : "bg-canvas text-soft"
                    }`}
                  >
                    {s === "None" ? "No symptoms" : s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-soft">Symptoms</label>
              <input
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                placeholder="sneezing, itchy eyes"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soft">Possible trigger</label>
              <input
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                placeholder="dust, pollen, cold air"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soft">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className={inputCls}
              />
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{monthLabel(mKey)}</h2>
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
          <div className="mt-5">
            <AllergyCalendar
              mKey={mKey}
              byDate={a.byDate}
              onPick={(iso) => {
                const existing = a.byDate.get(iso);
                if (existing) startEdit(existing);
                else {
                  setEditingId(null);
                  setForm({ ...emptyForm(), date: iso });
                }
              }}
            />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Allergy days
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">{a.days}</p>
          <p className="mt-1 text-xs text-soft">this month</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Severity breakdown
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            {a.breakdown.map((b) => (
              <div key={b.severity} className="flex items-center justify-between">
                <span className="text-soft">{b.severity}</span>
                <span className="font-semibold">{b.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">
            Frequent triggers
          </p>
          {a.triggers.length === 0 ? (
            <p className="mt-3 text-sm text-soft">No triggers noted yet.</p>
          ) : (
            <div className="mt-3 space-y-1.5 text-sm">
              {a.triggers.map((t) => (
                <div key={t.trigger} className="flex items-center justify-between">
                  <span className="text-soft">{t.trigger}</span>
                  <span className="font-semibold">{t.count}×</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">Trend</p>
          <p className="mt-2 font-display text-xl font-semibold text-leaf">{a.trend}</p>
          <p className="mt-1 text-xs text-soft">compared with last month</p>
        </Card>
      </section>

      <Card className="mt-6">
        <h2 className="font-display text-xl font-semibold">Entries this month</h2>
        {a.monthEntries.length === 0 ? (
          <div className="mt-4">
            <Empty>No allergy entries recorded yet.</Empty>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {[...a.monthEntries]
              .sort((x, y) => y.date.localeCompare(x.date))
              .map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-canvas px-4 py-3 text-sm"
                >
                  <span className="w-16 font-semibold">{formatDay(e.date)}</span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold">
                    {e.severity === "None" ? "No symptoms" : e.severity}
                  </span>
                  <span className="text-soft">{e.symptoms || "—"}</span>
                  {e.trigger && (
                    <span className="text-xs text-soft">trigger: {e.trigger}</span>
                  )}
                  {e.notes && <span className="text-xs text-soft">{e.notes}</span>}
                  <span className="ml-auto flex gap-2">
                    <button
                      onClick={() => startEdit(e)}
                      className="rounded-xl bg-surface px-3 py-1 text-xs font-semibold text-lagoon"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="rounded-xl bg-surface px-3 py-1 text-xs font-semibold text-coral-deep"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
