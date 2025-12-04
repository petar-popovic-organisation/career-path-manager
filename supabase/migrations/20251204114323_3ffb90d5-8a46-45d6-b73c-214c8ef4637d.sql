-- Fix the View interview_processes policy - wrong column reference
DROP POLICY IF EXISTS "View interview_processes" ON public.interview_processes;

CREATE POLICY "View interview_processes" ON public.interview_processes
FOR SELECT USING (
  has_role(auth.uid(), 'hr_office') OR 
  has_role(auth.uid(), 'director_of_engineering') OR
  EXISTS (
    SELECT 1 FROM process_access 
    WHERE process_access.process_id = interview_processes.id 
    AND process_access.user_id = auth.uid()
  )
);