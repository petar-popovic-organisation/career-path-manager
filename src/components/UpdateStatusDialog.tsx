import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateStatus } from "@/types/recruitment";
import { toast } from "sonner";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: CandidateStatus;
  onUpdateStatus: (status: CandidateStatus, description: string) => void;
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
  const [status, setStatus] = useState<CandidateStatus>(currentStatus);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please add a description for this status update");
      return;
    }

    onUpdateStatus(status, description);
    setDescription("");
    onOpenChange(false);
    toast.success("Status updated successfully");
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
