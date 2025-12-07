-- Add new columns to candidates table for offer management
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS final_decision_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS offer_status text DEFAULT 'pending' CHECK (offer_status IN ('pending', 'sent', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS offer_description text,
ADD COLUMN IF NOT EXISTS offer_start_date date,
ADD COLUMN IF NOT EXISTS offer_rejection_reason text,
ADD COLUMN IF NOT EXISTS offer_decision_date timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.candidates.final_decision_date IS 'Date when candidate interview process finished';
COMMENT ON COLUMN public.candidates.offer_status IS 'Status of offer: pending, sent, accepted, rejected';
COMMENT ON COLUMN public.candidates.offer_description IS 'Description when offer is accepted';
COMMENT ON COLUMN public.candidates.offer_start_date IS 'Start date if candidate accepts offer';
COMMENT ON COLUMN public.candidates.offer_rejection_reason IS 'Reason if candidate rejects offer';
COMMENT ON COLUMN public.candidates.offer_decision_date IS 'Date when candidate made decision on offer';