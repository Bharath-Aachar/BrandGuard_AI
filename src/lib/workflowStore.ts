import {
  ContentSubmission,
  ReviewDecision,
  AuditEvent,
  UserRole,
  UserProfile,
  ReviewWorkflowStatus,
} from '@/types/brandguard';
import { analyzeBrandContent, DEFAULT_POLICIES } from './brandSafetyEngine';
import { getServerSupabaseClient } from './supabaseServer';

// Default Demo Users for role testing & demonstration
export const DEMO_USERS: Record<string, UserProfile> = {
  creator: {
    id: 'usr-creator-01',
    email: 'creator@enterprise.brandguard.ai',
    name: 'Sarah Chen (Content Creator)',
    role: 'creator',
  },
  reviewer: {
    id: 'usr-reviewer-01',
    email: 'compliance.officer@brandguard.ai',
    name: 'Marcus Vance (Chief Compliance Officer)',
    role: 'reviewer',
  },
  admin: {
    id: 'usr-admin-01',
    email: 'legal.director@brandguard.ai',
    name: 'Eleanor Vance (Legal Director)',
    role: 'admin',
  },
};

// Initial Seed Submissions for testing & demo presentation
export const INITIAL_SUBMISSIONS: ContentSubmission[] = [
  {
    id: 'sub-101',
    title: 'Q4 Enterprise Cloud Infrastructure Announcement',
    content: `Aura Technologies announces the general availability of Aura Core 3.0, engineered to assist modern organizations with continuous data governance. 

Subject to enterprise SLA and master subscription terms. For complete technical documentation and security whitepapers, please visit the official customer portal.`,
    policyId: 'enterprise',
    version: 1,
    creatorId: DEMO_USERS.creator.id,
    creatorName: DEMO_USERS.creator.name,
    status: 'approved',
    scanResult: analyzeBrandContent(
      `Aura Technologies announces the general availability of Aura Core 3.0, engineered to assist modern organizations with continuous data governance. \n\nSubject to enterprise SLA and master subscription terms. For complete technical documentation and security whitepapers, please visit the official customer portal.`,
      DEFAULT_POLICIES.enterprise
    ),
    reviews: [
      {
        id: 'rev-01',
        submissionId: 'sub-101',
        reviewerId: DEMO_USERS.reviewer.id,
        reviewerName: DEMO_USERS.reviewer.name,
        reviewerRole: 'reviewer',
        status: 'approved',
        comments: 'Verified against SEC and FTC guidelines. Full enterprise SLA disclaimers included. Approved for broadcast.',
        revisionVersion: 1,
        createdAt: '2026-10-26T14:32:00Z',
      },
    ],
    createdAt: '2026-10-26T11:00:00Z',
    updatedAt: '2026-10-26T14:32:00Z',
  },
  {
    id: 'sub-102',
    title: 'Growth Marketing Campaign Draft #1',
    content: `Want guaranteed profit without stress? Our new automated algorithmic hedge vault delivers 100% safe returns of 25% APY! Sign up now before the loophole closes.`,
    policyId: 'fintech',
    version: 1,
    creatorId: DEMO_USERS.creator.id,
    creatorName: DEMO_USERS.creator.name,
    status: 'changes_requested',
    scanResult: analyzeBrandContent(
      `Want guaranteed profit without stress? Our new automated algorithmic hedge vault delivers 100% safe returns of 25% APY! Sign up now before the loophole closes.`,
      DEFAULT_POLICIES.fintech
    ),
    reviews: [
      {
        id: 'rev-02',
        submissionId: 'sub-102',
        reviewerId: DEMO_USERS.reviewer.id,
        reviewerName: DEMO_USERS.reviewer.name,
        reviewerRole: 'reviewer',
        status: 'changes_requested',
        comments: 'Critical noncompliance: "guaranteed profit" and "100% safe" must be removed. Mandatory FCA/SEC risk disclaimer must be appended.',
        revisionVersion: 1,
        createdAt: '2026-10-27T09:15:00Z',
      },
    ],
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-27T09:15:00Z',
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-seed-1',
    eventType: 'scan_executed',
    actorId: DEMO_USERS.creator.id,
    actorName: DEMO_USERS.creator.name,
    actorRole: 'creator',
    targetId: 'sub-101',
    details: 'Completed multi-vector risk evaluation on "Q4 Enterprise Cloud Infrastructure Announcement".',
    timestamp: '2026-10-26T11:05:00Z',
  },
  {
    id: 'aud-seed-2',
    eventType: 'review_decided',
    actorId: DEMO_USERS.reviewer.id,
    actorName: DEMO_USERS.reviewer.name,
    actorRole: 'reviewer',
    targetId: 'sub-101',
    details: 'Approved revision 1 with status "approved". Author: Marcus Vance.',
    timestamp: '2026-10-26T14:32:00Z',
  },
  {
    id: 'aud-seed-3',
    eventType: 'submission_created',
    actorId: DEMO_USERS.creator.id,
    actorName: DEMO_USERS.creator.name,
    actorRole: 'creator',
    targetId: 'sub-102',
    details: 'Submitted "Growth Marketing Campaign Draft #1" for compliance review.',
    timestamp: '2026-10-27T08:30:00Z',
  },
  {
    id: 'aud-seed-4',
    eventType: 'review_decided',
    actorId: DEMO_USERS.reviewer.id,
    actorName: DEMO_USERS.reviewer.name,
    actorRole: 'reviewer',
    targetId: 'sub-102',
    details: 'Requested changes for revision 1 with status "changes_requested".',
    timestamp: '2026-10-27T09:15:00Z',
  },
];

