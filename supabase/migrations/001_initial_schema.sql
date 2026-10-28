-- ==============================================================================
-- BrandGuard AI — Supabase Database Migration
-- Tables: profiles, brand_policies, content_scans, scan_violations, 
--         content_submissions, reviews, audit_events
-- ==============================================================================

-- 1. User Profiles & Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'reviewer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Brand Policies
CREATE TABLE IF NOT EXISTS public.brand_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  tone JSONB NOT NULL DEFAULT '{"formality": 75, "boldness": 50, "technicality": 60}'::jsonb,
  prohibited_terms TEXT[] NOT NULL DEFAULT '{}',
  mandatory_disclaimers TEXT[] NOT NULL DEFAULT '{}',
  competitor_exclusions TEXT[] NOT NULL DEFAULT '{}',
  restricted_claims TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Content Scans
CREATE TABLE IF NOT EXISTS public.content_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT REFERENCES public.brand_policies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK (status IN ('approved', 'review_required', 'rejected', 'not_scanned')),
  analysis_method TEXT NOT NULL DEFAULT 'deterministic' CHECK (analysis_method IN ('deterministic', 'contextual_ai')),
  summary TEXT,
  categories JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_rewritten_text TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Scan Violations
CREATE TABLE IF NOT EXISTS public.scan_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.content_scans(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('legal', 'tone', 'trademark', 'claim', 'toxicity')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'compliant')),
  phrase TEXT NOT NULL,
  start_index INTEGER NOT NULL DEFAULT 0,
  end_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,
  suggested_fix TEXT NOT NULL,
  rule_violated TEXT NOT NULL,
  confidence NUMERIC(3, 2) DEFAULT 0.95,
  is_contextual BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Content Submissions (Approval Workflow)
CREATE TABLE IF NOT EXISTS public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  policy_id TEXT NOT NULL REFERENCES public.brand_policies(id),
  version INTEGER NOT NULL DEFAULT 1,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected')),
  scan_id UUID REFERENCES public.content_scans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Reviews & Decisions
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('reviewer', 'admin')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
  comments TEXT NOT NULL,
  revision_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Audit Events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT,
  target_id TEXT,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_scans_created_at ON public.content_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_violations_scan_id ON public.scan_violations(scan_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON public.reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Default RLS Policies (Permissive read for platform members, role-gated mutations)
CREATE POLICY "Public read for brand policies" ON public.brand_policies FOR SELECT USING (true);
CREATE POLICY "Public read for submissions" ON public.content_submissions FOR SELECT USING (true);
CREATE POLICY "Public read for scans" ON public.content_scans FOR SELECT USING (true);
CREATE POLICY "Public read for violations" ON public.scan_violations FOR SELECT USING (true);
CREATE POLICY "Public read for reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read for audit events" ON public.audit_events FOR SELECT USING (true);

-- Policy mutations allowed for authenticated users
CREATE POLICY "Creators can insert submissions" ON public.content_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update their submissions" ON public.content_submissions FOR UPDATE USING (true);
CREATE POLICY "Reviewers can insert reviews" ON public.reviews FOR INSERT WITH CHECK (reviewer_role IN ('reviewer', 'admin'));
CREATE POLICY "Audit events log insert" ON public.audit_events FOR INSERT WITH CHECK (true);
