import { NextRequest, NextResponse } from 'next/server';
import { getAuditEvents } from '@/lib/workflowStore';
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

    // 2. Fetch scoped audit events (Creators only see their events; Reviewers/Admins see all)
    const events = await getAuditEvents(currentUser);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching audit events:', error);
    return NextResponse.json({ error: 'Failed to fetch audit events.' }, { status: 500 });
  }
}

// Reject all client-side audit event manipulation attempts
export async function POST() {
  return NextResponse.json(
    { error: 'Forbidden: Audit events are immutable system-generated logs and cannot be forged or created directly by clients.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Forbidden: Audit events are immutable system logs and cannot be updated.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Forbidden: Audit events cannot be deleted.' },
    { status: 405 }
  );
}
