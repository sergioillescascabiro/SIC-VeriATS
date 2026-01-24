-- Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create Tenant Members Table
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id integer REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'MEMBER' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, user_id)
);

-- Add auth_id to users if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='auth_id') THEN
    ALTER TABLE public.users ADD COLUMN auth_id uuid REFERENCES auth.users(id);
    ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
  END IF;
END $$;

-- Data Migration Block
DO $$
DECLARE
  user_record record;
  new_uid uuid;
  new_tenant_id uuid;
BEGIN
  FOR user_record IN SELECT * FROM public.users WHERE auth_id IS NULL LOOP
     new_uid := gen_random_uuid();
     
     -- Insert into auth.users
     INSERT INTO auth.users (
       instance_id,
       id,
       aud,
       role,
       email,
       encrypted_password,
       email_confirmed_at,
       raw_app_meta_data,
       raw_user_meta_data,
       created_at,
       updated_at,
       confirmation_token,
       recovery_token,
       email_change,
       email_change_token_new,
       is_super_admin
     ) VALUES (
       '00000000-0000-0000-0000-000000000000',
       new_uid,
       'authenticated',
       'authenticated',
       user_record.email,
       user_record.hashed_password, 
       now(),
       '{"provider":"email","providers":["email"]}',
       jsonb_build_object('full_name', COALESCE(user_record.company_name, user_record.email)),
       now(),
       now(),
       '',
       '',
       '',
       '',
       false
     );

     -- Link public.user
     UPDATE public.users SET auth_id = new_uid WHERE id = user_record.id;

     -- If COMPANY, create tenant
     IF user_record.role = 'COMPANY' THEN
        INSERT INTO public.tenants (name) VALUES (COALESCE(user_record.company_name, 'My Company')) RETURNING id INTO new_tenant_id;
        INSERT INTO public.tenant_members (tenant_id, user_id, role) VALUES (new_tenant_id, user_record.id, 'OWNER');
     END IF;
     
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS integer AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS Policies

-- Public Users (Profiles)
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Tenants
CREATE POLICY "Members can read tenant" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = public.tenants.id
      AND tm.user_id = public.get_current_user_id()
    )
  );

-- Jobs (Company jobs visible to members, Active jobs visible to Everyone)
CREATE POLICY "Active jobs are public" ON public.jobs
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Company members can manage jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = (SELECT tenant_id FROM public.jobs j WHERE j.id = public.jobs.id) -- Wait, jobs need tenant_id?
      AND tm.user_id = public.get_current_user_id()
    )
  );

-- FIX: Jobs table currently has company_id (int) which refs users(id).
-- In the new model, jobs should refs tenants(id) OR we treat company_id as the tenant owner?
-- Current schema: `jobs.company_id` -> `users.id`.
-- If we keep this, then a "Company" is just a User.
-- But we added `tenants` table.
-- Ideally, `jobs` should belong to a `tenant`.
-- Migration decision: Add `tenant_id` to `jobs` and backfill it from `jobs.company_id` (User) -> `tenant_members` -> `tenant`.
-- This is cleaner.

-- Update Jobs to look up tenant
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='tenant_id') THEN
    ALTER TABLE public.jobs ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;

-- Backfill jobs tenant_id
UPDATE public.jobs j
SET tenant_id = tm.tenant_id
FROM public.tenant_members tm
WHERE j.company_id = tm.user_id AND tm.role = 'OWNER';

-- Update Job Policies to use tenant_id
DROP POLICY IF EXISTS "Company members can manage jobs" ON public.jobs;
CREATE POLICY "Tenant members can manage jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = public.jobs.tenant_id
      AND tm.user_id = public.get_current_user_id()
    )
  );
