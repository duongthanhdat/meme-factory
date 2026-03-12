CREATE OR REPLACE FUNCTION atomic_buy_project_points(
  _project_id UUID,
  _owner_user_id UUID,
  _price NUMERIC,
  _points_to_add INTEGER,
  _description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _wallet RECORD;
  _project_wallet RECORD;
  _new_balance NUMERIC;
  _new_project_points INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.id = _project_id
      AND p.user_id = _owner_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden');
  END IF;

  SELECT id, balance INTO _wallet
  FROM wallets
  WHERE user_id = _owner_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF _wallet.balance < _price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'balance', _wallet.balance);
  END IF;

  _new_balance := _wallet.balance - _price;

  UPDATE wallets
  SET balance = _new_balance, updated_at = NOW()
  WHERE id = _wallet.id;

  INSERT INTO project_wallets (project_id, points)
  VALUES (_project_id, 0)
  ON CONFLICT (project_id) DO NOTHING;

  SELECT id, points INTO _project_wallet
  FROM project_wallets
  WHERE project_id = _project_id
  FOR UPDATE;

  _new_project_points := _project_wallet.points + _points_to_add;

  UPDATE project_wallets
  SET points = _new_project_points, updated_at = NOW()
  WHERE id = _project_wallet.id;

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (_owner_user_id, _price, 'payment', _description, 'completed');

  INSERT INTO project_transactions (project_id, actor_user_id, amount, type, description, status)
  VALUES (_project_id, _owner_user_id, _points_to_add, 'topup', _description, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'balance', _new_balance,
    'project_points', _new_project_points
  );
END;
$$;
