-- Fix the View interview_processes policy - wrong column reference
DROP POLICY IF EXISTS "View interview_processes" ON public.interview_processes;

CREATE FUNCTION public.can_view_interview_process(process_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT has_role(user_id, 'hr_office')
       OR has_role(user_id, 'director_of_engineering')
       OR EXISTS (
           SELECT 1 FROM process_access
           WHERE process_id = $1
             AND user_id = $2
       );
$$;


CREATE POLICY "View interview_processes" 
ON public.interview_processes
FOR SELECT
USING (public.can_view_interview_process(interview_processes.id, auth.uid()));
