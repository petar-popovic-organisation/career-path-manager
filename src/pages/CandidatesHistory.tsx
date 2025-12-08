import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/UserMenu";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { OfferStatusBadge } from "@/components/OfferStatusBadge";
import { useAllCandidates } from "@/hooks/useAllCandidates";
import { OfferStatus } from "@/types/recruitment";
import { ArrowLeft, Mail, Loader2, Star, Calendar, Search, XCircle, ExternalLink, Briefcase, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function CandidatesHistory() {
  const navigate = useNavigate();
  const { candidates, loading } = useAllCandidates();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    
    const query = searchQuery.toLowerCase();
    return candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query)
    );
  }, [candidates, searchQuery]);

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
              <h1 className="text-3xl font-bold">All Candidates</h1>
              <p className="text-muted-foreground mt-1">
                View history of all candidates across all processes
              </p>
              <Badge variant="outline" className="mt-2">
                {candidates.length} total candidates
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {searchQuery ? "No candidates found" : "No Candidates Yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try a different search term"
                  : "No candidates have been added to any process yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => {
              const isFailed = candidate.finalDecision === 'fail';
              const isPassed = candidate.finalDecision === 'pass';
              const isHighRated = candidate.rating && candidate.rating > 5;

              return (
                <Card 
                  key={candidate.id} 
                  className={`hover:shadow-md transition-shadow ${isFailed ? 'opacity-75 border-destructive/50' : ''} ${isHighRated && !isFailed ? 'border-green-500 border-2 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                >
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
                          {candidate.rating && (
                            <Badge 
                              variant={isHighRated ? "default" : "secondary"} 
                              className={`gap-1 ${isHighRated ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                            >
                              <Star className="h-3 w-3" />
                              {candidate.rating}/10
                            </Badge>
                          )}
                          {isPassed && (
                            <Badge className="gap-1 bg-green-500 hover:bg-green-600 text-white">
                              <CheckCircle className="h-3 w-3" />
                              Passed
                            </Badge>
                          )}
                          {isFailed && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                          {isPassed && candidate.offerStatus && (
                            <OfferStatusBadge status={candidate.offerStatus as OfferStatus} />
                          )}
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
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Added {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                      <CandidateStatusBadge status={candidate.status} />
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}