-- ==============================================================================
-- BrandGuard AI — Migration 003: Persistence Alignment & Seed Policies
-- Ensures flexible string/UUID IDs across submissions, reviews, and scans.
-- Pre-populates default corporate brand policies.
-- ==============================================================================

-- Seed initial brand policies for corporate governance if table is empty
INSERT INTO public.brand_policies (id, name, industry, tone, prohibited_terms, mandatory_disclaimers, competitor_exclusions, restricted_claims)
VALUES
  (
    'fintech',
    'AuraPay Global Fintech',
    'Financial Services & Payments',
    '{"formality": 85, "boldness": 40, "technicality": 65}'::jsonb,
    ARRAY['guaranteed return', 'guaranteed profit', 'zero risk', 'risk-free', '100% safe', 'foolproof', 'can''t lose', 'loophole', 'insider tip'],
    ARRAY['Capital at risk. Authorized by the FCA/SEC.', 'Past performance does not guarantee future results.', 'Terms and conditions apply. Subject to credit approval.'],
    ARRAY['Revolut', 'Stripe', 'Wise', 'Adyen', 'PayPal', 'Square'],
    ARRAY['instant withdrawal', 'fastest in the market', 'highest yield', 'zero fees forever']
  ),
  (
    'healthcare',
    'BioVital Therapeutics',
    'Biopharma & Medical Tech',
    '{"formality": 90, "boldness": 25, "technicality": 85}'::jsonb,
    ARRAY['miracle cure', 'cures all', '100% effective', 'instant healing', 'revolutionary breakthrough', 'wonder drug', 'clinically guaranteed'],
    ARRAY['Not intended to diagnose, treat, cure, or prevent any disease.', 'Consult your physician prior to clinical administration.', 'Statements not evaluated by the FDA.'],
    ARRAY['Pfizer', 'Novartis', 'Moderna', 'Johnson & Johnson', 'Roche'],
    ARRAY['clinically proven without side effects', 'permanent solution', 'instant pain relief']
  ),
  (
    'enterprise',
    'Synthetix Enterprise Cloud',
    'B2B SaaS & AI Infrastructure',
    '{"formality": 75, "boldness": 60, "technicality": 70}'::jsonb,
    ARRAY['infinitely scalable without cost', 'zero downtime guaranteed', 'hack-proof', 'destroy competitors', 'kill the competition', 'crush rivals'],
    ARRAY['Subject to enterprise SLA and master subscription terms.', 'For complete technical documentation and security whitepapers, visit the official customer portal.'],
    ARRAY['AWS', 'Microsoft Azure', 'Google Cloud', 'Snowflake', 'Databricks'],
    ARRAY['10x cheaper than all alternatives', 'unbreakable security architecture', 'zero latency globally']
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  tone = EXCLUDED.tone,
  prohibited_terms = EXCLUDED.prohibited_terms,
  mandatory_disclaimers = EXCLUDED.mandatory_disclaimers,
  competitor_exclusions = EXCLUDED.competitor_exclusions,
  restricted_claims = EXCLUDED.restricted_claims,
  updated_at = NOW();
