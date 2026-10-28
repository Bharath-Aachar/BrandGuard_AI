"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { activities, REFERENCE_DATE, scans } from "@/lib/mock-data";
import { computeMetrics, needsAttention } from "@/lib/metrics";
import { RISK_ORDER } from "@/lib/risk";
import PageHeader from "./PageHeader";
import MetricCard from "./MetricCard";
import RiskDistribution from "./RiskDistribution";
import RecentScansTable from "./RecentScansTable";
import FindingItem from "./FindingItem";
import ActivityList from "./ActivityList";
import RiskBadge from "./RiskBadge";

const RANGES = [{ label: "Last 7 days", days: 7 }, { label: "Last 30 days", days: 30 }, { label: "All demo data", days: 0 }];

export default function DashboardView() {
  const [days, setDays] = useState(0);
  const inRange = useMemo(() => {
    if (!days) return scans;
    const cutoff = new Date(REFERENCE_DATE).getTime() - days * 86400000;
    return scans.filter((s) => new Date(s.date).getTime() >= cutoff);
  }, [days]);
  const m = useMemo(() => computeMetrics(inRange), [inRange]);
  const attention = useMemo(() => needsAttention(inRange), [inRange]);
  const recent = [...inRange].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const empty = m.totalScans === 0;

  return (
    <>
      <PageHeader
        title="Brand Safety Overview"
        description="Monitor content risks, compliance violations, and brand safety across your recent scans."
        actions={
          <>
            <label className="sr-only" htmlFor="range">Date range</label>
            <select id="range" value={days} onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg">
              {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
            </select>
            <Link href="/scanner" className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              <ScanSearch size={16} aria-hidden /> Scan New Content
            </Link>
          </>
        }
      />
      <p className="mb-4 rounded-md border border-line bg-surface px-3 py-2 text-xs text-muted">
        Demo data. These figures come from sample records, not live scans.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Brand Safety Score" value={empty ? "–" : m.avgScore} suffix={empty ? undefined : "/ 100"}>
          {!empty && <RiskBadge level={m.scoreLevel} />}
        </MetricCard>
        <MetricCard label="Total Posts Scanned" value={m.totalScans} detail="Completed scans in this period" />
        <MetricCard label="Risks Detected" value={m.totalFindings}
          detail={RISK_ORDER.map((k) => `${m.findingsBySeverity[k]} ${k.toLowerCase()}`).join(" · ")} />
        <MetricCard label="High-Risk Content" value={m.highRiskCount} detail="Scans scoring below 70 (High or Critical)" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3"><RiskDistribution distribution={m.distribution} /></div>
        <section aria-labelledby="attention" className="rounded-lg border border-line bg-surface p-5 lg:col-span-2">
          <h2 id="attention" className="mb-4 text-base font-semibold">Needs Attention</h2>
          {attention.length === 0
            ? <p className="py-6 text-center text-sm text-muted">No critical or high findings in this period.</p>
            : <ul className="divide-y divide-line/60">{attention.map((a) => <FindingItem key={a.scan.id + a.finding.id} {...a} />)}</ul>}
        </section>
      </div>

      <section aria-labelledby="recent" className="mt-6 rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 id="recent" className="text-base font-semibold">Recent Scans</h2>
          <Link href="/scans" className="text-sm text-accent hover:underline">View All Scans</Link>
        </div>
        <RecentScansTable scans={recent} emptyHref="/scanner" />
      </section>

      <div className="mt-6"><ActivityList items={activities} /></div>
    </>
  );
}
