-- Create role enum
CREATE TYPE public.app_role AS ENUM ('hr_office', 'team_lead', 'director_of_engineering');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update interview_processes policies
DROP POLICY IF EXISTS "Allow all access to interview_processes" ON public.interview_processes;

CREATE POLICY "Anyone authenticated can view interview_processes"
ON public.interview_processes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR Office can manage interview_processes"
ON public.interview_processes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'hr_office'));

CREATE POLICY "HR Office can update interview_processes"
ON public.interview_processes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'hr_office'));

CREATE POLICY "HR Office can delete interview_processes"
ON public.interview_processes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'hr_office'));

-- Update candidates policies
DROP POLICY IF EXISTS "Allow all access to candidates" ON public.candidates;

CREATE POLICY "Anyone authenticated can view candidates"
ON public.candidates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR and Team Lead can insert candidates"
ON public.candidates FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'hr_office') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "HR and Team Lead can update candidates"
ON public.candidates FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr_office') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "HR and Team Lead can delete candidates"
ON public.candidates FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr_office') OR 
  public.has_role(auth.uid(), 'team_lead')
);

-- Update status_updates policies
DROP POLICY IF EXISTS "Allow all access to status_updates" ON public.status_updates;

CREATE POLICY "Anyone authenticated can view status_updates"
ON public.status_updates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR and Team Lead can insert status_updates"
ON public.status_updates FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'hr_office') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "HR and Team Lead can update status_updates"
ON public.status_updates FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr_office') OR 
  public.has_role(auth.uid(), 'team_lead')
);

-- Trigger for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();