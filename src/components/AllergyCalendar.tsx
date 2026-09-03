import { type AllergyEntry, monthGrid, SEVERITY_COLORS } from "@/lib/ledger";

export function AllergyCalendar({
  mKey,
  byDate,
  onPick,
}: {
  mKey: string;
  byDate: Map<string, AllergyEntry>;
  onPick?: (iso: string) => void;
}) {
  const cells = monthGrid(mKey);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-soft">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} className="aspect-square" />;
          const entry = byDate.get(iso);
          const tone =
            entry && entry.severity !== "None"
              ? SEVERITY_COLORS[entry.severity]
              : entry
                ? "bg-canvas ring-1 ring-leaf/30 text-soft"
                : "bg-canvas text-ink/70";
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onPick?.(iso)}
              className={`grid aspect-square place-items-center rounded-xl text-xs font-semibold transition-transform hover:scale-105 ${tone}`}
              title={entry ? `${entry.severity}${entry.trigger ? ` · ${entry.trigger}` : ""}` : "No entry"}
            >
              {Number(iso.slice(8, 10))}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-mint" />
          Mild
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-butter" />
          Moderate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-coral" />
          Severe
        </span>
      </div>
    </div>
  );
}
