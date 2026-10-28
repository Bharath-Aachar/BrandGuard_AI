-- ==============================================================================
-- BrandGuard AI — Migration 002: Security & RLS Hardening
-- Replaces permissive public policies with strict role-based and ownership policies.
-- Enforces separation of duties and prevents client audit tampering.
-- ==============================================================================

-- Drop legacy permissive policies if they exist
DROP POLICY IF EXISTS "Public read for brand policies" ON public.brand_policies;
DROP POLICY IF EXISTS "Public read for submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Public read for scans" ON public.content_scans;
DROP POLICY IF EXISTS "Public read for violations" ON public.scan_violations;
DROP POLICY IF EXISTS "Public read for reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public read for audit events" ON public.audit_events;
DROP POLICY IF EXISTS "Creators can insert submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Creators can update their submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Reviewers can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Audit events log insert" ON public.audit_events;

-- Security helper functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

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

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_reviewer_or_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'creator');

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.get_current_user_role() = 'admin')
  WITH CHECK (
    (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.get_current_user_role() = 'admin'
  );

-- Brand Policies Policies
DROP POLICY IF EXISTS "Brand policies read policy" ON public.brand_policies;
CREATE POLICY "Brand policies read policy"
  ON public.brand_policies FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Brand policies write policy" ON public.brand_policies;
CREATE POLICY "Brand policies write policy"
  ON public.brand_policies FOR ALL
  USING (public.is_reviewer_or_admin())
  WITH CHECK (public.is_reviewer_or_admin());

-- Content Submissions Policies
DROP POLICY IF EXISTS "Submissions read policy" ON public.content_submissions;
CREATE POLICY "Submissions read policy"
  ON public.content_submissions FOR SELECT
  USING (creator_id = auth.uid() OR public.is_reviewer_or_admin());

DROP POLICY IF EXISTS "Submissions insert policy" ON public.content_submissions;
CREATE POLICY "Submissions insert policy"
  ON public.content_submissions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    creator_id = auth.uid() AND
    status IN ('draft', 'pending_review')
  );

DROP POLICY IF EXISTS "Submissions update policy" ON public.content_submissions;
CREATE POLICY "Submissions update policy"
  ON public.content_submissions FOR UPDATE
  USING (creator_id = auth.uid() OR public.is_reviewer_or_admin())
  WITH CHECK (
    (creator_id = auth.uid() AND status IN ('draft', 'pending_review'))
    OR public.is_reviewer_or_admin()
  );

-- Reviews Policies (Enforces Separation of Duties)
DROP POLICY IF EXISTS "Reviews read policy" ON public.reviews;
CREATE POLICY "Reviews read policy"
  ON public.reviews FOR SELECT
  USING (
    public.is_reviewer_or_admin() OR
    EXISTS (
      SELECT 1 FROM public.content_submissions s
      WHERE s.id = reviews.submission_id AND s.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Reviews insert policy" ON public.reviews;
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

-- Audit Events Policies (Read-only for users, append-only via server service role)
DROP POLICY IF EXISTS "Audit events read policy" ON public.audit_events;
CREATE POLICY "Audit events read policy"
  ON public.audit_events FOR SELECT
  USING (
    public.is_reviewer_or_admin() OR
    actor_id = auth.uid()::text
  );

-- Scans & Violations
DROP POLICY IF EXISTS "Scans read policy" ON public.content_scans;
CREATE POLICY "Scans read policy"
  ON public.content_scans FOR SELECT
  USING (user_id = auth.uid() OR public.is_reviewer_or_admin());

DROP POLICY IF EXISTS "Scans insert policy" ON public.content_scans;
CREATE POLICY "Scans insert policy"
  ON public.content_scans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

DROP POLICY IF EXISTS "Violations read policy" ON public.scan_violations;
CREATE POLICY "Violations read policy"
  ON public.scan_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_scans s
      WHERE s.id = scan_violations.scan_id AND (s.user_id = auth.uid() OR public.is_reviewer_or_admin())
    )
  );
