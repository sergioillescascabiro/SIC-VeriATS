CREATE POLICY "Users can read own membership" ON public.tenant_members
  FOR SELECT USING (user_id = public.get_current_user_id());
