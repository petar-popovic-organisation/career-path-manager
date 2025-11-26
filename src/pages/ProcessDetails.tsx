import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddCandidateDialog } from "@/components/AddCandidateDialog";
import { UpdateStatusDialog } from "@/components/UpdateStatusDialog";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "@/components/CandidateTimeline";
import { InterviewProcess, Candidate, CandidateStatus } from "@/types/recruitment";
import { ArrowLeft, Plus, Mail, ChevronDown, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function ProcessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [process, setProcess] = useState<InterviewProcess | null>(location.state?.process || null);
  const [candidates, setCandidates] = useState<Candidate[]>(location.state?.candidates || []);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!process) {
      navigate('/');
    }
  }, [process, navigate]);

  if (!process) return null;

  const handleAddCandidate = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCandidates([...candidates, newCandidate]);
  };

  const handleUpdateStatus = (candidateId: string, status: CandidateStatus, description: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        const newUpdate = {
          id: crypto.randomUUID(),
          status,
          description,
          timestamp: new Date().toISOString(),
        };
        return {
          ...c,
          status,
          statusHistory: [...c.statusHistory, newUpdate],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));
  };

  const openUpdateDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setUpdateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{process.position}</h1>
              <p className="text-lg text-muted-foreground">{process.role}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{format(new Date(process.startDate), 'MMM dd')} - {format(new Date(process.endDate), 'MMM dd, yyyy')}</span>
                <Badge variant="outline">{candidates.length} candidates</Badge>
              </div>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No Candidates Yet</h3>
              <p className="mb-4 text-muted-foreground">
                Start adding candidates to this selection process
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Candidate
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{candidate.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {candidate.email}
                      </CardDescription>
                    </div>
                    <CandidateStatusBadge status={candidate.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Collapsible>
                    <div className="flex items-center justify-between mb-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Interview History ({candidate.statusHistory.length} updates)
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openUpdateDialog(candidate)}
                      >
                        Add Comment
                      </Button>
                    </div>
                    <CollapsibleContent className="pt-4">
                      <CandidateTimeline history={candidate.statusHistory} />
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AddCandidateDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddCandidate={handleAddCandidate}
        processId={id!}
      />

      {selectedCandidate && (
        <UpdateStatusDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          currentStatus={selectedCandidate.status}
          onUpdateStatus={(status, description) => handleUpdateStatus(selectedCandidate.id, status, description)}
          candidateName={selectedCandidate.name}
        />
      )}
    </div>
  );
}
