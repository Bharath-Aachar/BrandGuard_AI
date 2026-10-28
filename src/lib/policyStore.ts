import { BrandPolicy, UserProfile } from '@/types/brandguard';
import { DEFAULT_POLICIES } from './brandSafetyEngine';
import { getServerSupabaseClient, isServerSupabaseConfigured } from './supabaseServer';
import { assertReviewerPermission } from './workflowStore';

// In-memory fallback policies for offline/demo mode
let inMemoryPolicies: Record<string, BrandPolicy> = JSON.parse(JSON.stringify(DEFAULT_POLICIES));

export function resetPolicyStoreForTesting() {
  inMemoryPolicies = JSON.parse(JSON.stringify(DEFAULT_POLICIES));
}

/**
 * Retrieves all brand policies. Reads from Supabase if configured,
 * otherwise falls back to local in-memory policy definitions.
 */
export async function getBrandPolicies(): Promise<Record<string, BrandPolicy>> {
  const supabase = getServerSupabaseClient();
  if (isServerSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('brand_policies')
        .select('*');

      if (!error && data && data.length > 0) {
        const policyMap: Record<string, BrandPolicy> = {};
        for (const row of data) {
          policyMap[row.id] = {
            id: row.id,
            name: row.name,
            industry: row.industry,
            tone: row.tone || { formality: 75, boldness: 50, technicality: 60 },
            prohibitedTerms: row.prohibited_terms || [],
            mandatoryDisclaimers: row.mandatory_disclaimers || [],
            competitorExclusions: row.competitor_exclusions || [],
            restrictedClaims: row.restricted_claims || [],
          };
        }
        return policyMap;
      }
    } catch (err) {
      console.error('Failed to fetch brand policies from Supabase:', err);
      throw err;
    }
  }

  return JSON.parse(JSON.stringify(inMemoryPolicies));
}

/**
 * Persists an updated brand policy. Enforces role verification:
 * Only reviewers and administrators are authorized to modify corporate brand guidelines.
 */
export async function saveBrandPolicy(
  policy: BrandPolicy,
  actor: UserProfile
): Promise<BrandPolicy> {
  if (!assertReviewerPermission(actor.role)) {
    throw new Error(
      `Permission Denied: User role "${actor.role}" cannot modify brand policies. Reviewer or administrator privileges required.`
    );
  }

  if (!policy.id || !policy.name) {
    throw new Error('Invalid policy: "id" and "name" are required.');
  }

  const now = new Date().toISOString();
  const supabase = getServerSupabaseClient();

  if (isServerSupabaseConfigured && supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actor.id);
      const { error: upsertErr } = await supabase.from('brand_policies').upsert({
        id: policy.id,
        name: policy.name,
        industry: policy.industry,
        tone: policy.tone,
        prohibited_terms: policy.prohibitedTerms,
        mandatory_disclaimers: policy.mandatoryDisclaimers,
        competitor_exclusions: policy.competitorExclusions,
        restricted_claims: policy.restrictedClaims,
        created_by: isUuid ? actor.id : null,
        updated_at: now,
      });

      if (upsertErr) {
        throw new Error(`Database error saving brand policy: ${upsertErr.message}`);
      }

      // Record immutable audit event for policy change
      await supabase.from('audit_events').insert({
        event_type: 'policy_updated',
        actor_id: actor.id,
        actor_name: actor.name,
        actor_role: actor.role,
        target_id: policy.id,
        details: `Updated brand safety thresholds and guidelines for policy "${policy.name}" (${policy.industry}).`,
        created_at: now,
      });
    } catch (err) {
      console.error('Failed to save policy to Supabase:', err);
      throw err;
    }
  }

  // Update in-memory fallback
  inMemoryPolicies[policy.id] = JSON.parse(JSON.stringify(policy));
  return inMemoryPolicies[policy.id];
}
