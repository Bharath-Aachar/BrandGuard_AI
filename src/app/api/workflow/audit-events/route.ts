import { NextResponse } from 'next/server';
import { getAuditEvents } from '@/lib/workflowStore';

export async function GET() {
  try {
    const events = await getAuditEvents();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching audit events:', error);
    return NextResponse.json({ error: 'Failed to fetch audit events.' }, { status: 500 });
  }
}
