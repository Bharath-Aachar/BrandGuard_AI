import type { RiskLevel } from "@/types";
import { RISK_STYLE } from "@/lib/risk";

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
      {level}
    </span>
  );
}
