import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProcessCard } from "@/components/ProcessCard";
import { CreateProcessDialog } from "@/components/CreateProcessDialog";
import { InterviewProcess, Candidate } from "@/types/recruitment";
import { Plus, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<InterviewProcess[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProcess = (processData: Omit<InterviewProcess, 'id' | 'createdAt'>) => {
    const newProcess: InterviewProcess = {
      ...processData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProcesses([...processes, newProcess]);
  };

  const getCandidateCount = (processId: string) => {
    return candidates.filter(c => c.processId === processId).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Career Path Manager</h1>
                <p className="text-sm text-muted-foreground">Recruitment & Selection System</p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Process
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {processes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">No Interview Processes Yet</h2>
            <p className="mb-6 text-muted-foreground max-w-md">
              Get started by creating your first interview process. Define positions, roles, and manage candidates through each stage.
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create First Process
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Active Processes</h2>
              <p className="text-muted-foreground">Manage your recruitment pipelines</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processes.map((process) => (
                <ProcessCard
                  key={process.id}
                  process={process}
                  candidateCount={getCandidateCount(process.id)}
                  onViewDetails={() => navigate(`/process/${process.id}`, { 
                    state: { process, candidates: candidates.filter(c => c.processId === process.id) } 
                  })}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <CreateProcessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateProcess={handleCreateProcess}
      />
    </div>
  );
}
