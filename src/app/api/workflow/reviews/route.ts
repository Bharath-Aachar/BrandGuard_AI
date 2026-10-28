import { NextRequest, NextResponse } from 'next/server';
import {
  recordReviewDecision,
  assertReviewerPermission,
  getSubmissionById,
} from '@/lib/workflowStore';
import { verifyServerSession, isAuthError } from '@/lib/authServer';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Authentication
    const authResult = await verifyServerSession(req);
    if (isAuthError(authResult)) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Verified Reviewer derived directly from server session (never from request body)
    const reviewer = authResult.user;

    // 2. Enforce Role-Based Permissions (Only Reviewer and Admin permitted)
    if (!assertReviewerPermission(reviewer.role)) {
      return NextResponse.json(
        {
          error: `Forbidden: User role "${reviewer.role}" is not authorized to submit review decisions. Only authorized compliance reviewers or administrators can approve, reject, or request changes.`,
        },
        { status: 403 }
      );
    }

    // 3. Validate Request Payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (!body.submissionId || typeof body.submissionId !== 'string' || !body.submissionId.trim()) {
      return NextResponse.json(
        { error: 'Invalid payload: "submissionId" must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!body.decision || typeof body.decision !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload: "decision" string is required.' },
        { status: 400 }
      );
    }

    const validDecisions = ['approved', 'rejected', 'changes_requested'];
    if (!validDecisions.includes(body.decision)) {
      return NextResponse.json(
        {
          error: `Invalid decision "${body.decision}". Supported decisions: ${validDecisions.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    if (!body.comments || typeof body.comments !== 'string' || !body.comments.trim()) {
      return NextResponse.json(
        { error: 'Invalid payload: "comments" are required and cannot be empty.' },
        { status: 400 }
      );
    }

    // 4. Verify Submission Exists (Return 404 if missing)
    const submission = await getSubmissionById(body.submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: `Submission with ID "${body.submissionId}" was not found.` },
        { status: 404 }
      );
    }

    // 5. Enforce Separation of Duties: Reviewer CANNOT approve their own submission
    if (submission.creatorId && submission.creatorId === reviewer.id) {
      return NextResponse.json(
        {
          error: 'Forbidden: Separation of duties violation. Reviewers cannot approve, reject, or request changes on their own submissions.',
        },
        { status: 403 }
      );
    }

    // 6. Record Review Decision with Server-Verified Identity
    const updated = await recordReviewDecision({
      submissionId: body.submissionId,
      reviewer,
      decision: body.decision,
      comments: body.comments.trim(),
    });

    return NextResponse.json({ submission: updated }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error submitting review:', error);
    const message = error instanceof Error ? error.message : 'Internal error recording review decision.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST to record review decisions.' },
    { status: 405 }
  );
}
