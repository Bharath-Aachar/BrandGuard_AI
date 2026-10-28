import Link from "next/link";
import type { Scan } from "@/types";
import { formatDate, levelFromScore } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

export default function RecentScansTable({ scans, emptyHref }: { scans: Scan[]; emptyHref?: string }) {
  if (scans.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted">
        No scans in this period.{emptyHref && <> <Link href={emptyHref} className="text-accent hover:underline">Scan new content</Link> to get started.</>}
      </div>
    );
  }
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="px-5 py-2.5 font-medium">Content</th>
            <th className="px-3 py-2.5 font-medium">Platform</th>
            <th className="px-3 py-2.5 font-medium">Scanned</th>
            <th className="px-3 py-2.5 text-right font-medium">Score</th>
            <th className="px-3 py-2.5 font-medium">Risk</th>
            <th className="px-3 py-2.5 text-right font-medium">Issues</th>
            <th className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s) => (
            <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-surface2/50">
              <td className="max-w-[16rem] truncate px-5 py-3 font-medium">{s.title}</td>
              <td className="px-3 py-3 text-muted">{s.platform}</td>
              <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(s.date)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{s.score}</td>
              <td className="px-3 py-3"><RiskBadge level={levelFromScore(s.score)} /></td>
              <td className="px-3 py-3 text-right tabular-nums">{s.findings.length}</td>
              <td className="px-5 py-3 text-right">
                <Link href={`/scans/${s.id}`} aria-label={`View details for ${s.title}`} className="text-accent hover:underline">View details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-line/60 md:hidden">
        {scans.map((s) => (
          <li key={s.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{s.title}</p>
              <RiskBadge level={levelFromScore(s.score)} />
            </div>
            <p className="mt-1 text-xs text-muted">{s.platform} · {formatDate(s.date)}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Score <span className="text-fg tabular-nums">{s.score}</span> · {s.findings.length} issues</span>
              <Link href={`/scans/${s.id}`} aria-label={`View details for ${s.title}`} className="text-accent hover:underline">View details</Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
