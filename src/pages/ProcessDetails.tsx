import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddCandidateDialog } from "@/components/AddCandidateDialog";
import { UpdateStatusDialog } from "@/components/UpdateStatusDialog";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "@/components/CandidateTimeline";
import { Candidate, CandidateStatus, CandidateDecision } from "@/types/recruitment";
import { ArrowLeft, Plus, Mail, ChevronDown, MessageSquare, Linkedin, DollarSign, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useProcess, useCandidates } from "@/hooks/useRecruitmentData";

export default function ProcessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { process, loading: processLoading } = useProcess(id!);
  const { candidates, loading: candidatesLoading, addCandidate, updateCandidateStatus } = useCandidates(id!);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const loading = processLoading || candidatesLoading;
  const isProcessActive = process ? new Date(process.endDate) >= new Date() : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Process not found</h2>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleAddCandidate = async (candidateData: {
    name: string;
    email: string;
    linkedInUrl?: string;
    desiredPriceRange?: string;
    statusDescription?: string;
  }) => {
    await addCandidate(candidateData);
  };

  const handleUpdateStatus = async (candidateId: string, status: CandidateStatus, description: string, decision?: CandidateDecision) => {
    await updateCandidateStatus(candidateId, status, description, decision);
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
            <div className="flex items-center gap-3">
              <Badge 
                variant={isProcessActive ? "default" : "secondary"}
                className={isProcessActive ? "bg-green-500 hover:bg-green-600 text-white" : ""}
              >
                {isProcessActive ? "Active" : "Closed"}
              </Badge>
              {isProcessActive && (
                <Button onClick={() => setAddDialogOpen(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              )}
            </div>
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
              {isProcessActive && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Candidate
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => {
              const isFailed = candidate.finalDecision === 'fail';
              
              return (
                <Card key={candidate.id} className={`hover:shadow-md transition-shadow ${isFailed ? 'opacity-75 border-destructive/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{candidate.name}</CardTitle>
                          {isFailed && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <CardDescription className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                          </CardDescription>
                          {candidate.linkedInUrl && (
                            <CardDescription className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              <a 
                                href={candidate.linkedInUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline text-primary"
                              >
                                LinkedIn Profile
                              </a>
                            </CardDescription>
                          )}
                          {candidate.desiredPriceRange && (
                            <CardDescription className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              {candidate.desiredPriceRange}
                            </CardDescription>
                          )}
                        </div>
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
                        {!isFailed && isProcessActive && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdateDialog(candidate)}
                          >
                            Add Comment
                          </Button>
                        )}
                      </div>
                      <CollapsibleContent className="pt-4">
                        <CandidateTimeline history={candidate.statusHistory} />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              );
            })}
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
          onUpdateStatus={(status, description, decision) => handleUpdateStatus(selectedCandidate.id, status, description, decision)}
          candidateName={selectedCandidate.name}
        />
      )}
    </div>
  );
}
