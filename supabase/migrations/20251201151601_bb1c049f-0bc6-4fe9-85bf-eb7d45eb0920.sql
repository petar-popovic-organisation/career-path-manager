-- Add github_task_url column to candidates table
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS github_task_url text;