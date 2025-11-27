-- Create enum for candidate status
CREATE TYPE public.candidate_status AS ENUM (
  'hr_started',
  'technical_first',
  'technical_second',
  'final_decision'
);

-- Create enum for candidate decision
CREATE TYPE public.candidate_decision AS ENUM ('pass', 'fail');

-- Create interview_processes table
CREATE TABLE public.interview_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.interview_processes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  desired_price_range TEXT,
  status candidate_status DEFAULT 'hr_started' NOT NULL,
  final_decision candidate_decision,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create status_updates table for tracking all comments/updates
CREATE TABLE public.status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  status candidate_status NOT NULL,
  description TEXT NOT NULL,
  decision candidate_decision,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.interview_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now, can be restricted later with auth)
CREATE POLICY "Allow all access to interview_processes" ON public.interview_processes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to candidates" ON public.candidates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to status_updates" ON public.status_updates
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_candidates_process_id ON public.candidates(process_id);
CREATE INDEX idx_status_updates_candidate_id ON public.status_updates(candidate_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_interview_processes_updated_at
  BEFORE UPDATE ON public.interview_processes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();