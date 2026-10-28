import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOrUpdateSubmission,
  recordReviewDecision,
  getSubmissionById,
  getWorkflowSubmissions,
  getAuditEvents,
  resetWorkflowStateForTesting,
  DEMO_USERS,
} from '../workflowStore';
import { getBrandPolicies, saveBrandPolicy, resetPolicyStoreForTesting } from '../policyStore';
import { persistScanResult, getPersistentScans, resetScanStoreForTesting } from '../scanStore';
import { analyzeBrandContent, DEFAULT_POLICIES } from '../brandSafetyEngine';

describe('Supabase & Workflow Persistence Engine (Phase 2)', () => {
  beforeEach(() => {
    resetWorkflowStateForTesting();
    resetPolicyStoreForTesting();
    resetScanStoreForTesting();
  });

  // --------------------------------------------------------------------------
  // 1. Creating and retrieving submissions
  // --------------------------------------------------------------------------
  describe('1. Creating & Retrieving Submissions', () => {
    it('persists a new submission with pending_review status and version 1', async () => {
      const created = await createOrUpdateSubmission({
        title: 'Enterprise Q3 Strategic Brief',
        content: 'Announcing our continuous brand safety platform.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator,
      });

      expect(created).toBeDefined();
      expect(created.id).toMatch(/^sub-/);
      expect(created.version).toBe(1);
      expect(created.status).toBe('pending_review');
      expect(created.creatorId).toBe(DEMO_USERS.creator.id);

      // Verify retrieval by ID
      const retrieved = await getSubmissionById(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Enterprise Q3 Strategic Brief');
      expect(retrieved?.version).toBe(1);
    });

    it('rejects empty or whitespace content', async () => {
      await expect(
        createOrUpdateSubmission({
          title: 'Empty Content',
          content: '   ',
          policyId: 'fintech',
          creator: DEMO_USERS.creator,
        })
      ).rejects.toThrow(/content cannot be empty/i);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Persistence across requests
  // --------------------------------------------------------------------------
  describe('2. State Persistence Across Multiple Requests', () => {
    it('preserves revision history across subsequent update requests', async () => {
      const initial = await createOrUpdateSubmission({
        title: 'Multi-step Campaign',
        content: 'Draft version 1 content.',
        policyId: 'fintech',
        creator: DEMO_USERS.creator,
      });

      // Simulating a separate request revising the document
      const revised = await createOrUpdateSubmission({
        id: initial.id,
        title: initial.title,
        content: 'Draft version 2 with regulatory risk warnings.',
        policyId: 'fintech',
        creator: DEMO_USERS.creator,
      });

      expect(revised.id).toBe(initial.id);
      expect(revised.version).toBe(2);
      expect(revised.status).toBe('pending_review');

      // Subsequent query reflects the persisted version
      const fetched = await getSubmissionById(initial.id);
      expect(fetched?.version).toBe(2);
      expect(fetched?.content).toBe('Draft version 2 with regulatory risk warnings.');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Recording review decisions
  // --------------------------------------------------------------------------
  describe('3. Recording Review Decisions & Comments', () => {
    it('records and persists approved decision with reviewer notes', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'SEC Compliant Press Release',
        content: 'Aura Technologies SLA and customer terms.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator,
      });

      const reviewed = await recordReviewDecision({
        submissionId: sub.id,
        reviewer: DEMO_USERS.reviewer,
        decision: 'approved',
        comments: 'Enterprise SLA disclaimers verified. Approved for publication.',
      });

      expect(reviewed.status).toBe('approved');
      expect(reviewed.reviews.length).toBe(1);
      expect(reviewed.reviews[0].status).toBe('approved');
      expect(reviewed.reviews[0].reviewerName).toBe(DEMO_USERS.reviewer.name);
      expect(reviewed.reviews[0].comments).toContain('Enterprise SLA disclaimers verified');

      // Verify that getSubmissionById returns the approved status and review item
      const persisted = await getSubmissionById(sub.id);
      expect(persisted?.status).toBe('approved');
      expect(persisted?.reviews[0].status).toBe('approved');
    });

    it('records and persists changes_requested decision', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Draft with Missing Disclaimer',
        content: 'High yield promotional copy.',
        policyId: 'fintech',
        creator: DEMO_USERS.creator,
      });

      const reviewed = await recordReviewDecision({
        submissionId: sub.id,
        reviewer: DEMO_USERS.reviewer,
        decision: 'changes_requested',
        comments: 'Please append the mandatory FCA risk disclaimer.',
      });

      expect(reviewed.status).toBe('changes_requested');
      expect(reviewed.reviews[0].status).toBe('changes_requested');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Recording audit events only for successful operations
  // --------------------------------------------------------------------------
  describe('4. Audit Trail Event Integrity', () => {
    it('creates audit events for successful submission creation and reviews', async () => {
      const initialCount = (await getAuditEvents()).length;

      const sub = await createOrUpdateSubmission({
        title: 'Audit Trail Test Copy',
        content: 'Testing audit event creation.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator,
      });

      const countAfterSub = (await getAuditEvents()).length;
      expect(countAfterSub).toBe(initialCount + 1);

      await recordReviewDecision({
        submissionId: sub.id,
        reviewer: DEMO_USERS.reviewer,
        decision: 'approved',
        comments: 'Compliance sign-off logged.',
      });

      const countAfterReview = (await getAuditEvents()).length;
      expect(countAfterReview).toBe(initialCount + 2);

      const events = await getAuditEvents();
      const reviewEvent = events.find((e) => e.targetId === sub.id && e.eventType === 'review_decided');
      expect(reviewEvent).toBeDefined();
      expect(reviewEvent?.actorName).toBe(DEMO_USERS.reviewer.name);
    });

    it('does NOT create an audit event when an operation fails or is unauthorized', async () => {
      const initialCount = (await getAuditEvents()).length;

      // Attempting unauthorized review by creator
      await expect(
        recordReviewDecision({
          submissionId: 'sub-101',
          reviewer: DEMO_USERS.creator, // Not a reviewer!
          decision: 'approved',
          comments: 'Attempting unauthorized approval.',
        })
      ).rejects.toThrow(/Permission Denied/);

      // Audit events count must remain unchanged
      const countAfterFailed = (await getAuditEvents()).length;
      expect(countAfterFailed).toBe(initialCount);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Handling Supabase errors & validation failures
  // --------------------------------------------------------------------------
  describe('5. Error Handling & Validation', () => {
    it('throws when attempting to review a nonexistent submission', async () => {
      await expect(
        recordReviewDecision({
          submissionId: 'sub-does-not-exist-404',
          reviewer: DEMO_USERS.reviewer,
          decision: 'approved',
          comments: 'Reviewing ghost record.',
        })
      ).rejects.toThrow(/not found/i);
    });

    it('throws when review decision is not an allowed enum value', async () => {
      await expect(
        recordReviewDecision({
          submissionId: 'sub-101',
          reviewer: DEMO_USERS.reviewer,
          decision: 'unilateral_override' as unknown as 'approved',
          comments: 'Invalid decision type.',
        })
      ).rejects.toThrow(/Invalid decision/);
    });

    it('throws when review comments are empty or missing', async () => {
      await expect(
        recordReviewDecision({
          submissionId: 'sub-101',
          reviewer: DEMO_USERS.reviewer,
          decision: 'approved',
          comments: '   ',
        })
      ).rejects.toThrow(/Review comments are required/);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Enforcing user ownership and reviewer permissions
  // --------------------------------------------------------------------------
  describe('6. Ownership & Permission Enforcement', () => {
    it('prevents a creator from updating another user\'s submission', async () => {
      const sub1 = await createOrUpdateSubmission({
        title: 'User 1 Confidential Material',
        content: 'Original secret copy.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator, // usr-creator-01
      });

      const differentCreator = {
        id: 'usr-creator-99',
        email: 'other@enterprise.brandguard.ai',
        name: 'Alex Rivera',
        role: 'creator' as const,
      };

      await expect(
        createOrUpdateSubmission({
          id: sub1.id,
          title: 'Hacked Title',
          content: 'Tampered copy.',
          policyId: 'enterprise',
          creator: differentCreator,
        })
      ).rejects.toThrow(/You do not have permission to modify a submission created by another user/i);
    });

    it('enforces separation of duties: reviewer cannot review their own submission', async () => {
      const reviewerSub = await createOrUpdateSubmission({
        title: 'Reviewer Created Ad',
        content: 'Self created content.',
        policyId: 'enterprise',
        creator: DEMO_USERS.reviewer, // Creator is Marcus Vance
      });

      await expect(
        recordReviewDecision({
          submissionId: reviewerSub.id,
          reviewer: DEMO_USERS.reviewer, // Same user attempting to review!
          decision: 'approved',
          comments: 'Approving my own work.',
        })
      ).rejects.toThrow(/Separation of duties violation/i);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Preventing duplicate or conflicting review actions
  // --------------------------------------------------------------------------
  describe('7. Concurrency & Duplicate Review Prevention', () => {
    it('rejects duplicate review decisions on the same revision by the same reviewer', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Single Review Item',
        content: 'Content awaiting review.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator,
      });

      // First review succeeds
      await recordReviewDecision({
        submissionId: sub.id,
        reviewer: DEMO_USERS.reviewer,
        decision: 'approved',
        comments: 'First review approval.',
      });

      // Second review by same reviewer on same revision fails with duplicate error
      await expect(
        recordReviewDecision({
          submissionId: sub.id,
          reviewer: DEMO_USERS.reviewer,
          decision: 'approved',
          comments: 'Attempting duplicate approval.',
        })
      ).rejects.toThrow(/Duplicate review/i);
    });
  });

  // --------------------------------------------------------------------------
  // 8. Policy & Scan persistence
  // --------------------------------------------------------------------------
  describe('8. Brand Policies & Scan History Persistence', () => {
    it('retrieves default brand policies and allows authorized updates', async () => {
      const policies = await getBrandPolicies();
      expect(policies.fintech).toBeDefined();
      expect(policies.enterprise).toBeDefined();

      const updated = {
        ...policies.fintech,
        prohibitedTerms: [...policies.fintech.prohibitedTerms, 'get rich quick'],
      };

      const saved = await saveBrandPolicy(updated, DEMO_USERS.reviewer);
      expect(saved.prohibitedTerms).toContain('get rich quick');

      const reFetched = await getBrandPolicies();
      expect(reFetched.fintech.prohibitedTerms).toContain('get rich quick');
    });

    it('forbids creators from modifying brand guidelines', async () => {
      const policies = await getBrandPolicies();
      await expect(
        saveBrandPolicy(policies.enterprise, DEMO_USERS.creator)
      ).rejects.toThrow(/Permission Denied/);
    });

    it('persists completed scan results with score and status', async () => {
      const scanResult = analyzeBrandContent(
        '100% safe investment with guaranteed return. Revolut killer.',
        DEFAULT_POLICIES.fintech
      );

      const scanId = await persistScanResult(
        scanResult,
        '100% safe investment with guaranteed return. Revolut killer.',
        'fintech',
        DEMO_USERS.creator
      );

      expect(scanId).toMatch(/^scn-/);

      const history = await getPersistentScans(DEMO_USERS.creator);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].id).toBe(scanId);
      expect(history[0].score).toBe(scanResult.overallScore);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Demo mode functionality
  // --------------------------------------------------------------------------
  describe('9. Demo Mode Separation', () => {
    it('retains demo users and initial demo submissions without crashing', async () => {
      const subs = await getWorkflowSubmissions();
      expect(subs.length).toBeGreaterThanOrEqual(2);
      expect(subs.some((s) => s.id === 'sub-101')).toBe(true);
      expect(subs.some((s) => s.id === 'sub-102')).toBe(true);
    });
  });
});
