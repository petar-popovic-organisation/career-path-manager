import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InterviewProcess } from "@/types/recruitment";
import { toast } from "sonner";
import { useAvailableUsers } from "@/hooks/useRecruitmentData";
import { useAuthContext } from "@/contexts/AuthContext";

interface CreateProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProcess: (process: Omit<InterviewProcess, 'id' | 'createdAt'>, accessUserIds?: string[]) => Promise<void>;
}

export const CreateProcessDialog = ({ open, onOpenChange, onCreateProcess }: CreateProcessDialogProps) => {
  const { user } = useAuthContext();
  const { users, loading: usersLoading } = useAvailableUsers();
  const [formData, setFormData] = useState({
    position: "",
    role: "",
    startDate: "",
    endDate: "",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter out current user from the list (they're the creator, always have access)
  const availableUsers = users.filter(u => u.userId !== user?.id);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.role || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setSubmitting(true);
    try {
      await onCreateProcess(formData, selectedUsers);
      setFormData({ position: "", role: "", startDate: "", endDate: "" });
      setSelectedUsers([]);
      onOpenChange(false);
      toast.success("Interview process created successfully");
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({ position: "", role: "", startDate: "", endDate: "" });
      setSelectedUsers([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Interview Process</DialogTitle>
          <DialogDescription>
            Define a new selection process and assign users who can access it
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
          
          <div className="space-y-2">
            <Label>Grant Access To Users</Label>
            <p className="text-sm text-muted-foreground">
              Select users who can view this process and add candidates (Team Leads)
            </p>
            <ScrollArea className="h-[150px] rounded-md border p-3">
              {usersLoading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No other users available</p>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((u) => (
                    <div key={u.userId} className="flex items-center space-x-2">
                      <Checkbox
                        id={u.userId}
                        checked={selectedUsers.includes(u.userId)}
                        onCheckedChange={() => handleUserToggle(u.userId)}
                      />
                      <label
                        htmlFor={u.userId}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {u.fullName || u.email}
                        {u.fullName && <span className="text-muted-foreground ml-2">({u.email})</span>}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Process"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};