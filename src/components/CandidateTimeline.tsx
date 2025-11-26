import { StatusUpdate } from "@/types/recruitment";
import { Card, CardContent } from "@/components/ui/card";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface CandidateTimelineProps {
  history: StatusUpdate[];
}

export const CandidateTimeline = ({ history }: CandidateTimelineProps) => {
  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No comments or updates yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((update, index) => (
        <div key={update.id} className="relative">
          {index !== history.length - 1 && (
            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
          )}
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Card className="flex-1">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <CandidateStatusBadge status={update.status} />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {update.description && (
                  <p className="text-sm mt-2 text-foreground whitespace-pre-wrap">
                    {update.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};
