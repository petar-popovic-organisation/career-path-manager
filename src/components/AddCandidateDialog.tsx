import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCandidate: (candidate: {
    name: string;
    email: string;
    linkedInUrl?: string;
    desiredPriceRange?: string;
    statusDescription?: string;
  }) => Promise<void>;
  processId: string;
}

export const AddCandidateDialog = ({ open, onOpenChange, onAddCandidate }: AddCandidateDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedInUrl: "",
    desiredPriceRange: "",
    statusDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Please fill in candidate name and email");
      return;
    }

    setSubmitting(true);
    try {
      await onAddCandidate({
        name: formData.name,
        email: formData.email,
        linkedInUrl: formData.linkedInUrl || undefined,
        desiredPriceRange: formData.desiredPriceRange || undefined,
        statusDescription: formData.statusDescription || undefined,
      });
      
      setFormData({ name: "", email: "", linkedInUrl: "", desiredPriceRange: "", statusDescription: "" });
      onOpenChange(false);
      toast.success("Candidate added successfully");
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
          <DialogDescription>
            Manually add a new candidate to this selection process
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Candidate Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="candidate@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn URL (Optional)</Label>
            <Input
              id="linkedInUrl"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedInUrl}
              onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desiredPriceRange">Desired Salary Range (Optional)</Label>
            <Input
              id="desiredPriceRange"
              placeholder="e.g., $80,000 - $100,000"
              value={formData.desiredPriceRange}
              onChange={(e) => setFormData({ ...formData, desiredPriceRange: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Initial Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any initial notes about the candidate..."
              value={formData.statusDescription}
              onChange={(e) => setFormData({ ...formData, statusDescription: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
