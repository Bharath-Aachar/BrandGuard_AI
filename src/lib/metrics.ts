import type { Finding, Metrics, RiskLevel, Scan } from "@/types";
import { RISK_ORDER, levelFromScore } from "./risk";

const zero = (): Record<RiskLevel, number> => ({ Critical: 0, High: 0, Medium: 0, Low: 0 });

export function computeMetrics(scans: Scan[]): Metrics {
  const distribution = zero();
  const findingsBySeverity = zero();
  let sum = 0;
  let totalFindings = 0;
  for (const s of scans) {
    sum += s.score;
    distribution[levelFromScore(s.score)]++;
    for (const f of s.findings) { findingsBySeverity[f.severity]++; totalFindings++; }
  }
  const avgScore = scans.length ? Math.round(sum / scans.length) : 0;
  return {
    avgScore, scoreLevel: levelFromScore(avgScore), totalScans: scans.length, totalFindings,
    findingsBySeverity, distribution, highRiskCount: distribution.Critical + distribution.High,
  };
}

export interface AttentionItem { finding: Finding; scan: Scan }

/** Up to three most severe findings (Critical/High), newest first within a severity. */
export function needsAttention(scans: Scan[], limit = 3): AttentionItem[] {
  return scans
    .flatMap((scan) => scan.findings.filter((f) => f.severity === "Critical" || f.severity === "High").map((finding) => ({ finding, scan })))
    .sort((a, b) => RISK_ORDER.indexOf(a.finding.severity) - RISK_ORDER.indexOf(b.finding.severity) || b.scan.date.localeCompare(a.scan.date))
    .slice(0, limit);
}
