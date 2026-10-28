import type { RiskLevel } from "@/types";

export const RISK_ORDER: RiskLevel[] = ["Critical", "High", "Medium", "Low"];

/** Single classification rule used everywhere: score -> risk level. */
export function levelFromScore(score: number): RiskLevel {
  if (score >= 85) return "Low";
  if (score >= 70) return "Medium";
  if (score >= 50) return "High";
  return "Critical";
}

export const RISK_STYLE: Record<RiskLevel, { text: string; bg: string; bar: string }> = {
  Critical: { text: "text-critical", bg: "bg-critical/10", bar: "bg-critical" },
  High: { text: "text-high", bg: "bg-high/10", bar: "bg-high" },
  Medium: { text: "text-medium", bg: "bg-medium/10", bar: "bg-medium" },
  Low: { text: "text-low", bg: "bg-low/10", bar: "bg-low" },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
