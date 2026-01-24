DO $$
DECLARE
  target_uid uuid;
  cnt integer;
  total_tenants integer;
BEGIN
  -- Total tenants (admin view)
  SELECT count(*) INTO total_tenants FROM public.tenants;

  -- Get a company user's auth_id
  SELECT u.auth_id INTO target_uid
  FROM public.users u
  JOIN public.tenant_members tm ON u.id = tm.user_id
  LIMIT 1;

  IF target_uid IS NULL THEN
    RAISE NOTICE 'No company user found to test RLS.';
    RETURN;
  END IF;

  -- Simulate Session
  PERFORM set_config('request.jwt.claims', '{"sub": "' || target_uid || '", "role": "authenticated", "email": "test@example.com"}', true);
  PERFORM set_config('role', 'authenticated', true);

  -- Check access
  SELECT count(*) INTO cnt FROM public.tenants;
  
  -- Assert
  IF cnt = 1 AND total_tenants > 1 THEN
    RAISE NOTICE 'RLS SUCCESS: User sees 1 tenant out of %', total_tenants;
  ELSIF total_tenants <= 1 THEN
     RAISE NOTICE 'RLS INDETERMINATE: Only % tenant exists.', total_tenants;
  ELSE
    RAISE NOTICE 'RLS FAIL: User sees % tenants out of %', cnt, total_tenants;
  END IF;
  
END $$;
