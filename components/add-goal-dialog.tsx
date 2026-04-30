"use client";

import * as React from "react";
import { useFinanceStore } from "@/lib/store";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function AddGoalDialog({ children }: { children?: React.ReactNode }) {
  const { setGoals, goals } = useFinanceStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [saved, setSaved] = React.useState("");
  const [deadline, setDeadline] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !saved) return;

    const newGoal = {
      id: crypto.randomUUID(),
      name,
      target: parseFloat(target),
      saved: parseFloat(saved),
      deadline: deadline || undefined
    };

    setGoals([...goals, newGoal]);
    setOpen(false);
    // Reset
    setName("");
    setTarget("");
    setSaved("");
    setDeadline("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Goal Name</label>
            <Input 
              placeholder="Dream House, New Car..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Target Amount</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-secondary/50 border-border/50 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Already Saved</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                className="bg-secondary/50 border-border/50 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Target Deadline (Optional)</label>
            <Input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-purple-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-purple-600/20">
              Set Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
