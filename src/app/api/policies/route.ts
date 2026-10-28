import { NextRequest, NextResponse } from 'next/server';
import { getBrandPolicies, saveBrandPolicy } from '@/lib/policyStore';
import { verifyServerSession, isAuthError } from '@/lib/authServer';
import { BrandPolicy } from '@/types/brandguard';

export async function GET() {
  try {
    const policies = await getBrandPolicies();
    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching brand policies:', error);
    return NextResponse.json({ error: 'Failed to retrieve brand policies.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Authentication
    const authResult = await verifyServerSession(req);
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const actor = authResult.user;

    // 2. Enforce Role: Reviewer or Admin required to modify policies
    if (actor.role !== 'reviewer' && actor.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized compliance reviewers or administrators can modify brand policies.' },
        { status: 403 }
      );
    }

    // 3. Validate Request Body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.policy) {
      return NextResponse.json(
        { error: 'Invalid payload: "policy" object is required.' },
        { status: 400 }
      );
    }

    const policy = body.policy as BrandPolicy;
    if (!policy.id || !policy.name) {
      return NextResponse.json(
        { error: 'Invalid policy data: "id" and "name" are required fields.' },
        { status: 400 }
      );
    }

    const updated = await saveBrandPolicy(policy, actor);
    return NextResponse.json({ policy: updated }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating brand policy:', error);
    const message = error instanceof Error ? error.message : 'Internal error saving brand policy.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
