import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterviewProcess } from "@/types/recruitment";
import { toast } from "sonner";

interface CreateProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProcess: (process: Omit<InterviewProcess, 'id' | 'createdAt'>) => void;
}

export const CreateProcessDialog = ({ open, onOpenChange, onCreateProcess }: CreateProcessDialogProps) => {
  const [formData, setFormData] = useState({
    position: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.role || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    onCreateProcess(formData);
    setFormData({ position: "", role: "", startDate: "", endDate: "" });
    onOpenChange(false);
    toast.success("Interview process created successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Interview Process</DialogTitle>
          <DialogDescription>
            Define a new selection process for candidates
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              placeholder="e.g., Senior Software Engineer"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role/Department</Label>
            <Input
              id="role"
              placeholder="e.g., Engineering"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Process</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
