import { Badge } from "@/components/ui/badge";
import { OfferStatus } from "@/types/recruitment";
import { Gift, Send, CheckCircle, XCircle } from "lucide-react";

interface OfferStatusBadgeProps {
  status: OfferStatus;
}

const statusConfig: Record<OfferStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode; className?: string }> = {
  pending: { label: "Pending Offer", variant: "outline", icon: <Gift className="h-3 w-3" /> },
  sent: { label: "Offer Sent", variant: "secondary", icon: <Send className="h-3 w-3" /> },
  accepted: { label: "Accepted", variant: "default", icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-500 hover:bg-green-600 text-white" },
  rejected: { label: "Rejected", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

export const OfferStatusBadge = ({ status }: OfferStatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, variant: "default" as const, icon: null };
  
  return (
    <Badge variant={config.variant} className={`gap-1 whitespace-nowrap ${config.className || ''}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
