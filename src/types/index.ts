export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export interface Finding {
  id: string;
  title: string;
  severity: RiskLevel;
  explanation: string;
  excerpt: string;
}

export interface Scan {
  id: string;
  title: string;
  platform: string;
  date: string; // ISO date
  score: number; // 0-100, higher is safer
  content: string;
  findings: Finding[];
  suggestions: string[];
}

export interface Activity {
  id: string;
  text: string;
  date: string;
}

export interface Metrics {
  avgScore: number;
  scoreLevel: RiskLevel;
  totalScans: number;
  totalFindings: number;
  findingsBySeverity: Record<RiskLevel, number>;
  highRiskCount: number;
  distribution: Record<RiskLevel, number>;
}
