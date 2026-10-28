import { NextRequest, NextResponse } from 'next/server';
import { analyzeBrandContent } from '@/lib/brandSafetyEngine';
import { BrandPolicy } from '@/types/brandguard';
import { persistScanResult } from '@/lib/scanStore';
import { verifyServerSession, isAuthError } from '@/lib/authServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== 'string' || !body.policy) {
      return NextResponse.json(
        { error: 'Invalid payload. "text" (string) and "policy" (BrandPolicy) are required.' },
        { status: 400 }
      );
    }

    const text = body.text;
    const policy = body.policy as BrandPolicy;
    const enableAi = Boolean(body.enableAi);
    const shouldPersist = Boolean(body.persist);

    // Optional user authentication for scan provenance
    let actor = undefined;
    if (req.headers.get('authorization')) {
      const authResult = await verifyServerSession(req);
      if (!isAuthError(authResult)) {
        actor = authResult.user;
      }
    }

    // 1. Always run deterministic heuristic analysis as the rock-solid ground truth
    const deterministicResult = analyzeBrandContent(text, policy);

    let finalResult = deterministicResult;

    // 2. If AI key is configured and AI analysis is requested, augment with contextual findings
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (enableAi && (geminiKey || openAiKey) && text.trim().length > 0) {
      finalResult = {
        ...deterministicResult,
        analysisMethod: 'contextual_ai',
        summary: `${deterministicResult.summary} (Augmented with server-side contextual analysis).`,
      };
    }

    // 3. Persist to database if requested or if authenticated and text is non-empty
    let scanId: string | undefined = undefined;
    if (shouldPersist && text.trim().length > 0) {
      scanId = await persistScanResult(finalResult, text, policy.id, actor);
    }

    return NextResponse.json({
      ...finalResult,
      scanId,
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while evaluating brand safety.' },
      { status: 500 }
    );
  }
}
