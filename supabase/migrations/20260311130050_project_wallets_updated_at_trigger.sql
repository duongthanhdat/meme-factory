DROP TRIGGER IF EXISTS project_wallets_updated_at ON public.project_wallets;

CREATE TRIGGER project_wallets_updated_at
  BEFORE UPDATE ON public.project_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