// In-Memory store for fast fallback when database is not connected
const globalWorkflowState = {
  submissions: [...INITIAL_SUBMISSIONS],
  auditEvents: [...INITIAL_AUDIT_EVENTS],
};

/**
 * Server-enforced review submission validator.
 * Asserts that only authorized reviewers or admins can decide a review.
 */
export function assertReviewerPermission(role: UserRole): boolean {
  return role === 'reviewer' || role === 'admin';
}

export async function getWorkflowSubmissions(): Promise<ContentSubmission[]> {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('content_submissions')
        .select('*, reviews(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          policyId: item.policy_id,
          version: item.version,
          creatorId: item.creator_id || 'unknown',
          creatorName: item.creator_name,
          status: item.status as ReviewWorkflowStatus,
          reviews: (item.reviews || []).map((r: Record<string, unknown>) => ({
            id: r.id as string,
            submissionId: r.submission_id as string,
            reviewerId: (r.reviewer_id as string) || 'unknown',
            reviewerName: r.reviewer_name as string,
            reviewerRole: r.reviewer_role as UserRole,
            status: r.decision as ReviewWorkflowStatus,
            comments: r.comments as string,
            revisionVersion: r.revision_version as number,
            createdAt: r.created_at as string,
          })),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local workflow state:', err);
    }
  }

  return globalWorkflowState.submissions;
}

export async function createOrUpdateSubmission(payload: {
  id?: string;
  title: string;
  content: string;
  policyId: string;
  creator: UserProfile;
}): Promise<ContentSubmission> {
  const policy = DEFAULT_POLICIES[payload.policyId] || DEFAULT_POLICIES.fintech;
  const scanResult = analyzeBrandContent(payload.content, policy);

  let existingIndex = -1;
  if (payload.id) {
    existingIndex = globalWorkflowState.submissions.findIndex((s) => s.id === payload.id);
  }

  const now = new Date().toISOString();
  let submission: ContentSubmission;

  if (existingIndex >= 0) {
    // New Revision by Creator
    const existing = globalWorkflowState.submissions[existingIndex];
    submission = {
      ...existing,
      content: payload.content,
      policyId: payload.policyId,
      version: existing.version + 1,
      status: 'pending_review',
      scanResult,
      updatedAt: now,
    };
    globalWorkflowState.submissions[existingIndex] = submission;

    // Record Audit Event
    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      eventType: 'submission_revised',
      actorId: payload.creator.id,
      actorName: payload.creator.name,
      actorRole: payload.creator.role,
      targetId: submission.id,
      details: `Submitted revision v${submission.version} for "${submission.title}". Score: ${scanResult.overallScore}/100.`,
      timestamp: now,
    };
    globalWorkflowState.auditEvents.unshift(auditEvent);
  } else {
    // Brand New Submission
    submission = {
      id: payload.id || `sub-${Date.now().toString().slice(-4)}`,
      title: payload.title || 'Untitled Campaign Copy',
      content: payload.content,
      policyId: payload.policyId,
      version: 1,
      creatorId: payload.creator.id,
      creatorName: payload.creator.name,
      status: 'pending_review',
      scanResult,
      reviews: [],
      createdAt: now,
      updatedAt: now,
    };
    globalWorkflowState.submissions.unshift(submission);

    // Record Audit Event
    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      eventType: 'submission_created',
      actorId: payload.creator.id,
      actorName: payload.creator.name,
      actorRole: payload.creator.role,
      targetId: submission.id,
      details: `Created new submission "${submission.title}" under ${policy.name} guidelines.`,
      timestamp: now,
    };
    globalWorkflowState.auditEvents.unshift(auditEvent);
  }

  // Persist to Supabase if available
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('content_submissions').upsert({
        id: submission.id,
        title: submission.title,
        content: submission.content,
        policy_id: submission.policyId,
        version: submission.version,
        creator_id: null,
        creator_name: submission.creatorName,
        status: submission.status,
        updated_at: submission.updatedAt,
      });
    } catch (e) {
      console.warn('Supabase submission upsert error:', e);
    }
  }

  return submission;
}

