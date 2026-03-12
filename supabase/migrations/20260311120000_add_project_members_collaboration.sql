CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'editor')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view their memberships" ON public.project_members;
CREATE POLICY "Project members can view their memberships"
  ON public.project_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
CREATE POLICY "Project owners can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Project owners or self can remove membership" ON public.project_members;
CREATE POLICY "Project owners or self can remove membership"
  ON public.project_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = user_id
    OR id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create characters in their projects" ON public.characters;
CREATE POLICY "Users can create characters in their projects"
  ON public.characters FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view characters of their projects" ON public.characters;
CREATE POLICY "Users can view characters of their projects"
  ON public.characters FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update characters in their projects" ON public.characters;
CREATE POLICY "Users can update characters in their projects"
  ON public.characters FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete characters in their projects" ON public.characters;
CREATE POLICY "Users can delete characters in their projects"
  ON public.characters FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view poses of their characters" ON public.character_poses;
CREATE POLICY "Users can view poses of their characters"
  ON public.character_poses FOR SELECT
  USING (
    character_id IN (
      SELECT c.id
      FROM public.characters c
      WHERE c.project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
        UNION
        SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create poses for their characters" ON public.character_poses;
CREATE POLICY "Users can create poses for their characters"
  ON public.character_poses FOR INSERT
  WITH CHECK (
    character_id IN (
      SELECT c.id
      FROM public.characters c
      WHERE c.project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
        UNION
        SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete poses of their characters" ON public.character_poses;
CREATE POLICY "Users can delete poses of their characters"
  ON public.character_poses FOR DELETE
  USING (
    character_id IN (
      SELECT c.id
      FROM public.characters c
      WHERE c.project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
        UNION
        SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can view memes of their projects" ON public.memes;
CREATE POLICY "Users can view memes of their projects"
  ON public.memes FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create memes in their projects" ON public.memes;
CREATE POLICY "Users can create memes in their projects"
  ON public.memes FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update memes in their projects" ON public.memes;
CREATE POLICY "Users can update memes in their projects"
  ON public.memes FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete memes in their projects" ON public.memes;
CREATE POLICY "Users can delete memes in their projects"
  ON public.memes FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );
