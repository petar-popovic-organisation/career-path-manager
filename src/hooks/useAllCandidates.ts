import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, CandidateStatus, CandidateDecision, StatusUpdate } from "@/types/recruitment";
import { toast } from "sonner";

interface CandidateWithProcess extends Candidate {
  processPosition: string;
  processRole: string;
}

export const useAllCandidates = () => {
  const [candidates, setCandidates] = useState<CandidateWithProcess[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllCandidates = async () => {
    try {
      // Fetch all candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (candidatesError) throw candidatesError;

      // Fetch all interview processes
      const { data: processesData, error: processesError } = await supabase
        .from('interview_processes')
        .select('id, position, role');

      if (processesError) throw processesError;

      // Create a map for quick process lookup
      const processMap = new Map(processesData?.map(p => [p.id, p]) || []);

      // Fetch all status updates
      const candidateIds = candidatesData?.map(c => c.id) || [];
      let statusUpdates: any[] = [];
      
      if (candidateIds.length > 0) {
        const { data: updatesData, error: updatesError } = await supabase
          .from('status_updates')
          .select('*')
          .in('candidate_id', candidateIds)
          .order('created_at', { ascending: true });

        if (updatesError) throw updatesError;
        statusUpdates = updatesData || [];
      }

      const mapped: CandidateWithProcess[] = candidatesData?.map(c => {
        const process = processMap.get(c.process_id);
        const history = statusUpdates
          .filter(u => u.candidate_id === c.id)
          .map(u => ({
            id: u.id,
            status: u.status as CandidateStatus,
            description: u.description,
            timestamp: u.created_at,
            updatedBy: u.updated_by,
            decision: u.decision as CandidateDecision | null,
          }));

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          linkedInUrl: c.linkedin_url || undefined,
          desiredPriceRange: c.desired_price_range || undefined,
          rating: c.rating || undefined,
          githubTaskUrl: (c as any).github_task_url || undefined,
          processId: c.process_id,
          status: c.status as CandidateStatus,
          statusHistory: history,
          finalDecision: c.final_decision as CandidateDecision | undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          processPosition: process?.position || 'Unknown',
          processRole: process?.role || 'Unknown',
        };
      }) || [];

      setCandidates(mapped);
    } catch (error) {
      console.error('Error fetching all candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  return { candidates, loading, refetch: fetchAllCandidates };
};