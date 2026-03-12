CREATE OR REPLACE FUNCTION atomic_deposit_points_to_project(
  _project_id UUID,
  _owner_user_id UUID,
  _points_to_deposit INTEGER,
  _description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _wallet RECORD;
  _project_wallet RECORD;
  _new_user_points INTEGER;
  _new_project_points INTEGER;
BEGIN
  IF _points_to_deposit <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid points');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.id = _project_id
      AND p.user_id = _owner_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden');
  END IF;

  SELECT id, points INTO _wallet
  FROM wallets
  WHERE user_id = _owner_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF _wallet.points < _points_to_deposit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points', 'points', _wallet.points);
  END IF;

  _new_user_points := _wallet.points - _points_to_deposit;

  UPDATE wallets
  SET points = _new_user_points, updated_at = NOW()
  WHERE id = _wallet.id;

  INSERT INTO project_wallets (project_id, points)
  VALUES (_project_id, 0)
  ON CONFLICT (project_id) DO NOTHING;

  SELECT id, points INTO _project_wallet
  FROM project_wallets
  WHERE project_id = _project_id
  FOR UPDATE;

  _new_project_points := _project_wallet.points + _points_to_deposit;

  UPDATE project_wallets
  SET points = _new_project_points, updated_at = NOW()
  WHERE id = _project_wallet.id;

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (_owner_user_id, 0, 'payment', _description || ' (-' || _points_to_deposit || ' points cá nhân)', 'completed');

  INSERT INTO project_transactions (project_id, actor_user_id, amount, type, description, status)
  VALUES (_project_id, _owner_user_id, _points_to_deposit, 'topup', _description, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'user_points', _new_user_points,
    'project_points', _new_project_points
  );
END;
$$;
