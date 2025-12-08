import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMenu } from "@/components/UserMenu";
import { OfferStatusBadge } from "@/components/OfferStatusBadge";
import { useOfferHistory } from "@/hooks/useOfferHistory";
import { ArrowLeft, Mail, Loader2, Calendar, Search, ExternalLink, Briefcase, Gift } from "lucide-react";
import { format } from "date-fns";
import { OfferStatus } from "@/types/recruitment";

type FilterOption = 'all' | 'pending' | 'sent' | 'accepted' | 'rejected';

export default function OfferHistory() {
  const navigate = useNavigate();
  const { candidates, loading } = useOfferHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.offerStatus === filterStatus);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.processPosition.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [candidates, searchQuery, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      all: candidates.length,
      pending: candidates.filter(c => c.offerStatus === 'pending').length,
      sent: candidates.filter(c => c.offerStatus === 'sent').length,
      accepted: candidates.filter(c => c.offerStatus === 'accepted').length,
      rejected: candidates.filter(c => c.offerStatus === 'rejected').length,
    };
  }, [candidates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <Gift className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Offer History</h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Track all candidate offers and their outcomes
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="outline">{statusCounts.all} total</Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">{statusCounts.pending} pending</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">{statusCounts.sent} sent</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">{statusCounts.accepted} accepted</Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">{statusCounts.rejected} rejected</Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offers ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="sent">Sent ({statusCounts.sent})</SelectItem>
              <SelectItem value="accepted">Accepted ({statusCounts.accepted})</SelectItem>
              <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Gift className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {searchQuery || filterStatus !== 'all' ? "No offers found" : "No Offers Yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? "Try adjusting your search or filter"
                  : "Candidates who pass the final decision will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xl font-semibold"
                          onClick={() => navigate(`/process/${candidate.processId}/candidate/${candidate.id}`)}
                        >
                          {candidate.name}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                        <OfferStatusBadge status={candidate.offerStatus as OfferStatus} />
                      </div>
                      <div className="space-y-1">
                        <CardDescription className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {candidate.email}
                        </CardDescription>
                        <CardDescription className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                            onClick={() => navigate(`/process/${candidate.processId}`)}
                          >
                            {candidate.processPosition} - {candidate.processRole}
                          </Button>
                        </CardDescription>
                        {candidate.finalDecisionDate && (
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Passed: {format(new Date(candidate.finalDecisionDate), 'MMM dd, yyyy')}
                          </CardDescription>
                        )}
                        {candidate.offerDecisionDate && (
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Decision: {format(new Date(candidate.offerDecisionDate), 'MMM dd, yyyy')}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {(candidate.offerStatus === 'accepted' || candidate.offerStatus === 'rejected') && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-4">
                      {candidate.offerStatus === 'accepted' && (
                        <>
                          {candidate.offerStartDate && (
                            <p className="text-sm">
                              <strong>Start Date:</strong> {format(new Date(candidate.offerStartDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                          {candidate.offerDescription && (
                            <p className="text-sm mt-1 text-muted-foreground">{candidate.offerDescription}</p>
                          )}
                        </>
                      )}
                      {candidate.offerStatus === 'rejected' && candidate.offerRejectionReason && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {candidate.offerRejectionReason}
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
