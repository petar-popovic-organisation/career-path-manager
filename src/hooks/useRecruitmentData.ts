import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InterviewProcess, Candidate, StatusUpdate, CandidateStatus, CandidateDecision, ProcessAccess } from "@/types/recruitment";
import { toast } from "sonner";

// Type helpers for database
type DbCandidateDecision = 'pass' | 'fail';

export const useProcesses = () => {
  const [processes, setProcesses] = useState<InterviewProcess[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_processes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map(p => ({
        id: p.id,
        position: p.position,
        role: p.role,
        startDate: p.start_date,
        endDate: p.end_date,
        createdAt: p.created_at,
        createdBy: (p as any).created_by || undefined,
      })) || [];

      setProcesses(mapped);
    } catch (error) {
      console.error('Error fetching processes:', error);
      toast.error('Failed to load processes');
    } finally {
      setLoading(false);
    }
  };

  const createProcess = async (
    processData: Omit<InterviewProcess, 'id' | 'createdAt'>,
    accessUserIds?: string[]
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { data, error } = await supabase
        .from('interview_processes')
        .insert({
          position: processData.position,
          role: processData.role,
          start_date: processData.startDate,
          end_date: processData.endDate,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add process access for selected users
      if (accessUserIds && accessUserIds.length > 0) {
        const accessRows = accessUserIds.map(uid => ({
          process_id: data.id,
          user_id: uid,
        }));
        
        const { error: accessError } = await supabase
          .from('process_access')
          .insert(accessRows);
        
        if (accessError) {
          console.error('Error adding process access:', accessError);
        }
      }

      const newProcess: InterviewProcess = {
        id: data.id,
        position: data.position,
        role: data.role,
        startDate: data.start_date,
        endDate: data.end_date,
        createdAt: data.created_at,
        createdBy: (data as any).created_by || undefined,
      };

      setProcesses(prev => [newProcess, ...prev]);
      return newProcess;
    } catch (error) {
      console.error('Error creating process:', error);
      toast.error('Failed to create process');
      throw error;
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  return { processes, loading, createProcess, refetch: fetchProcesses };
};

export const useProcessAccess = (processId: string) => {
  const [accessUsers, setAccessUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('process_access')
        .select('user_id')
        .eq('process_id', processId);

      if (error) throw error;
      setAccessUsers(data?.map(a => a.user_id) || []);
    } catch (error) {
      console.error('Error fetching process access:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('process_access')
        .insert({ process_id: processId, user_id: userId });

      if (error) throw error;
      setAccessUsers(prev => [...prev, userId]);
      toast.success('User access added');
    } catch (error) {
      console.error('Error adding access:', error);
      toast.error('Failed to add user access');
    }
  };

  const removeAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('process_access')
        .delete()
        .eq('process_id', processId)
        .eq('user_id', userId);

      if (error) throw error;
      setAccessUsers(prev => prev.filter(id => id !== userId));
      toast.success('User access removed');
    } catch (error) {
      console.error('Error removing access:', error);
      toast.error('Failed to remove user access');
    }
  };

  useEffect(() => {
    if (processId) {
      fetchAccess();
    }
  }, [processId]);

  return { accessUsers, loading, addAccess, removeAccess, refetch: fetchAccess };
};

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<{ userId: string; email: string; fullName: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .eq('is_active', true);

        if (error) throw error;
        setUsers(data?.map(u => ({
          userId: u.user_id,
          email: u.email,
          fullName: u.full_name,
        })) || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading };
};

export const useCandidates = (processId: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('process_id', processId)
        .order('created_at', { ascending: false });

      if (candidatesError) throw candidatesError;

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

      const mapped = candidatesData?.map(c => {
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
        };
      }) || [];

      setCandidates(mapped);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const addCandidate = async (candidateData: {
    name: string;
    email: string;
    linkedInUrl?: string;
    desiredPriceRange?: string;
    rating?: number;
    statusDescription?: string;
  }) => {
    try {
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          process_id: processId,
          name: candidateData.name,
          email: candidateData.email,
          linkedin_url: candidateData.linkedInUrl || null,
          desired_price_range: candidateData.desiredPriceRange || null,
          rating: candidateData.rating || null,
          status: 'initial',
        })
        .select()
        .single();

      if (candidateError) throw candidateError;

      if (candidateData.statusDescription) {
        await supabase
          .from('status_updates')
          .insert({
            candidate_id: candidate.id,
            status: 'initial',
            description: candidateData.statusDescription,
          });
      }

      await fetchCandidates();
      return candidate;
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
      throw error;
    }
  };

  const updateCandidateStatus = async (
    candidateId: string,
    status: CandidateStatus,
    description: string,
    decision?: CandidateDecision,
    githubTaskUrl?: string,
    updatedBy?: string
  ) => {
    try {
      // Insert status update with commenter name
      const { error: updateError } = await supabase
        .from('status_updates')
        .insert({
          candidate_id: candidateId,
          status: status,
          description,
          decision: decision as DbCandidateDecision | null,
          updated_by: updatedBy || null,
        });

      if (updateError) throw updateError;

      // Update candidate status and final decision if failed
      const updates: { status: string; final_decision?: DbCandidateDecision | null; github_task_url?: string | null } = {
        status: status,
      };
      
      if (decision === 'fail') {
        updates.final_decision = 'fail';
      }

      if (githubTaskUrl) {
        updates.github_task_url = githubTaskUrl;
      }

      const { error: candidateError } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', candidateId);

      if (candidateError) throw candidateError;

      await fetchCandidates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      throw error;
    }
  };

  useEffect(() => {
    if (processId) {
      fetchCandidates();
    }
  }, [processId]);

  return { candidates, loading, addCandidate, updateCandidateStatus, refetch: fetchCandidates };
};

export const useCandidateCount = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchCounts = async (processIds: string[]) => {
    if (processIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('process_id')
        .in('process_id', processIds);

      if (error) throw error;

      const countMap: Record<string, number> = {};
      processIds.forEach(id => countMap[id] = 0);
      data?.forEach(c => {
        countMap[c.process_id] = (countMap[c.process_id] || 0) + 1;
      });

      setCounts(countMap);
    } catch (error) {
      console.error('Error fetching candidate counts:', error);
    }
  };

  return { counts, fetchCounts };
};

export const useProcess = (processId: string) => {
  const [process, setProcess] = useState<InterviewProcess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const { data, error } = await supabase
          .from('interview_processes')
          .select('*')
          .eq('id', processId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProcess({
            id: data.id,
            position: data.position,
            role: data.role,
            startDate: data.start_date,
            endDate: data.end_date,
            createdAt: data.created_at,
            createdBy: (data as any).created_by || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching process:', error);
      } finally {
        setLoading(false);
      }
    };

    if (processId) {
      fetchProcess();
    }
  }, [processId]);

  return { process, loading };
};