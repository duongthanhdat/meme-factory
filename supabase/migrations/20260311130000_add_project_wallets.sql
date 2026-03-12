CREATE TABLE IF NOT EXISTS public.project_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'payment', 'refund')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_wallets_project_id ON public.project_wallets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_transactions_project_id ON public.project_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_transactions_created_at ON public.project_transactions(created_at DESC);

ALTER TABLE public.project_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view project wallets" ON public.project_wallets;
CREATE POLICY "Project members can view project wallets"
  ON public.project_wallets FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access project wallets" ON public.project_wallets;
CREATE POLICY "Service role full access project wallets"
  ON public.project_wallets FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Project members can view project transactions" ON public.project_transactions;
CREATE POLICY "Project members can view project transactions"
  ON public.project_transactions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access project transactions" ON public.project_transactions;
CREATE POLICY "Service role full access project transactions"
  ON public.project_transactions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
