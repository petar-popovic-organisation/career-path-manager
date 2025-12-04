-- Add created_by column to interview_processes
ALTER TABLE public.interview_processes 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Create process_access table for user assignments
CREATE TABLE public.process_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL REFERENCES public.interview_processes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(process_id, user_id)
);

-- Enable RLS on process_access
ALTER TABLE public.process_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on interview_processes
DROP POLICY IF EXISTS "Anyone authenticated can view interview_processes" ON public.interview_processes;
DROP POLICY IF EXISTS "HR Office can delete interview_processes" ON public.interview_processes;
DROP POLICY IF EXISTS "HR Office can manage interview_processes" ON public.interview_processes;
DROP POLICY IF EXISTS "HR Office can update interview_processes" ON public.interview_processes;

-- New policies for interview_processes
-- HR Office and Director can see all, others only if they have access
CREATE POLICY "View interview_processes" ON public.interview_processes
FOR SELECT USING (
  has_role(auth.uid(), 'hr_office') OR 
  has_role(auth.uid(), 'director_of_engineering') OR
  EXISTS (SELECT 1 FROM public.process_access WHERE process_id = id AND user_id = auth.uid())
);

-- HR Office can insert
CREATE POLICY "HR Office can insert interview_processes" ON public.interview_processes
FOR INSERT WITH CHECK (has_role(auth.uid(), 'hr_office'));

-- HR Office can update/delete only their own processes
CREATE POLICY "HR Office can update own interview_processes" ON public.interview_processes
FOR UPDATE USING (has_role(auth.uid(), 'hr_office') AND created_by = auth.uid());

CREATE POLICY "HR Office can delete own interview_processes" ON public.interview_processes
FOR DELETE USING (has_role(auth.uid(), 'hr_office') AND created_by = auth.uid());

-- Policies for process_access
-- HR Office (creator) and Director can view access list
CREATE POLICY "View process_access" ON public.process_access
FOR SELECT USING (
  has_role(auth.uid(), 'director_of_engineering') OR
  EXISTS (SELECT 1 FROM public.interview_processes WHERE id = process_id AND created_by = auth.uid())
);

-- HR Office can manage access for their own processes
CREATE POLICY "HR Office can insert process_access" ON public.process_access
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'hr_office') AND
  EXISTS (SELECT 1 FROM public.interview_processes WHERE id = process_id AND created_by = auth.uid())
);

CREATE POLICY "HR Office can delete process_access" ON public.process_access
FOR DELETE USING (
  has_role(auth.uid(), 'hr_office') AND
  EXISTS (SELECT 1 FROM public.interview_processes WHERE id = process_id AND created_by = auth.uid())
);