import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type OfferDecision = 'accepted' | 'rejected';

interface OfferManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  currentOfferStatus: string;
  onUpdateOffer: (decision: OfferDecision, description: string, startDate?: string) => Promise<void>;
  onSendOffer: () => Promise<void>;
}

export const OfferManagementDialog = ({ 
  open, 
  onOpenChange, 
  candidateName,
  currentOfferStatus,
  onUpdateOffer,
  onSendOffer
}: OfferManagementDialogProps) => {
  const { toast } = useToast();
  const [decision, setDecision] = useState<OfferDecision | null>(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOffer = async () => {
    setLoading(true);
    try {
      await onSendOffer();
      toast({
        title: "Success",
        description: "Offer marked as sent",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send offer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      toast({
        title: "Error",
        description: "Please select a decision",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: decision === 'accepted' 
          ? "Please add a description for the accepted offer" 
          : "Please add a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    if (decision === 'accepted' && !startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onUpdateOffer(decision, description, decision === 'accepted' ? startDate : undefined);
      toast({
        title: "Success",
        description: `Offer ${decision} recorded successfully`,
      });
      onOpenChange(false);
      setDecision(null);
      setDescription("");
      setStartDate("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPending = currentOfferStatus === 'pending';
  const isSent = currentOfferStatus === 'sent';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Offer - {candidateName}</DialogTitle>
          <DialogDescription>
            {isPending 
              ? "This candidate has passed all interviews. Send an offer to proceed."
              : isSent 
                ? "Record the candidate's decision on the offer."
                : `Offer status: ${currentOfferStatus}`
            }
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click below to mark the offer as sent to the candidate.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendOffer} disabled={loading}>
                {loading ? "Sending..." : "Mark Offer as Sent"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {isSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Candidate's Decision</Label>
              <RadioGroup value={decision || ""} onValueChange={(value) => setDecision(value as OfferDecision)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="accepted" id="accepted" />
                  <Label htmlFor="accepted" className="font-normal cursor-pointer">
                    Accepted - Candidate accepted the offer
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected" className="font-normal cursor-pointer">
                    Rejected - Candidate declined the offer
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {decision === 'accepted' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Offer Details</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about the accepted offer (salary, benefits, etc.)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}

            {decision === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="description">Rejection Reason</Label>
                <Textarea
                  id="description"
                  placeholder="Add the reason for rejection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !decision}>
                {loading ? "Saving..." : "Save Decision"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!isPending && !isSent && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This offer has already been {currentOfferStatus}. No further actions available.
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};