import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterviewProcess } from "@/types/recruitment";
import { format } from "date-fns";

interface EditProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: InterviewProcess;
  onUpdateProcess: (data: { position: string; role: string; startDate: string; endDate: string }) => Promise<void>;
}

export function EditProcessDialog({ open, onOpenChange, process, onUpdateProcess }: EditProcessDialogProps) {
  const [position, setPosition] = useState(process.position);
  const [role, setRole] = useState(process.role);
  const [startDate, setStartDate] = useState(process.startDate);
  const [endDate, setEndDate] = useState(process.endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPosition(process.position);
      setRole(process.role);
      setStartDate(process.startDate);
      setEndDate(process.endDate);
    }
  }, [open, process]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!position.trim() || !role.trim() || !startDate || !endDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateProcess({ position, role, startDate, endDate });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Interview Process</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g., Senior Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role/Team</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Frontend Team"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}