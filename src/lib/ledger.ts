import { useCallback, useEffect, useState } from "react";

export type Severity = "None" | "Mild" | "Moderate" | "Severe";

export type AllergyEntry = {
  id: string;
  date: string; // yyyy-mm-dd
  severity: Severity;
  symptoms: string;
  trigger: string;
  notes: string;
};

export const CATEGORIES = [
  "Food",
  "Transport",
  "College",
  "Shopping",
  "Entertainment",
  "Personal",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type SpendEntry = {
  id: string;
  date: string; // yyyy-mm-dd
  description: string;
  category: Category;
  amount: number;
};

const KEYS = {
  allergy: "life-ledger:allergy",
  spend: "life-ledger:spending",
  allowance: "life-ledger:allowance",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function useAllergyEntries() {
  const [entries, setEntries, hydrated] = usePersistentState<AllergyEntry[]>(
    KEYS.allergy,
    [],
  );

  const add = useCallback(
    (entry: Omit<AllergyEntry, "id">) =>
      setEntries((prev) => [...prev, { ...entry, id: uid() }]),
    [setEntries],
  );
  const update = useCallback(
    (entry: AllergyEntry) =>
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e))),
    [setEntries],
  );
  const remove = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  return { entries, add, update, remove, hydrated };
}

export function useSpendEntries() {
  const [entries, setEntries, hydrated] = usePersistentState<SpendEntry[]>(
    KEYS.spend,
    [],
  );

  const add = useCallback(
    (entry: Omit<SpendEntry, "id">) =>
      setEntries((prev) => [...prev, { ...entry, id: uid() }]),
    [setEntries],
  );
  const update = useCallback(
    (entry: SpendEntry) =>
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e))),
    [setEntries],
  );
  const remove = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  return { entries, add, update, remove, hydrated };
}

export function useAllowance() {
  const [allowance, setAllowance, hydrated] = usePersistentState<number>(
    KEYS.allowance,
    5000,
  );
  return { allowance, setAllowance, hydrated };
}

/* ---------- date + money helpers ---------- */

export const todayISO = () => {
  const d = new Date();
  return toISO(d);
};

export function toISO(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export const monthKey = (iso: string) => iso.slice(0, 7);

export const currentMonthKey = () => todayISO().slice(0, 7);

/** Week of the month: 1-5, based on day-of-month blocks of 7. */
export function weekOfMonth(iso: string) {
  const day = Number(iso.slice(8, 10));
  return Math.floor((day - 1) / 7) + 1;
}

export function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function monthLabel(key: string) {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function formatDay(iso: string) {
  return parseISO(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function shiftMonth(key: string, delta: number) {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
}

export function monthGrid(key: string) {
  const [y = 1970, m = 1] = key.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = first.getDay(); // 0 = Sunday
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${key}-${`${d}`.padStart(2, "0")}`);
  }
  return cells;
}

/* ---------- derived stats ---------- */

export const SEVERITY_COLORS: Record<Exclude<Severity, "None">, string> = {
  Mild: "bg-mint/60 text-leaf",
  Moderate: "bg-butter/70 text-sun",
  Severe: "bg-coral/50 text-coral-deep",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "bg-coral",
  Transport: "bg-sky",
  College: "bg-butter",
  Shopping: "bg-blossom",
  Entertainment: "bg-lilac",
  Personal: "bg-mint",
  Other: "bg-soft",
};

export function spendStats(entries: SpendEntry[], mKey: string, allowance: number) {
  const monthEntries = entries.filter((e) => monthKey(e.date) === mKey);
  const total = monthEntries.reduce((s, e) => s + e.amount, 0);
  const remaining = allowance - total;
  const percent = allowance > 0 ? Math.min(999, (total / allowance) * 100) : 0;

  const weeks = [1, 2, 3, 4, 5].map((w) => ({
    week: w,
    total: monthEntries
      .filter((e) => weekOfMonth(e.date) === w)
      .reduce((s, e) => s + e.amount, 0),
  }));
  const activeWeeks = weeks.filter((w) => w.total > 0);
  const avgWeekly = activeWeeks.length
    ? activeWeeks.reduce((s, w) => s + w.total, 0) / activeWeeks.length
    : 0;

  const isCurrentMonth = mKey === currentMonthKey();
  const currentWeek = isCurrentMonth ? weekOfMonth(todayISO()) : weeks.length;
  const thisWeek = weeks.find((w) => w.week === currentWeek)?.total ?? 0;

  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    total: monthEntries
      .filter((e) => e.category === c)
      .reduce((s, e) => s + e.amount, 0),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    monthEntries,
    total,
    remaining,
    percent,
    weeks,
    avgWeekly,
    thisWeek,
    currentWeek,
    byCategory,
    topCategory: byCategory[0],
  };
}

export function allergyStats(entries: AllergyEntry[], mKey: string) {
  const monthEntries = entries.filter((e) => monthKey(e.date) === mKey);
  const symptomDays = monthEntries.filter((e) => e.severity !== "None");
  const breakdown = (["Mild", "Moderate", "Severe"] as const).map((s) => ({
    severity: s,
    count: symptomDays.filter((e) => e.severity === s).length,
  }));

  const triggerMap = new Map<string, number>();
  symptomDays.forEach((e) => {
    const t = e.trigger.trim();
    if (!t) return;
    triggerMap.set(t, (triggerMap.get(t) ?? 0) + 1);
  });
  const triggers = [...triggerMap.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const prevKey = shiftMonth(mKey, -1);
  const prevCount = entries.filter(
    (e) => monthKey(e.date) === prevKey && e.severity !== "None",
  ).length;
  const diff = symptomDays.length - prevCount;
  const trend =
    prevCount === 0 && symptomDays.length === 0
      ? "no data yet"
      : diff > 0
        ? `up ${diff} vs last month`
        : diff < 0
          ? `down ${Math.abs(diff)} vs last month`
          : "same as last month";

  const byDate = new Map(monthEntries.map((e) => [e.date, e]));

  return {
    monthEntries,
    days: symptomDays.length,
    breakdown,
    triggers,
    trend,
    diff,
    byDate,
  };
}
