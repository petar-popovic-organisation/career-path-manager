import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CandidateStatus, CandidateDecision } from "@/types/recruitment";
import { useToast } from "@/hooks/use-toast";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: CandidateStatus;
  onUpdateStatus: (status: CandidateStatus, description: string, decision?: CandidateDecision) => void;
  candidateName: string;
}

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: 'hr_started', label: 'HR Started' },
  { value: 'technical_first', label: 'Technical Round 1' },
  { value: 'technical_second', label: 'Technical Round 2' },
  { value: 'final_decision', label: 'Final Decision' },
];

export const UpdateStatusDialog = ({ 
  open, 
  onOpenChange, 
  currentStatus, 
  onUpdateStatus,
  candidateName 
}: UpdateStatusDialogProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<CandidateStatus>(currentStatus);
  const [description, setDescription] = useState("");
  const [decision, setDecision] = useState<CandidateDecision>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please add a description for this status update",
        variant: "destructive",
      });
      return;
    }

    onUpdateStatus(status, description, decision);
    setDescription("");
    setDecision(null);
    onOpenChange(false);
    toast({
      title: "Success",
      description: "Status updated successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Candidate Status</DialogTitle>
          <DialogDescription>
            Update the interview status for {candidateName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as CandidateStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this status update..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-3">
            <Label>Decision (Optional)</Label>
            <RadioGroup value={decision || "none"} onValueChange={(value) => setDecision(value === "none" ? null : value as CandidateDecision)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="font-normal cursor-pointer">No decision yet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pass" id="pass" />
                <Label htmlFor="pass" className="font-normal cursor-pointer">Pass - Proceed to next stage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fail" id="fail" />
                <Label htmlFor="fail" className="font-normal cursor-pointer">Fail - End recruitment process</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
