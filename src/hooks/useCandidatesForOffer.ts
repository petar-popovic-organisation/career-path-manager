import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CandidateForOffer {
  id: string;
  name: string;
  email: string;
  processId: string;
  processPosition: string;
  processRole: string;
  finalDecisionDate: string | null;
  offerStatus: string;
}

export const useCandidatesForOffer = () => {
  const [candidates, setCandidates] = useState<CandidateForOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      // Get candidates with passed final decision
      const { data: candidatesData, error } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          email,
          process_id,
          final_decision,
          final_decision_date,
          offer_status
        `)
        .eq('final_decision', 'pass')
        .in('offer_status', ['pending', 'sent']);

      if (error) throw error;

      if (!candidatesData || candidatesData.length === 0) {
        setCandidates([]);
        return;
      }

      // Get process details
      const processIds = [...new Set(candidatesData.map(c => c.process_id))];
      const { data: processesData, error: processError } = await supabase
        .from('interview_processes')
        .select('id, position, role')
        .in('id', processIds);

      if (processError) throw processError;

      const processMap = new Map(processesData?.map(p => [p.id, p]) || []);

      const mapped = candidatesData.map(c => {
        const process = processMap.get(c.process_id);
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          processId: c.process_id,
          processPosition: process?.position || 'Unknown',
          processRole: process?.role || 'Unknown',
          finalDecisionDate: (c as any).final_decision_date || null,
          offerStatus: (c as any).offer_status || 'pending',
        };
      });

      setCandidates(mapped);
    } catch (error) {
      console.error('Error fetching candidates for offer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return { candidates, loading, refetch: fetchCandidates };
};