export async function recordReviewDecision(payload: {
  submissionId: string;
  reviewer: UserProfile;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comments: string;
}): Promise<ContentSubmission> {
  // Server-Enforced Permission Check:
  if (!assertReviewerPermission(payload.reviewer.role)) {
    throw new Error(
      `Permission Denied: User role "${payload.reviewer.role}" is not authorized to submit compliance reviews. Human reviewer or admin role required.`
    );
  }

  const subIndex = globalWorkflowState.submissions.findIndex((s) => s.id === payload.submissionId);
  if (subIndex === -1) {
    throw new Error(`Submission "${payload.submissionId}" not found.`);
  }

  const sub = globalWorkflowState.submissions[subIndex];
  const now = new Date().toISOString();

  const newReview: ReviewDecision = {
    id: `rev-${Date.now().toString().slice(-4)}`,
    submissionId: sub.id,
    reviewerId: payload.reviewer.id,
    reviewerName: payload.reviewer.name,
    reviewerRole: payload.reviewer.role,
    status: payload.decision,
    comments: payload.comments.trim(),
    revisionVersion: sub.version,
    createdAt: now,
  };

  const updatedSub: ContentSubmission = {
    ...sub,
    status: payload.decision,
    reviews: [newReview, ...sub.reviews],
    updatedAt: now,
  };

  globalWorkflowState.submissions[subIndex] = updatedSub;

  // Record Audit Event
  const auditEvent: AuditEvent = {
    id: `aud-${Date.now()}`,
    eventType: 'review_decided',
    actorId: payload.reviewer.id,
    actorName: payload.reviewer.name,
    actorRole: payload.reviewer.role,
    targetId: sub.id,
    details: `Review decision "${payload.decision}" recorded for "${sub.title}" (v${sub.version}) by ${payload.reviewer.name}.`,
    timestamp: now,
  };
  globalWorkflowState.auditEvents.unshift(auditEvent);

  // Persist to Supabase if available
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('content_submissions').update({
        status: updatedSub.status,
        updated_at: updatedSub.updatedAt,
      }).eq('id', updatedSub.id);

      await supabase.from('reviews').insert({
        id: newReview.id,
        submission_id: updatedSub.id,
        reviewer_name: newReview.reviewerName,
        reviewer_role: newReview.reviewerRole,
        decision: newReview.status,
        comments: newReview.comments,
        revision_version: newReview.revisionVersion,
        created_at: newReview.createdAt,
      });
    } catch (e) {
      console.warn('Supabase review insert error:', e);
    }
  }

  return updatedSub;
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          eventType: d.event_type,
          actorId: d.actor_id,
          actorName: d.actor_name,
          actorRole: d.actor_role,
          targetId: d.target_id,
          details: d.details,
          timestamp: d.created_at,
          metadata: d.metadata,
        }));
      }
    } catch (e) {
      console.warn('Supabase audit fetch error:', e);
    }
  }

  return globalWorkflowState.auditEvents;
}
