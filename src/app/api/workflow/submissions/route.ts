import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflowSubmissions,
  createOrUpdateSubmission,
  DEMO_USERS,
} from '@/lib/workflowStore';

export async function GET() {
  try {
    const submissions = await getWorkflowSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload: "content" string is required.' },
        { status: 400 }
      );
    }

    const creator = body.creator || DEMO_USERS.creator;

    const submission = await createOrUpdateSubmission({
      id: body.id,
      title: body.title || 'Marketing Content Draft',
      content: body.content,
      policyId: body.policyId || 'fintech',
      creator,
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission.' }, { status: 500 });
  }
}
