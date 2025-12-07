import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "@/components/CandidateTimeline";
import { UserMenu } from "@/components/UserMenu";
import { useProcess, useCandidates } from "@/hooks/useRecruitmentData";
import { useAuthContext } from "@/contexts/AuthContext";
import { canManageCandidates, isViewOnly, isHrOffice } from "@/types/auth";
import { ArrowLeft, Mail, Linkedin, DollarSign, XCircle, Loader2, Star, Calendar, Github, Gift, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { UpdateStatusDialog } from "@/components/UpdateStatusDialog";
import { OfferManagementDialog } from "@/components/OfferManagementDialog";
import { CandidateStatus, CandidateDecision, OfferStatus } from "@/types/recruitment";

export default function CandidateDetails() {
  const { processId, candidateId } = useParams();
  const navigate = useNavigate();
  const { role, profile } = useAuthContext();
  
  const { process, loading: processLoading } = useProcess(processId!);
  const { candidates, loading: candidatesLoading, updateCandidateStatus, updateOfferStatus } = useCandidates(processId!);
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const candidate = candidates.find(c => c.id === candidateId);
  const canManage = canManageCandidates(role);
  const viewOnly = isViewOnly(role);
  const loading = processLoading || candidatesLoading;
  const isProcessActive = process ? new Date(process.endDate) >= new Date() : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!process || !candidate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Candidate not found</h2>
        <Button onClick={() => navigate(`/process/${processId}`)}>Back to Process</Button>
      </div>
    );
  }

  const handleUpdateStatus = async (status: CandidateStatus, description: string, decision?: CandidateDecision, githubTaskUrl?: string) => {
    const commenterName = profile?.fullName || profile?.email || 'Unknown';
    await updateCandidateStatus(candidateId!, status, description, decision, githubTaskUrl, commenterName, process?.position, process?.role);
  };

  const handleSendOffer = async () => {
    await updateOfferStatus(candidateId!, 'sent');
  };

  const handleUpdateOffer = async (decision: 'accepted' | 'rejected', description: string, startDate?: string) => {
    if (decision === 'accepted') {
      await updateOfferStatus(candidateId!, 'accepted', description, startDate);
    } else {
      await updateOfferStatus(candidateId!, 'rejected', undefined, undefined, description);
    }
  };

  const isFailed = candidate.finalDecision === 'fail';
  const isPassed = candidate.finalDecision === 'pass';
  const isHighRated = candidate.rating && candidate.rating > 5;
  const canManageOffer = isHrOffice(role) && isPassed && (candidate.offerStatus === 'pending' || candidate.offerStatus === 'sent');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate(`/process/${processId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {process.position}
            </Button>
            <UserMenu />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{candidate.name}</h1>
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
                {isPassed && (
                  <Badge className="gap-1 bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3" />
                    Passed
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{process.position} - {process.role}</p>
              {viewOnly && (
                <Badge variant="secondary" className="mt-2">View Only</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <CandidateStatusBadge status={candidate.status} />
              {canManageOffer && (
                <Button onClick={() => setOfferDialogOpen(true)} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Gift className="mr-2 h-4 w-4" />
                  Manage Offer
                </Button>
              )}
              {!isFailed && !isPassed && isProcessActive && canManage && (
                <Button onClick={() => setUpdateDialogOpen(true)} size="lg">
                  Add Comment
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Candidate Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${candidate.email}`} className="hover:underline text-primary">
                  {candidate.email}
                </a>
              </div>
              {candidate.linkedInUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={candidate.linkedInUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {candidate.desiredPriceRange && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.desiredPriceRange}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Added {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              {candidate.githubTaskUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={candidate.githubTaskUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    Task Repository
                  </a>
                </div>
              )}
              {candidate.finalDecisionDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Final Decision: {format(new Date(candidate.finalDecisionDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {candidate.offerStatus && candidate.offerStatus !== 'pending' && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Offer Status</h4>
                  <Badge variant={candidate.offerStatus === 'accepted' ? 'default' : candidate.offerStatus === 'rejected' ? 'destructive' : 'secondary'}>
                    {candidate.offerStatus.charAt(0).toUpperCase() + candidate.offerStatus.slice(1)}
                  </Badge>
                  {candidate.offerDecisionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Decided: {format(new Date(candidate.offerDecisionDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                  {candidate.offerStatus === 'accepted' && candidate.offerStartDate && (
                    <p className="text-sm mt-2">
                      <strong>Start Date:</strong> {format(new Date(candidate.offerStartDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                  {candidate.offerStatus === 'accepted' && candidate.offerDescription && (
                    <p className="text-sm mt-1 text-muted-foreground">{candidate.offerDescription}</p>
                  )}
                  {candidate.offerStatus === 'rejected' && candidate.offerRejectionReason && (
                    <p className="text-sm mt-1 text-muted-foreground"><strong>Reason:</strong> {candidate.offerRejectionReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Interview Timeline</CardTitle>
              <CardDescription>
                {candidate.statusHistory.length} comments and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateTimeline history={candidate.statusHistory} />
            </CardContent>
          </Card>
        </div>
      </main>

      {canManage && (
        <UpdateStatusDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          currentStatus={candidate.status}
          onUpdateStatus={handleUpdateStatus}
          candidateName={candidate.name}
        />
      )}

      {canManageOffer && (
        <OfferManagementDialog
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          candidateName={candidate.name}
          currentOfferStatus={candidate.offerStatus || 'pending'}
          onUpdateOffer={handleUpdateOffer}
          onSendOffer={handleSendOffer}
        />
      )}
    </div>
  );
}