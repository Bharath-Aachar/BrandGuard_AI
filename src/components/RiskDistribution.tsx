import type { Metrics } from "@/types";
import { RISK_ORDER, RISK_STYLE } from "@/lib/risk";

export default function RiskDistribution({ distribution }: { distribution: Metrics["distribution"] }) {
  const total = RISK_ORDER.reduce((n, k) => n + distribution[k], 0);
  const max = Math.max(1, ...RISK_ORDER.map((k) => distribution[k]));
  return (
    <section aria-labelledby="risk-dist" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="risk-dist" className="text-base font-semibold">Risk Distribution</h2>
      <p className="mt-0.5 text-xs text-muted">Scans by risk level. Based on safety score.</p>
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No scans in this period.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {RISK_ORDER.map((level) => {
            const n = distribution[level];
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <li key={level} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm" title={`${level}: ${n} of ${total} scans (${pct}%)`}>
                <span className="text-muted">{level}</span>
                <div className="h-2 rounded-full bg-surface2" role="img" aria-label={`${level}: ${n} scans, ${pct}%`}>
                  {n > 0 && <div className={`h-2 rounded-full ${RISK_STYLE[level].bar}`} style={{ width: `${(n / max) * 100}%` }} />}
                </div>
                <span className="text-right tabular-nums">{n} <span className="text-xs text-muted">{pct}%</span></span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
