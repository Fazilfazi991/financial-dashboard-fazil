"use client";

import { useFinanceStore, Goal } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Target, Trophy, Clock, Edit2, Check, X, Tag, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AddGoalDialog } from "@/components/add-goal-dialog";
import { Input } from "@/components/ui/input";

export default function GoalsPage() {
  const { goals, updateGoal, deleteGoal } = useFinanceStore();
  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setEditValue(goal.target === 0 ? (goal.manualProgress || 0) : goal.saved);
  };

  const saveEdit = (goal: Goal) => {
    if (goal.target === 0) {
      updateGoal(goal.id, { manualProgress: editValue });
    } else {
      updateGoal(goal.id, { saved: editValue });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Goals & Dreams</h1>
          <p className="text-muted-foreground mt-1">Track what you&apos;re working toward.</p>
        </div>
        <AddGoalDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const isMilestone = goal.target === 0;
          const progress = isMilestone ? (goal.manualProgress || 0) : (goal.saved / goal.target) * 100;
          const isCompleted = progress >= 100;
          const isEditing = editingId === goal.id;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-[2.5rem] relative group border border-white/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  isCompleted ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-500"
                )}>
                  {isCompleted ? <Trophy className="w-7 h-7" /> : <Target className="w-7 h-7" />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {goal.deadline && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    <button 
                      onClick={() => { if(confirm('Delete this goal?')) deleteGoal(goal.id) }}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                    >
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                  {goal.category && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 rounded-full text-[10px] font-bold text-purple-400 uppercase">
                      <Tag className="w-3 h-3" />
                      {goal.category}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-bold">{goal.name}</h3>
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                )}
              </div>

              <div className="flex items-baseline justify-between mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tabular tracking-tighter">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">complete</span>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => startEditing(goal)}
                    className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(goal)} className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Visual */}
              <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden mb-8">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    isCompleted ? "bg-primary" : "bg-purple-500"
                  )}
                />
              </div>

              <div className="flex justify-between items-end gap-4">
                <div className="space-y-2 flex-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isMilestone ? "Manual Progress" : "Saved So Far"}
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                      className="h-10 bg-secondary/50 border-primary/20 rounded-xl font-bold"
                      autoFocus
                    />
                  ) : (
                    <div className="text-lg font-bold tabular">
                      {isMilestone ? `${goal.manualProgress || 0}%` : formatCurrency(goal.saved, 'INR')}
                    </div>
                  )}
                </div>
                {!isMilestone && (
                  <div className="text-right space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target</div>
                    <div className="text-lg font-bold tabular text-muted-foreground">
                      {formatCurrency(goal.target, 'INR')}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass rounded-[2.5rem] border-dashed border-white/10">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">What are you working toward?</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Add your new goals to start tracking your journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
