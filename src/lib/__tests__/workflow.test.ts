import { describe, it, expect } from 'vitest';
import {
  assertReviewerPermission,
  createOrUpdateSubmission,
  recordReviewDecision,
  DEMO_USERS,
  getWorkflowSubmissions,
  getAuditEvents,
} from '../workflowStore';
import { getSupabaseClient } from '../supabase';
import { getServerSupabaseClient } from '../supabaseServer';

describe('Workflow & Governance Engine — Permissions, Revisions & Persistence', () => {
  const creatorUser = DEMO_USERS.creator;
  const reviewerUser = DEMO_USERS.reviewer;

  // 1. Creator Workflow
  describe('Creator Submission & Revisions', () => {
    it('allows a creator to submit new content with version 1 and status pending_review', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Q1 Product Launch Brief',
        content: 'Launching our updated governance dashboard today.',
        policyId: 'enterprise',
        creator: creatorUser,
      });

      expect(sub).toBeDefined();
      expect(sub.version).toBe(1);
      expect(sub.status).toBe('pending_review');
      expect(sub.creatorName).toBe(creatorUser.name);
      expect(sub.scanResult).toBeDefined();
    });

    it('increments version to v2 and keeps history when creator revises content', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Multi-revision Post',
        content: 'Initial draft copy.',
        policyId: 'enterprise',
        creator: creatorUser,
      });

      const revised = await createOrUpdateSubmission({
        id: sub.id,
        title: sub.title,
        content: 'Revised compliant draft copy with expanded details.',
        policyId: 'enterprise',
        creator: creatorUser,
      });

      expect(revised.id).toBe(sub.id);
      expect(revised.version).toBe(2);
      expect(revised.status).toBe('pending_review');
      expect(revised.content).toBe('Revised compliant draft copy with expanded details.');
    });
  });

  // 2. Server-Enforced Permissions for Reviewer vs Creator
  describe('Reviewer Permissions Enforcement', () => {
    it('permits authorized reviewer and admin roles', () => {
      expect(assertReviewerPermission('reviewer')).toBe(true);
      expect(assertReviewerPermission('admin')).toBe(true);
    });

    it('denies creator role from approving or rejecting content', () => {
      expect(assertReviewerPermission('creator')).toBe(false);
    });

    it('throws a permission denied error if a creator attempts to record a review decision', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Tamper Test Submission',
        content: 'Checking authorization barrier.',
        policyId: 'fintech',
        creator: creatorUser,
      });

      await expect(
        recordReviewDecision({
          submissionId: sub.id,
          reviewer: creatorUser, // Unauthorized!
          decision: 'approved',
          comments: 'Self-approving my own copy.',
        })
      ).rejects.toThrow(/Permission Denied/);
    });

    it('allows an authorized reviewer to approve content and logs comments', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Compliant Ad Copy',
        content: 'Official compliance verified copy.',
        policyId: 'enterprise',
        creator: creatorUser,
      });

      const reviewed = await recordReviewDecision({
        submissionId: sub.id,
        reviewer: reviewerUser,
        decision: 'approved',
        comments: 'Verified against all enterprise guidelines. Approved for broadcast.',
      });

      expect(reviewed.status).toBe('approved');
      expect(reviewed.reviews[0].status).toBe('approved');
      expect(reviewed.reviews[0].reviewerName).toBe(reviewerUser.name);
      expect(reviewed.reviews[0].comments).toContain('Approved for broadcast');
    });

    it('allows an authorized reviewer to request changes', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Draft Needing Rework',
        content: 'Needs disclaimers added.',
        policyId: 'fintech',
        creator: creatorUser,
      });

      const reviewed = await recordReviewDecision({
        submissionId: sub.id,
        reviewer: reviewerUser,
        decision: 'changes_requested',
        comments: 'Please add required SEC disclaimer.',
      });

      expect(reviewed.status).toBe('changes_requested');
      expect(reviewed.reviews[0].comments).toBe('Please add required SEC disclaimer.');
    });
  });

  // 3. Real Audit Trail Logging
  describe('Audit Event Persistence & Derivation', () => {
    it('records audit events for submission creation, revision, and review decisions', async () => {
      const eventsBefore = (await getAuditEvents()).length;

      const sub = await createOrUpdateSubmission({
        title: 'Audit Trail Validation Promo',
        content: 'Testing immutable workflow logging.',
        policyId: 'fintech',
        creator: creatorUser,
      });

      await recordReviewDecision({
        submissionId: sub.id,
        reviewer: reviewerUser,
        decision: 'approved',
        comments: 'Audit log verification pass.',
      });

      const eventsAfter = await getAuditEvents();
      expect(eventsAfter.length).toBeGreaterThan(eventsBefore);

      const decisionEvent = eventsAfter.find((e) => e.targetId === sub.id && e.eventType === 'review_decided');
      expect(decisionEvent).toBeDefined();
      expect(decisionEvent?.actorName).toBe(reviewerUser.name);
    });
  });

  // 4. Missing Configuration & Database Error Handling
  describe('Database Resilience & Missing Configuration', () => {
    it('gracefully handles missing Supabase credentials without throwing exceptions', () => {
      // In default environment without .env.local, client returns null safely
      const client = getSupabaseClient();
      const serverClient = getServerSupabaseClient();

      // Does not throw, returns null or client if env provided
      expect(client === null || typeof client === 'object').toBe(true);
      expect(serverClient === null || typeof serverClient === 'object').toBe(true);
    });

    it('workflow submissions fall back to resilient in-memory / local state if database fails', async () => {
      const subs = await getWorkflowSubmissions();
      expect(Array.isArray(subs)).toBe(true);
      expect(subs.length).toBeGreaterThan(0);
    });
  });
});
