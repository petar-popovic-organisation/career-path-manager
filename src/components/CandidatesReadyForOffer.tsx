import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

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

interface CandidatesReadyForOfferProps {
  candidates: CandidateForOffer[];
  loading: boolean;
}

export const CandidatesReadyForOffer = ({ candidates, loading }: CandidatesReadyForOfferProps) => {
  const navigate = useNavigate();

  const pendingOffers = candidates.filter(c => c.offerStatus === 'pending' || c.offerStatus === 'sent');

  if (loading) {
    return null;
  }

  if (pendingOffers.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          <CardTitle className="text-green-800 dark:text-green-200">Candidates Ready for Offer</CardTitle>
        </div>
        <CardDescription>
          These candidates have passed all interviews and are awaiting offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingOffers.map((candidate) => (
            <div 
              key={candidate.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{candidate.name}</span>
                  <Badge variant={candidate.offerStatus === 'sent' ? 'default' : 'secondary'}>
                    {candidate.offerStatus === 'sent' ? 'Offer Sent' : 'Pending Offer'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {candidate.processPosition} - {candidate.processRole}
                </p>
                {candidate.finalDecisionDate && (
                  <p className="text-xs text-muted-foreground">
                    Passed on {format(new Date(candidate.finalDecisionDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/process/${candidate.processId}/candidate/${candidate.id}`)}
              >
                Manage Offer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};