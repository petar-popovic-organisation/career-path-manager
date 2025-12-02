import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddCandidateDialog } from "@/components/AddCandidateDialog";
import { UpdateStatusDialog } from "@/components/UpdateStatusDialog";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "@/components/CandidateTimeline";
import { UserMenu } from "@/components/UserMenu";
import { Candidate, CandidateStatus, CandidateDecision } from "@/types/recruitment";
import { ArrowLeft, Plus, Mail, ChevronDown, MessageSquare, Linkedin, DollarSign, XCircle, Loader2, Star, Calendar, ArrowUpDown, Github } from "lucide-react";
import { format } from "date-fns";
import { useProcess, useCandidates } from "@/hooks/useRecruitmentData";
import { useAuthContext } from "@/contexts/AuthContext";
import { canManageCandidates, isViewOnly } from "@/types/auth";

type SortOption = 'latest' | 'oldest' | 'rating_high' | 'rating_low' | 'status';

const STATUS_ORDER: Record<CandidateStatus, number> = {
  'initial': 1,
  'hr_thoughts': 2,
  'technical_first': 3,
  'technical_second': 4,
  'final_decision': 5,
};

export default function ProcessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthContext();
  
  const { process, loading: processLoading } = useProcess(id!);
  const { candidates, loading: candidatesLoading, addCandidate, updateCandidateStatus } = useCandidates(id!);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const canManage = canManageCandidates(role);
  const viewOnly = isViewOnly(role);

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating_high':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating_low':
          return (a.rating || 0) - (b.rating || 0);
        case 'status':
          return STATUS_ORDER[b.status] - STATUS_ORDER[a.status];
        default:
          return 0;
      }
    });
  }, [candidates, sortBy]);
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
    rating?: number;
    statusDescription?: string;
  }) => {
    await addCandidate(candidateData);
  };

  const handleUpdateStatus = async (candidateId: string, status: CandidateStatus, description: string, decision?: CandidateDecision, githubTaskUrl?: string) => {
    await updateCandidateStatus(candidateId, status, description, decision, githubTaskUrl);
  };

  const openUpdateDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setUpdateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <UserMenu />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{process.position}</h1>
              <p className="text-lg text-muted-foreground">{process.role}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{format(new Date(process.startDate), 'MMM dd')} - {format(new Date(process.endDate), 'MMM dd, yyyy')}</span>
                <Badge variant="outline">{candidates.length} candidates</Badge>
                {viewOnly && (
                  <Badge variant="secondary">View Only</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={isProcessActive ? "default" : "secondary"}
                className={isProcessActive ? "bg-green-500 hover:bg-green-600 text-white" : ""}
              >
                {isProcessActive ? "Active" : "Closed"}
              </Badge>
              {isProcessActive && canManage && (
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
                {canManage 
                  ? "Start adding candidates to this selection process"
                  : "No candidates have been added to this process yet"}
              </p>
              {isProcessActive && canManage && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Candidate
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rating_high">Rating (High to Low)</SelectItem>
                  <SelectItem value="rating_low">Rating (Low to High)</SelectItem>
                  <SelectItem value="status">Status Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sortedCandidates.map((candidate) => {
              const isFailed = candidate.finalDecision === 'fail';
              const isHighRated = candidate.rating && candidate.rating > 5;
              
              return (
                <Card key={candidate.id} className={`hover:shadow-md transition-shadow ${isFailed ? 'opacity-75 border-destructive/50' : ''} ${isHighRated && !isFailed ? 'border-green-500 border-2 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{candidate.name}</CardTitle>
                          {candidate.rating && (
                            <Badge variant={isHighRated ? "default" : "secondary"} className={`gap-1 ${isHighRated ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}>
                              <Star className="h-3 w-3" />
                              {candidate.rating}/10
                            </Badge>
                          )}
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
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Added {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}
                          </CardDescription>
                          {candidate.githubTaskUrl && (
                            <CardDescription className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              <a 
                                href={candidate.githubTaskUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline text-primary"
                              >
                                Task Repository
                              </a>
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
                        {!isFailed && isProcessActive && canManage && (
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

      {canManage && (
        <AddCandidateDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAddCandidate={handleAddCandidate}
          processId={id!}
        />
      )}

      {selectedCandidate && canManage && (
        <UpdateStatusDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          currentStatus={selectedCandidate.status}
          onUpdateStatus={(status, description, decision, githubTaskUrl) => handleUpdateStatus(selectedCandidate.id, status, description, decision, githubTaskUrl)}
          candidateName={selectedCandidate.name}
        />
      )}
    </div>
  );
}
