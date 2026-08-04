import type { PhonemeToken } from "@/lib/activityData";

export function PhonemeChip({ phoneme }: { phoneme: PhonemeToken }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900"
      title={`${phoneme.symbol} = ${phoneme.label} as in ${phoneme.example}`}
    >
      <span>{phoneme.symbol}</span>
      <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-700">
        {phoneme.label}
      </span>
    </span>
  );
}
