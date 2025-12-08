import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CandidateOffer {
  id: string;
  name: string;
  email: string;
  processId: string;
  processPosition: string;
  processRole: string;
  finalDecisionDate: string | null;
  offerStatus: string;
  offerDescription: string | null;
  offerStartDate: string | null;
  offerRejectionReason: string | null;
  offerDecisionDate: string | null;
}

export const useOfferHistory = () => {
  const [candidates, setCandidates] = useState<CandidateOffer[]>([]);
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
          offer_status,
          offer_description,
          offer_start_date,
          offer_rejection_reason,
          offer_decision_date
        `)
        .eq('final_decision', 'pass')
        .order('final_decision_date', { ascending: false });

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
          finalDecisionDate: c.final_decision_date || null,
          offerStatus: c.offer_status || 'pending',
          offerDescription: c.offer_description || null,
          offerStartDate: c.offer_start_date || null,
          offerRejectionReason: c.offer_rejection_reason || null,
          offerDecisionDate: c.offer_decision_date || null,
        };
      });

      setCandidates(mapped);
    } catch (error) {
      console.error('Error fetching offer history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return { candidates, loading, refetch: fetchCandidates };
};
