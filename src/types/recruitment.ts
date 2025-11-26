export type CandidateStatus = 
  | 'hr_started'
  | 'technical_first'
  | 'technical_second'
  | 'final_decision';

export interface InterviewProcess {
  id: string;
  position: string;
  role: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface StatusUpdate {
  id: string;
  status: CandidateStatus;
  description: string;
  timestamp: string;
  updatedBy?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  processId: string;
  status: CandidateStatus;
  statusHistory: StatusUpdate[];
  createdAt: string;
  updatedAt: string;
}
