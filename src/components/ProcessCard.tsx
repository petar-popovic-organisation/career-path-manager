import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewProcess } from "@/types/recruitment";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface ProcessCardProps {
  process: InterviewProcess;
  candidateCount: number;
  onViewDetails: () => void;
}

export const ProcessCard = ({ process, candidateCount, onViewDetails }: ProcessCardProps) => {
  const isActive = new Date(process.endDate) >= new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{process.position}</CardTitle>
            <CardDescription className="text-base">{process.role}</CardDescription>
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          >
            {isActive ? "Active" : "Closed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(process.startDate), 'MMM dd')} - {format(new Date(process.endDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{candidateCount} candidates</span>
          </div>
        </div>
        <Button onClick={onViewDetails} className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
