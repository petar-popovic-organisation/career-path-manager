-- Update profiles policy to allow HR Office to view all profiles
DROP POLICY IF EXISTS "Users can view own profile or director can view all" ON public.profiles;

CREATE POLICY "Users can view profiles based on role" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'director_of_engineering') OR
  has_role(auth.uid(), 'hr_office')
);