import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflowSubmissions,
  getSubmissionById,
  createOrUpdateSubmission,
} from '@/lib/workflowStore';
import { verifyServerSession, isAuthError } from '@/lib/authServer';

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Authentication
    const authResult = await verifyServerSession(req);
    if (isAuthError(authResult)) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const currentUser = authResult.user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // If requesting a specific submission by ID
    if (id) {
      const submission = await getSubmissionById(id);
      if (!submission) {
        return NextResponse.json(
          { error: `Submission with ID "${id}" was not found.` },
          { status: 404 }
        );
      }

      // Enforce data privacy: Creators can ONLY access their own submissions
      if (currentUser.role === 'creator' && submission.creatorId !== currentUser.id) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to access another user\'s private submission.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ submission });
    }

    // List submissions: Scoped by user role (Creators see own, Reviewers/Admins see all)
    const submissions = await getWorkflowSubmissions(currentUser);
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions.' }, { status: 500 });
  }
}

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

    // Creator identity derived directly from verified server session
    const creator = authResult.user;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Invalid payload: "content" string is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // If an ID is provided, verify ownership before allowing modification
    if (body.id && typeof body.id === 'string') {
      const existing = await getSubmissionById(body.id);
      if (!existing) {
        return NextResponse.json(
          { error: `Cannot revise submission "${body.id}": Resource not found.` },
          { status: 404 }
        );
      }

      if (existing.creatorId && existing.creatorId !== creator.id && creator.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: You cannot modify or revise a submission created by another user.' },
          { status: 403 }
        );
      }
    }

    const title = typeof body.title === 'string' && body.title.trim()
      ? body.title.trim()
      : 'Marketing Content Draft';
    const policyId = typeof body.policyId === 'string' ? body.policyId : 'fintech';

    const submission = await createOrUpdateSubmission({
      id: body.id,
      title,
      content: body.content.trim(),
      policyId,
      creator,
    });

    return NextResponse.json({ submission }, { status: body.id ? 200 : 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    const message = error instanceof Error ? error.message : 'Failed to create submission.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
