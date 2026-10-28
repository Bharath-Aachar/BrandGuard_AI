-- ==============================================================================
-- BrandGuard AI — Supabase Database Migration
-- Tables: profiles, brand_policies, content_scans, scan_violations, 
--         content_submissions, reviews, audit_events
-- Security: Strict Row Level Security (RLS) & Role-Based Access Control (RBAC)
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

-- 7. Audit Events (Immutable System Log)
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
CREATE INDEX IF NOT EXISTS idx_submissions_creator_id ON public.content_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON public.reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON public.audit_events(actor_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Security Helper Functions (SECURITY DEFINER)
-- ==============================================================================

-- Retrieves verified user role from public.profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Validates whether the authenticated user has reviewer or administrator role
CREATE OR REPLACE FUNCTION public.is_reviewer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('reviewer', 'admin')
  );
$$;

-- ==============================================================================
-- Row Level Security Policies
-- ==============================================================================

-- 1. Profiles Table Policies
-- Users can read their own profile; reviewers and admins can view member profiles
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_reviewer_or_admin());

-- Users can register their own profile with role='creator' only
CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'creator');

-- Users can update own profile name; only admins can alter role membership
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.get_current_user_role() = 'admin')
  WITH CHECK (
    (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.get_current_user_role() = 'admin'
  );

-- 2. Brand Policies
-- Authenticated platform members can view active guidelines
CREATE POLICY "Brand policies read policy"
  ON public.brand_policies FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only compliance reviewers and admins can modify brand policies
CREATE POLICY "Brand policies write policy"
  ON public.brand_policies FOR ALL
  USING (public.is_reviewer_or_admin())
  WITH CHECK (public.is_reviewer_or_admin());

-- 3. Content Submissions
-- Creators can ONLY view their own submissions; reviewers and admins can view all submissions in review queue
CREATE POLICY "Submissions read policy"
  ON public.content_submissions FOR SELECT
  USING (creator_id = auth.uid() OR public.is_reviewer_or_admin());

-- Creators can insert their own submissions with initial status 'draft' or 'pending_review'
CREATE POLICY "Submissions insert policy"
  ON public.content_submissions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    creator_id = auth.uid() AND
    status IN ('draft', 'pending_review')
  );

-- Creators can update their own drafts or revisions; reviewers can update status
CREATE POLICY "Submissions update policy"
  ON public.content_submissions FOR UPDATE
  USING (creator_id = auth.uid() OR public.is_reviewer_or_admin())
  WITH CHECK (
    (creator_id = auth.uid() AND status IN ('draft', 'pending_review'))
    OR public.is_reviewer_or_admin()
  );

-- 4. Reviews
-- Creators can view reviews for their own submissions; reviewers/admins can view all reviews
CREATE POLICY "Reviews read policy"
  ON public.reviews FOR SELECT
  USING (
    public.is_reviewer_or_admin() OR
    EXISTS (
      SELECT 1 FROM public.content_submissions s
      WHERE s.id = reviews.submission_id AND s.creator_id = auth.uid()
    )
  );

-- Only verified reviewers or admins can insert reviews.
-- ENFORCES SEPARATION OF DUTIES: Reviewers CANNOT review their own submissions!
CREATE POLICY "Reviews insert policy"
  ON public.reviews FOR INSERT
  WITH CHECK (
    public.is_reviewer_or_admin() AND
    reviewer_id = auth.uid() AND
    decision IN ('approved', 'rejected', 'changes_requested') AND
    NOT EXISTS (
      SELECT 1 FROM public.content_submissions s
      WHERE s.id = reviews.submission_id AND s.creator_id = auth.uid()
    )
  );

-- Reviews are immutable once recorded (no updates or deletes permitted)

-- 5. Audit Events
-- Immutable append-only audit trail. Reviewers and admins can inspect all audit logs;
-- Creators can only inspect events where they are the actor.
CREATE POLICY "Audit events read policy"
  ON public.audit_events FOR SELECT
  USING (
    public.is_reviewer_or_admin() OR
    actor_id = auth.uid()::text
  );

-- Clients CANNOT directly insert or alter audit events.
-- Only the backend server (using service-role key) writes trusted audit logs.

-- 6. Content Scans & Scan Violations
CREATE POLICY "Scans read policy"
  ON public.content_scans FOR SELECT
  USING (user_id = auth.uid() OR public.is_reviewer_or_admin());

CREATE POLICY "Scans insert policy"
  ON public.content_scans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Violations read policy"
  ON public.scan_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_scans s
      WHERE s.id = scan_violations.scan_id AND (s.user_id = auth.uid() OR public.is_reviewer_or_admin())
    )
  );
