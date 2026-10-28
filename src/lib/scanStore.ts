import { ScanResult, UserProfile } from '@/types/brandguard';
import { getServerSupabaseClient, isServerSupabaseConfigured } from './supabaseServer';

export interface PersistentScanRecord {
  id: string;
  policyId: string;
  content: string;
  score: number;
  status: string;
  analysisMethod: string;
  summary: string;
  categories: Record<string, unknown>;
  userId?: string;
  createdAt: string;
  violationsCount: number;
}

let inMemoryScans: PersistentScanRecord[] = [];

export function resetScanStoreForTesting() {
  inMemoryScans = [];
}

/**
 * Persists a completed scan result to Supabase (content_scans & scan_violations).
 */
export async function persistScanResult(
  scanResult: ScanResult,
  content: string,
  policyId: string,
  user?: UserProfile
): Promise<string> {
  const scanId = `scn-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const supabase = getServerSupabaseClient();

  if (isServerSupabaseConfigured && supabase) {
    try {
      const isUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      const { error: scanErr } = await supabase.from('content_scans').insert({
        id: scanId,
        policy_id: policyId,
        content,
        score: scanResult.overallScore,
        status: scanResult.status,
        analysis_method: scanResult.analysisMethod,
        summary: scanResult.summary,
        categories: scanResult.categories,
        user_id: isUuid ? user.id : null,
        created_at: now,
      });

      if (scanErr) {
        throw new Error(`Database error saving scan: ${scanErr.message}`);
      }

      // Persist individual violations if any exist
      if (scanResult.violations && scanResult.violations.length > 0) {
        const violationRows = scanResult.violations.map((v) => ({
          scan_id: scanId,
          category: v.category,
          severity: v.severity,
          phrase: v.phrase,
          start_index: v.startIndex,
          end_index: v.endIndex,
          title: v.title,
          explanation: v.explanation,
          suggested_fix: v.suggestedFix,
          rule_violated: v.ruleViolated,
          confidence: v.confidence || 0.95,
          is_contextual: Boolean(v.isContextual),
        }));

        const { error: violErr } = await supabase.from('scan_violations').insert(violationRows);
        if (violErr) {
          console.warn('Failed to insert individual violations:', violErr);
        }
      }

      // Record audit event for scan execution
      if (user) {
        await supabase.from('audit_events').insert({
          event_type: 'scan_executed',
          actor_id: user.id,
          actor_name: user.name,
          actor_role: user.role,
          target_id: scanId,
          details: `Executed ${scanResult.analysisMethod} brand compliance scan (Score: ${scanResult.overallScore}/100, Violations: ${scanResult.violations.length}).`,
          created_at: now,
        });
      }
    } catch (err) {
      console.error('Failed to persist scan to Supabase:', err);
      throw err;
    }
  }

  // Fallback in-memory persistence
  const record: PersistentScanRecord = {
    id: scanId,
    policyId,
    content,
    score: scanResult.overallScore,
    status: scanResult.status,
    analysisMethod: scanResult.analysisMethod,
    summary: scanResult.summary,
    categories: scanResult.categories,
    userId: user?.id,
    createdAt: now,
    violationsCount: scanResult.violations?.length || 0,
  };
  inMemoryScans.unshift(record);

  return scanId;
}

/**
 * Retrieves persisted scan history for a user or reviewer.
 */
export async function getPersistentScans(currentUser?: UserProfile): Promise<PersistentScanRecord[]> {
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('content_scans')
        .select('*, scan_violations(count)')
        .order('created_at', { ascending: false })
        .limit(50);

      // Scoped access: creators only see their own scans
      if (currentUser && currentUser.role === 'creator') {
        query = query.eq('user_id', currentUser.id);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error fetching scans: ${error.message}`);
      }

      if (data) {
        return data.map((d) => ({
          id: d.id,
          policyId: d.policy_id,
          content: d.content,
          score: d.score,
          status: d.status,
          analysisMethod: d.analysis_method,
          summary: d.summary,
          categories: d.categories,
          userId: d.user_id,
          createdAt: d.created_at,
          violationsCount: Array.isArray(d.scan_violations) ? d.scan_violations.length : 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch scans from Supabase:', err);
      throw err;
    }
  }

  let scans = inMemoryScans;
  if (currentUser && currentUser.role === 'creator') {
    scans = scans.filter((s) => s.userId === currentUser.id);
  }
  return JSON.parse(JSON.stringify(scans));
}
