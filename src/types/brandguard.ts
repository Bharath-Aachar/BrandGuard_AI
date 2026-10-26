export type Severity = 'critical' | 'warning' | 'info' | 'compliant';

export interface Violation {
  id: string;
  category: 'legal' | 'tone' | 'trademark' | 'claim' | 'toxicity';
  severity: Severity;
  phrase: string;
  startIndex: number;
  endIndex: number;
  title: string;
  explanation: string;
  suggestedFix: string;
  ruleViolated: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  weight: number;
  status: 'passed' | 'warning' | 'failed';
  icon: string;
}

export interface ScanResult {
  overallScore: number; // 0 - 100
  status: 'approved' | 'review_required' | 'rejected';
  summary: string;
  scannedAt: string;
  wordCount: number;
  readingTimeSeconds: number;
  categories: {
    legal: CategoryScore;
    tone: CategoryScore;
    trademark: CategoryScore;
    claims: CategoryScore;
    brandSafety: CategoryScore;
  };
  violations: Violation[];
  aiRewrittenText?: string;
}

export interface BrandPolicy {
  id: string;
  name: string;
  industry: string;
  tone: {
    formality: number; // 0 (casual) - 100 (executive)
    boldness: number;   // 0 (subtle) - 100 (hyper-bold)
    technicality: number; // 0 (simple) - 100 (deep tech)
  };
  prohibitedTerms: string[];
  mandatoryDisclaimers: string[];
  competitorExclusions: string[];
  restrictedClaims: string[];
}

export interface ThreatMention {
  id: string;
  source: 'Twitter/X' | 'Reddit' | 'Ad Network' | 'TikTok' | 'Web Domain' | 'Press';
  author: string;
  handle: string;
  timestamp: string;
  content: string;
  threatLevel: 'high' | 'medium' | 'low';
  type: 'Counterfeit Ad' | 'Trademark Misuse' | 'PR Crisis / Sentiment' | 'Spoofed Domain' | 'Unauthorized Endorsement';
  sentimentScore: number; // -1.0 to 1.0
  status: 'unresolved' | 'investigating' | 'mitigated';
  reachEstimated: string;
}

export interface PresetSample {
  id: string;
  title: string;
  tag: string;
  industry: string;
  description: string;
  text: string;
}
