import { NextRequest, NextResponse } from 'next/server';
import {
  recordReviewDecision,
  assertReviewerPermission,
  DEMO_USERS,
} from '@/lib/workflowStore';
import { UserProfile } from '@/types/brandguard';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.submissionId || !body.decision || !body.comments) {
      return NextResponse.json(
        { error: 'Invalid payload: "submissionId", "decision", and "comments" are required.' },
        { status: 400 }
      );
    }

    const reviewer: UserProfile = body.reviewer || DEMO_USERS.reviewer;

    // Strict Server-Side Permission Enforcement
    if (!assertReviewerPermission(reviewer.role)) {
      return NextResponse.json(
        {
          error: `Forbidden: User role "${reviewer.role}" is not authorized to submit review decisions. Only authorized human reviewers and compliance officers can approve or reject copy.`,
        },
        { status: 403 }
      );
    }

    const validDecisions = ['approved', 'rejected', 'changes_requested'];
    if (!validDecisions.includes(body.decision)) {
      return NextResponse.json(
        { error: `Invalid decision "${body.decision}". Must be one of: ${validDecisions.join(', ')}.` },
        { status: 400 }
      );
    }

    const updated = await recordReviewDecision({
      submissionId: body.submissionId,
      reviewer,
      decision: body.decision,
      comments: body.comments,
    });

    return NextResponse.json({ submission: updated });
  } catch (error: unknown) {
    console.error('Error submitting review:', error);
    const message = error instanceof Error ? error.message : 'Failed to record review decision.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
