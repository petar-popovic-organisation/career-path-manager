export type CandidateStatus = 
  | 'initial'
  | 'hr_thoughts'
  | 'technical_first'
  | 'technical_second'
  | 'final_decision';

export type CandidateDecision = 'pass' | 'fail' | null;

export interface InterviewProcess {
  id: string;
  position: string;
  role: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy?: string;
}

export interface ProcessAccess {
  id: string;
  processId: string;
  userId: string;
  createdAt: string;
}

export interface StatusUpdate {
  id: string;
  status: CandidateStatus;
  description: string;
  timestamp: string;
  updatedBy?: string;
  decision?: CandidateDecision;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  linkedInUrl?: string;
  desiredPriceRange?: string;
  rating?: number;
  githubTaskUrl?: string;
  processId: string;
  status: CandidateStatus;
  statusHistory: StatusUpdate[];
  finalDecision?: CandidateDecision;
  createdAt: string;
  updatedAt: string;
}
