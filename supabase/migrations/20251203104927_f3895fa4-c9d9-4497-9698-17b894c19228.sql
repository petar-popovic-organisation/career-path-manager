-- Add is_active column to profiles for enabling/disabling users
ALTER TABLE public.profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Update profiles RLS to allow director_of_engineering to view all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile or director can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'director_of_engineering')
);

-- Allow director_of_engineering to update profiles (for disabling users)
CREATE POLICY "Director can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'director_of_engineering'));

-- Update user_roles RLS to allow director_of_engineering to view all roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role or director can view all"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'director_of_engineering')
);

-- Allow director_of_engineering to insert roles
CREATE POLICY "Director can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'director_of_engineering'));

-- Allow director_of_engineering to update roles
CREATE POLICY "Director can update roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'director_of_engineering'));

-- Allow director_of_engineering to delete roles
CREATE POLICY "Director can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'director_of_engineering'));