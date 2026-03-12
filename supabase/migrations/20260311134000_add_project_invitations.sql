CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  invitee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_invitee ON public.project_invitations(invitee_user_id, status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON public.project_invitations(project_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_project_invite_pending
  ON public.project_invitations(project_id, invitee_user_id)
  WHERE status = 'pending';

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner and invitee can view invitations" ON public.project_invitations;
CREATE POLICY "Owner and invitee can view invitations"
  ON public.project_invitations FOR SELECT
  USING (
    invitee_user_id = auth.uid()
    OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owner can create invitations" ON public.project_invitations;
CREATE POLICY "Owner can create invitations"
  ON public.project_invitations FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Invitee or owner can update invitations" ON public.project_invitations;
CREATE POLICY "Invitee or owner can update invitations"
  ON public.project_invitations FOR UPDATE
  USING (
    invitee_user_id = auth.uid()
    OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owner can delete invitations" ON public.project_invitations;
CREATE POLICY "Owner can delete invitations"
  ON public.project_invitations FOR DELETE
  USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );
