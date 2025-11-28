-- Add rating column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN rating integer DEFAULT NULL CHECK (rating >= 1 AND rating <= 10);