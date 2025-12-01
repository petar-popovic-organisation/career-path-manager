import { Badge } from "@/components/ui/badge";
import { CandidateStatus } from "@/types/recruitment";

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
}

const statusConfig: Record<CandidateStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  initial: { label: "Initial", variant: "outline" },
  hr_thoughts: { label: "HR Thoughts", variant: "default" },
  technical_first: { label: "Technical Round 1", variant: "default" },
  technical_second: { label: "Technical Round 2", variant: "default" },
  final_decision: { label: "Final Decision", variant: "default" },
};

export const CandidateStatusBadge = ({ status }: CandidateStatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, variant: "default" as const };
  
  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
};
