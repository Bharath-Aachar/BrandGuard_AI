export type Severity = 'critical' | 'warning' | 'info' | 'compliant';
export type FindingCategory = 'legal' | 'tone' | 'trademark' | 'claim' | 'toxicity';
export type AnalysisMethod = 'deterministic' | 'contextual_ai';
export type ScanStatus = 'approved' | 'review_required' | 'rejected' | 'not_scanned';
export type ReviewWorkflowStatus = 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'rejected';
export type UserRole = 'creator' | 'reviewer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Violation {
  id: string;
  category: FindingCategory;
  severity: Severity;
  phrase: string;
  startIndex: number;
  endIndex: number;
  title: string;
  explanation: string;
  suggestedFix: string;
  ruleViolated: string;
  sourcePolicy?: string;
  analysisMethod: AnalysisMethod;
  isContextual?: boolean;
  confidence?: number; // 0.0 - 1.0
  needsHumanReview?: boolean;
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
  status: ScanStatus;
  summary: string;
  scannedAt: string;
  wordCount: number;
  readingTimeSeconds: number;
  analysisMethod: AnalysisMethod;
  categories: {
    legal: CategoryScore;
    tone: CategoryScore;
    trademark: CategoryScore;
    claims: CategoryScore;
    brandSafety: CategoryScore;
  };
  violations: Violation[];
  aiRewrittenText?: string;
  originalText?: string;
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

export interface ReviewDecision {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  status: ReviewWorkflowStatus;
  comments: string;
  revisionVersion: number;
  createdAt: string;
}

export interface ContentSubmission {
  id: string;
  title: string;
  content: string;
  policyId: string;
  version: number;
  creatorId: string;
  creatorName: string;
  status: ReviewWorkflowStatus;
  scanResult?: ScanResult;
  reviews: ReviewDecision[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  eventType: 'scan_executed' | 'submission_created' | 'submission_revised' | 'review_decided' | 'policy_updated' | 'threat_status_changed';
  actorId: string;
  actorName: string;
  actorRole?: string;
  targetId?: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
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
  isSimulated?: boolean;
}

export interface PresetSample {
  id: string;
  title: string;
  tag: string;
  industry: string;
  description: string;
  text: string;
}
