import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as reviewsPost, GET as reviewsGet } from '../../app/api/workflow/reviews/route';
import { GET as submissionsGet, POST as submissionsPost } from '../../app/api/workflow/submissions/route';
import { GET as auditEventsGet, POST as auditEventsPost, PUT as auditEventsPut, DELETE as auditEventsDelete } from '../../app/api/workflow/audit-events/route';
import { resetWorkflowStateForTesting, DEMO_USERS, createOrUpdateSubmission } from '../workflowStore';
import { createTestAuthHeader } from '../authServer';

describe('Security & Access-Control Regression Suite (Phase 1)', () => {
  beforeEach(() => {
    resetWorkflowStateForTesting();
  });

  // --------------------------------------------------------------------------
  // 1. Unauthenticated users cannot access protected endpoints
  // --------------------------------------------------------------------------
  describe('1. Unauthenticated Access Protection (HTTP 401)', () => {
    it('rejects POST /api/workflow/reviews when Authorization header is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'approved',
          comments: 'Unauthenticated review attempt',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication required/i);
    });

    it('rejects GET /api/workflow/submissions when unauthenticated', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/submissions', {
        method: 'GET',
      });

      const res = await submissionsGet(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication required/i);
    });

    it('rejects POST /api/workflow/submissions when unauthenticated', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthenticated Promo',
          content: 'Should be rejected without valid token.',
        }),
      });

      const res = await submissionsPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication required/i);
    });

    it('rejects GET /api/workflow/audit-events when unauthenticated', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/audit-events', {
        method: 'GET',
      });

      const res = await auditEventsGet(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication required/i);
    });

    it('rejects requests with an invalid or expired token', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid-expired-token-xyz',
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'approved',
          comments: 'Testing invalid token',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication failed/i);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Normal user (creator) cannot approve or reject submissions
  // --------------------------------------------------------------------------
  describe('2. Role-Based Access Control on Reviews (HTTP 403)', () => {
    it('forbids a user with creator role from approving copy', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-creator-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'approved',
          comments: 'Creator trying to approve',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/Forbidden: User role "creator" is not authorized/i);
    });

    it('forbids a user with creator role from requesting changes', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-creator-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'changes_requested',
          comments: 'Creator attempting review action',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(403);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Client cannot impersonate a reviewer by changing the request body
  // --------------------------------------------------------------------------
  describe('3. Impersonation Prevention', () => {
    it('ignores client-supplied reviewer role in request body and enforces session identity', async () => {
      // Attacker is authenticated as a creator, but sends body with reviewer role
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-creator-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'approved',
          comments: 'Trying body role escalation',
          reviewer: {
            id: 'usr-reviewer-01',
            role: 'reviewer',
            name: 'Marcus Vance',
            email: 'compliance.officer@brandguard.ai',
          },
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      // Server checks verified session role (creator), ignoring body.reviewer
      expect(json.error).toMatch(/User role "creator" is not authorized/i);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Separation of Duties: Reviewers cannot review their own submissions
  // --------------------------------------------------------------------------
  describe('4. Separation of Duties Enforcement (HTTP 403)', () => {
    it('prevents a reviewer from approving their own submission', async () => {
      // First, create a submission where creatorId matches the reviewer's ID
      const reviewerProfile = DEMO_USERS.reviewer;
      const selfSub = await createOrUpdateSubmission({
        title: 'Reviewer Personal Draft',
        content: 'I am both creator and reviewer.',
        policyId: 'fintech',
        creator: reviewerProfile,
      });

      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: selfSub.id,
          decision: 'approved',
          comments: 'Self-approving my own submission',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/Separation of duties violation/i);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Users cannot access submissions belonging to other users (IDOR prevention)
  // --------------------------------------------------------------------------
  describe('5. Data Isolation & IDOR Protection', () => {
    it('prevents a creator from accessing another creator\'s private submission by ID', async () => {
      // Creator 1 creates a submission
      const sub1 = await createOrUpdateSubmission({
        title: 'Confidential Marketing Copy for Creator 1',
        content: 'Confidential product announcement details.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator, // id: usr-creator-01
      });

      // Creator 2 attempts to fetch Creator 1's submission
      const req = new NextRequest(`http://localhost:3000/api/workflow/submissions?id=${sub1.id}`, {
        method: 'GET',
        headers: {
          Authorization: createTestAuthHeader('test-creator-2-token'), // id: usr-creator-02
        },
      });

      const res = await submissionsGet(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/permission to access another user's private submission/i);
    });

    it('prevents a creator from modifying another creator\'s submission', async () => {
      const sub1 = await createOrUpdateSubmission({
        title: 'Creator 1 Exclusive Document',
        content: 'Original draft content.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator, // usr-creator-01
      });

      // Creator 2 tries to revise Creator 1's submission
      const req = new NextRequest('http://localhost:3000/api/workflow/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-creator-2-token'), // usr-creator-02
        },
        body: JSON.stringify({
          id: sub1.id,
          title: 'Tampered Title',
          content: 'Tampered text content.',
        }),
      });

      const res = await submissionsPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/cannot modify or revise a submission created by another user/i);
    });

    it('filters submission listings so creators only see their own submissions', async () => {
      await createOrUpdateSubmission({
        title: 'Creator 2 Private Document',
        content: 'Only visible to creator 2.',
        policyId: 'fintech',
        creator: {
          id: 'usr-creator-02',
          email: 'creator2@enterprise.brandguard.ai',
          name: 'David Kim',
          role: 'creator',
        },
      });

      const req = new NextRequest('http://localhost:3000/api/workflow/submissions', {
        method: 'GET',
        headers: {
          Authorization: createTestAuthHeader('test-creator-2-token'),
        },
      });

      const res = await submissionsGet(req);
      expect(res.status).toBe(200);
      const { submissions } = await res.json();
      expect(Array.isArray(submissions)).toBe(true);
      // All submissions returned must belong to Creator 2
      expect(submissions.every((s: { creatorId: string }) => s.creatorId === 'usr-creator-02')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Invalid decisions and malformed request bodies are rejected (HTTP 400 & 404)
  // --------------------------------------------------------------------------
  describe('6. Input Validation & Missing Resource Handling', () => {
    it('rejects unsupported review decisions with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'unilateral_override', // Invalid!
          comments: 'Attempting invalid decision',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Invalid decision "unilateral_override"/i);
    });

    it('rejects missing or empty review comments with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-101',
          decision: 'approved',
          comments: '   ', // Empty whitespace
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/"comments" are required and cannot be empty/i);
    });

    it('returns HTTP 404 when reviewing a nonexistent submission', async () => {
      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: 'sub-does-not-exist-9999',
          decision: 'approved',
          comments: 'Valid comment on missing submission',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toMatch(/was not found/i);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Unauthorized audit-event modifications are rejected (HTTP 405)
  // --------------------------------------------------------------------------
  describe('7. Audit Trail Immutability Protection', () => {
    it('rejects direct POST to /api/workflow/audit-events with HTTP 405', async () => {
      const res = await auditEventsPost();
      expect(res.status).toBe(405);
      const json = await res.json();
      expect(json.error).toMatch(/Audit events are immutable system-generated logs/i);
    });

    it('rejects direct PUT to /api/workflow/audit-events with HTTP 405', async () => {
      const res = await auditEventsPut();
      expect(res.status).toBe(405);
    });

    it('rejects direct DELETE to /api/workflow/audit-events with HTTP 405', async () => {
      const res = await auditEventsDelete();
      expect(res.status).toBe(405);
    });
  });

  // --------------------------------------------------------------------------
  // 8. Authorized reviewers can complete valid review actions (HTTP 200)
  // --------------------------------------------------------------------------
  describe('8. Authorized Reviewer Execution', () => {
    it('allows an authorized reviewer to approve a valid submission', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Compliant Ad Ready for Approval',
        content: 'Official cloud platform press release with SLA disclaimer.',
        policyId: 'enterprise',
        creator: DEMO_USERS.creator, // usr-creator-01
      });

      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: sub.id,
          decision: 'approved',
          comments: 'Enterprise disclaimers verified. Approved for broadcast.',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(200);
      const { submission } = await res.json();
      expect(submission.status).toBe('approved');
      expect(submission.reviews[0].status).toBe('approved');
      expect(submission.reviews[0].comments).toContain('Approved for broadcast');
    });

    it('allows an authorized reviewer to request changes', async () => {
      const sub = await createOrUpdateSubmission({
        title: 'Ad Draft Needing Changes',
        content: 'Draft content without disclaimers.',
        policyId: 'fintech',
        creator: DEMO_USERS.creator,
      });

      const req = new NextRequest('http://localhost:3000/api/workflow/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: createTestAuthHeader('test-reviewer-token'),
        },
        body: JSON.stringify({
          submissionId: sub.id,
          decision: 'changes_requested',
          comments: 'Mandatory risk disclaimer is missing. Please add before resubmitting.',
        }),
      });

      const res = await reviewsPost(req);
      expect(res.status).toBe(200);
      const { submission } = await res.json();
      expect(submission.status).toBe('changes_requested');
    });
  });

  // --------------------------------------------------------------------------
  // 9. Existing demo mode still works as intended
  // --------------------------------------------------------------------------
  describe('9. Demo Mode Separation and Integrity', () => {
    it('retains demo users and initial demo submissions without compromising security', () => {
      expect(DEMO_USERS.creator.role).toBe('creator');
      expect(DEMO_USERS.reviewer.role).toBe('reviewer');
      expect(DEMO_USERS.admin.role).toBe('admin');
    });

    it('ensures review GET returns 405 Method Not Allowed', async () => {
      const res = await reviewsGet();
      expect(res.status).toBe(405);
    });
  });
});
