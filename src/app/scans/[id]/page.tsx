import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import RiskBadge from "@/components/RiskBadge";
import { getScan, scans } from "@/lib/mock-data";
import { formatDate, levelFromScore } from "@/lib/risk";

export function generateStaticParams() {
  return scans.map((s) => ({ id: s.id }));
}

export default async function ScanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = getScan(id);
  if (!scan) notFound();

  return (
    <DashboardLayout>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} aria-hidden /> Back to dashboard
      </Link>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{scan.title}</h1>
          <p className="mt-1 text-sm text-muted">{scan.platform} · Scanned {formatDate(scan.date)} · Demo record</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold tabular-nums">{scan.score}<span className="ml-1 text-base font-normal text-muted">/ 100</span></span>
          <RiskBadge level={levelFromScore(scan.score)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="orig" className="rounded-lg border border-line bg-surface p-5 lg:col-span-3">
          <h2 id="orig" className="mb-3 text-base font-semibold">Original content</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{scan.content}</p>
        </section>
        <section aria-labelledby="sugg" className="rounded-lg border border-line bg-surface p-5 lg:col-span-2">
          <h2 id="sugg" className="mb-3 text-base font-semibold">Suggested improvements</h2>
          <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted marker:text-accent">
            {scan.suggestions.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      </div>

      <section aria-labelledby="finds" className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 id="finds" className="mb-3 text-base font-semibold">Detected findings ({scan.findings.length})</h2>
        {scan.findings.length === 0 ? (
          <p className="py-4 text-sm text-muted">No issues detected in this content.</p>
        ) : (
          <ul className="divide-y divide-line/60">
            {scan.findings.map((f) => (
              <li key={f.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{f.title}</p><RiskBadge level={f.severity} />
                </div>
                <p className="mt-1 text-sm text-muted">{f.explanation}</p>
                <p className="mt-1 text-xs text-muted">Found in: “{f.excerpt}”</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
