-- Change status column from enum to text for flexibility
ALTER TABLE public.candidates ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.candidates ALTER COLUMN status SET DEFAULT 'initial';

-- Also update status_updates table
ALTER TABLE public.status_updates ALTER COLUMN status TYPE text USING status::text;