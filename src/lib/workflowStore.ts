import {
  ContentSubmission,
  ReviewDecision,
  AuditEvent,
  UserRole,
  UserProfile,
  ReviewWorkflowStatus,
} from '@/types/brandguard';
import { analyzeBrandContent, DEFAULT_POLICIES } from './brandSafetyEngine';
import { getServerSupabaseClient, isServerSupabaseConfigured } from './supabaseServer';

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
  submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)) as ContentSubmission[],
  auditEvents: JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS)) as AuditEvent[],
};

/**
 * Resets workflow state to initial seed values (primarily for testing).
 */
export function resetWorkflowStateForTesting() {
  globalWorkflowState.submissions = JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS));
  globalWorkflowState.auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
}

/**
 * Server-enforced review submission validator.
 * Asserts that only authorized reviewers or admins can decide a review.
 */
export function assertReviewerPermission(role: UserRole): boolean {
  return role === 'reviewer' || role === 'admin';
}

/**
 * Retrieves a single submission by its ID.
 */
export async function getSubmissionById(id: string): Promise<ContentSubmission | null> {
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('content_submissions')
        .select('*, reviews(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error fetching submission: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          policyId: data.policy_id,
          version: data.version,
          creatorId: data.creator_id || 'unknown',
          creatorName: data.creator_name,
          status: data.status as ReviewWorkflowStatus,
          reviews: (data.reviews || []).map((r: Record<string, unknown>) => ({
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
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return null;
    } catch (err) {
      console.error('Supabase fetch submission error:', err);
      throw err;
    }
  }

  const found = globalWorkflowState.submissions.find((s) => s.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

/**
 * Retrieves all submissions visible to the requesting user.
 * Reviewers and Admins can view all submissions.
 * Creators can ONLY view their own submissions.
 */
export async function getWorkflowSubmissions(currentUser?: UserProfile): Promise<ContentSubmission[]> {
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('content_submissions')
        .select('*, reviews(*)')
        .order('created_at', { ascending: false });

      // Enforce ownership filter at database query level for creators
      if (currentUser && currentUser.role === 'creator') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
        if (isUuid) {
          query = query.eq('creator_id', currentUser.id);
        } else {
          query = query.or(`creator_id.eq.${currentUser.id},creator_name.eq.${currentUser.name}`);
        }
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error fetching submissions: ${error.message}`);
      }

      if (data) {
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
      return [];
    } catch (err) {
      console.error('Database fetch failed:', err);
      throw err;
    }
  }

  // Local/demo fallback: enforce ownership filtering in memory
  let list = globalWorkflowState.submissions;
  if (currentUser && currentUser.role === 'creator') {
    list = list.filter((s) => s.creatorId === currentUser.id);
  }
  return JSON.parse(JSON.stringify(list));
}

export async function createOrUpdateSubmission(payload: {
  id?: string;
  title: string;
  content: string;
  policyId: string;
  creator: UserProfile;
}): Promise<ContentSubmission> {
  if (!payload.content || typeof payload.content !== 'string' || !payload.content.trim()) {
    throw new Error('Submission content cannot be empty.');
  }

  const policy = DEFAULT_POLICIES[payload.policyId] || DEFAULT_POLICIES.fintech;
  const scanResult = analyzeBrandContent(payload.content, policy);

  let existing: ContentSubmission | null = null;
  if (payload.id) {
    existing = await getSubmissionById(payload.id);
    if (!existing) {
      const idx = globalWorkflowState.submissions.findIndex((s) => s.id === payload.id);
      if (idx >= 0) existing = globalWorkflowState.submissions[idx];
    }
  }

  const now = new Date().toISOString();
  let submission: ContentSubmission;
  let auditEvent: AuditEvent;

  if (existing) {
    // Revising existing submission — enforce ownership verification!
    if (existing.creatorId && existing.creatorId !== payload.creator.id && payload.creator.role !== 'admin') {
      throw new Error('Forbidden: You do not have permission to modify a submission created by another user.');
    }

    submission = {
      ...existing,
      content: payload.content,
      policyId: payload.policyId,
      version: existing.version + 1,
      status: 'pending_review', // Revisions reset status to pending_review
      scanResult,
      updatedAt: now,
    };

    // Update in-memory state
    const existingIndex = globalWorkflowState.submissions.findIndex((s) => s.id === payload.id);
    if (existingIndex >= 0) {
      globalWorkflowState.submissions[existingIndex] = submission;
    } else {
      globalWorkflowState.submissions.unshift(submission);
    }

    auditEvent = {
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

    auditEvent = {
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

  // Persist to Supabase if configured
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.creator.id);
      const { error: upsertErr } = await supabase.from('content_submissions').upsert({
        id: submission.id,
        title: submission.title,
        content: submission.content,
        policy_id: submission.policyId,
        version: submission.version,
        creator_id: isUuid ? payload.creator.id : null,
        creator_name: submission.creatorName,
        status: submission.status,
        updated_at: submission.updatedAt,
      });

      if (upsertErr) {
        throw new Error(`Database error saving submission: ${upsertErr.message}`);
      }

      // Record audit event only after successful submission commit
      await supabase.from('audit_events').insert({
        id: auditEvent.id,
        event_type: auditEvent.eventType,
        actor_id: auditEvent.actorId,
        actor_name: auditEvent.actorName,
        actor_role: auditEvent.actorRole,
        target_id: auditEvent.targetId,
        details: auditEvent.details,
        created_at: auditEvent.timestamp,
      });
    } catch (e) {
      console.error('Supabase submission upsert failed:', e);
      throw e;
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
  // 1. Server-Enforced Role Check
  if (!assertReviewerPermission(payload.reviewer.role)) {
    throw new Error(
      `Permission Denied: User role "${payload.reviewer.role}" is not authorized to submit compliance reviews. Human reviewer or admin role required.`
    );
  }

  // 2. Validate Decision
  const validDecisions = ['approved', 'rejected', 'changes_requested'];
  if (!validDecisions.includes(payload.decision)) {
    throw new Error(
      `Invalid decision "${payload.decision}". Supported decisions: ${validDecisions.join(', ')}.`
    );
  }

  // 3. Validate Comments
  if (!payload.comments || typeof payload.comments !== 'string' || !payload.comments.trim()) {
    throw new Error('Review comments are required and cannot be empty.');
  }

  // 4. Verify Submission Exists (checks database first if online)
  let sub = await getSubmissionById(payload.submissionId);
  if (!sub) {
    const subIndex = globalWorkflowState.submissions.findIndex((s) => s.id === payload.submissionId);
    if (subIndex >= 0) sub = globalWorkflowState.submissions[subIndex];
  }

  if (!sub) {
    throw new Error(`Submission "${payload.submissionId}" not found.`);
  }

  // 5. Enforce Separation of Duties: Reviewers CANNOT approve or reject their own submissions!
  if (sub.creatorId && sub.creatorId === payload.reviewer.id) {
    throw new Error(
      'Separation of duties violation: Reviewers cannot approve, reject, or request changes on their own submissions.'
    );
  }

  // 6. Concurrency & Duplicate Check: Prevent duplicate review decisions on the same revision by the same reviewer
  const hasDuplicate = sub.reviews.some(
    (r) => r.revisionVersion === sub.version && r.reviewerId === payload.reviewer.id
  );
  if (hasDuplicate) {
    throw new Error(
      `Duplicate review: A review decision has already been recorded by ${payload.reviewer.name} for revision v${sub.version}.`
    );
  }

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

  // Persist to Supabase if configured (Atomic sequence with rollback on review failure)
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      // Step A: Update submission status in database
      const { error: subErr } = await supabase.from('content_submissions').update({
        status: updatedSub.status,
        updated_at: updatedSub.updatedAt,
      }).eq('id', updatedSub.id);

      if (subErr) {
        throw new Error(`Database error updating submission status: ${subErr.message}`);
      }

      // Step B: Insert review record
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.reviewer.id);
      const { error: revErr } = await supabase.from('reviews').insert({
        id: newReview.id,
        submission_id: updatedSub.id,
        reviewer_id: isUuid ? payload.reviewer.id : null,
        reviewer_name: newReview.reviewerName,
        reviewer_role: newReview.reviewerRole,
        decision: newReview.status,
        comments: newReview.comments,
        revision_version: newReview.revisionVersion,
        created_at: newReview.createdAt,
      });

      if (revErr) {
        // Partial Failure Handling: Roll back submission status to pre-decision state
        await supabase.from('content_submissions').update({
          status: sub.status,
          updated_at: sub.updatedAt,
        }).eq('id', updatedSub.id);
        throw new Error(`Database error saving review: ${revErr.message}`);
      }

      // Step C: Record audit event only after review successfully committed
      await supabase.from('audit_events').insert({
        id: auditEvent.id,
        event_type: auditEvent.eventType,
        actor_id: auditEvent.actorId,
        actor_name: auditEvent.actorName,
        actor_role: auditEvent.actorRole,
        target_id: auditEvent.targetId,
        details: auditEvent.details,
        created_at: auditEvent.timestamp,
      });
    } catch (e) {
      console.error('Supabase review persistence failed:', e);
      throw e;
    }
  }

  // Update in-memory state after database success
  const subIndex = globalWorkflowState.submissions.findIndex((s) => s.id === payload.submissionId);
  if (subIndex >= 0) {
    globalWorkflowState.submissions[subIndex] = updatedSub;
  } else {
    globalWorkflowState.submissions.unshift(updatedSub);
  }
  globalWorkflowState.auditEvents.unshift(auditEvent);

  return updatedSub;
}

export async function getAuditEvents(currentUser?: UserProfile): Promise<AuditEvent[]> {
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false });

      // Scoped access for creators: only their own events
      if (currentUser && currentUser.role === 'creator') {
        query = query.eq('actor_id', currentUser.id);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error fetching audit events: ${error.message}`);
      }

      if (data) {
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
      return [];
    } catch (e) {
      console.error('Supabase audit fetch failed:', e);
      throw e;
    }
  }

  let events = globalWorkflowState.auditEvents;
  if (currentUser && currentUser.role === 'creator') {
    events = events.filter((e) => e.actorId === currentUser.id);
  }

  return JSON.parse(JSON.stringify(events));
}
