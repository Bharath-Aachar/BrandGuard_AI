import Link from "next/link";
import type { AttentionItem } from "@/lib/metrics";
import RiskBadge from "./RiskBadge";

export default function FindingItem({ finding, scan }: AttentionItem) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{finding.title}</p>
        <RiskBadge level={finding.severity} />
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">{finding.explanation}</p>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-muted">{scan.title}</span>
        <Link href={`/scans/${scan.id}`} className="shrink-0 text-accent hover:underline">View scan</Link>
      </div>
    </li>
  );
}
