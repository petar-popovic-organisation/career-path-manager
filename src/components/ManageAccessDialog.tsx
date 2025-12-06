import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users } from "lucide-react";
import { useProcessAccess, useAvailableUsers } from "@/hooks/useRecruitmentData";
import { useAuthContext } from "@/contexts/AuthContext";

interface ManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processId: string;
}

export function ManageAccessDialog({ open, onOpenChange, processId }: ManageAccessDialogProps) {
  const { profile } = useAuthContext();
  const { accessUsers, loading: accessLoading, addAccess, removeAccess } = useProcessAccess(processId);
  const { users, loading: usersLoading } = useAvailableUsers();
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  // Filter out current user from the list
  const otherUsers = users.filter(u => u.userId !== profile?.userId);

  useEffect(() => {
    if (open) {
      setPendingChanges({});
    }
  }, [open]);

  const isUserSelected = (userId: string) => {
    if (pendingChanges[userId] !== undefined) {
      return pendingChanges[userId];
    }
    return accessUsers.includes(userId);
  };

  const handleToggleUser = (userId: string) => {
    const currentlyHasAccess = accessUsers.includes(userId);
    const pendingState = pendingChanges[userId];
    
    if (pendingState !== undefined) {
      // If there's a pending change, toggle it
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } else {
      // Set the opposite of current state
      setPendingChanges(prev => ({
        ...prev,
        [userId]: !currentlyHasAccess
      }));
    }
  };

  const handleSave = async () => {
    for (const [userId, shouldHaveAccess] of Object.entries(pendingChanges)) {
      const currentlyHasAccess = accessUsers.includes(userId);
      if (shouldHaveAccess && !currentlyHasAccess) {
        await addAccess(userId);
      } else if (!shouldHaveAccess && currentlyHasAccess) {
        await removeAccess(userId);
      }
    }
    setPendingChanges({});
    onOpenChange(false);
  };

  const loading = accessLoading || usersLoading;
  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Process Access
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select users who can view this interview process:
            </p>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {otherUsers.map((user) => (
                  <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={user.userId}
                      checked={isUserSelected(user.userId)}
                      onCheckedChange={() => handleToggleUser(user.userId)}
                    />
                    <Label htmlFor={user.userId} className="flex-1 cursor-pointer">
                      <div className="font-medium">{user.fullName || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </Label>
                  </div>
                ))}
                {otherUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No other users available
                  </p>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}