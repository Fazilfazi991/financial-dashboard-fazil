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
      updateGoal(goal.id, { manualProgress: editValue, lastUpdated: new Date().toISOString() });
    } else {
      updateGoal(goal.id, { saved: editValue, lastUpdated: new Date().toISOString() });
    }
    setEditingId(null);
  };

  const incrementMilestone = (goal: Goal) => {
    if (goal.totalMilestones && goal.currentMilestone !== undefined && goal.currentMilestone < goal.totalMilestones) {
      const newMilestone = goal.currentMilestone + 1;
      const newSaved = goal.saved + (goal.milestoneValue || 0);
      updateGoal(goal.id, { 
        currentMilestone: newMilestone, 
        saved: newSaved,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const updateNotes = (goalId: string, notes: string) => {
    updateGoal(goalId, { notes, lastUpdated: new Date().toISOString() });
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadline);
    targetDate.setHours(0, 0, 0, 0);
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatus = (goal: Goal) => {
    if (goal.target === 0) return null;
    const today = new Date().getTime();
    const start = new Date(goal.createdAt).getTime();
    const end = new Date(goal.deadline || '').getTime();
    
    if (today >= end) return { label: 'Overdue', color: 'bg-destructive/20 text-destructive' };
    
    const totalDays = end - start;
    const daysPassed = today - start;
    const expectedProgress = (daysPassed / totalDays) * 100;
    const actualProgress = (goal.saved / goal.target) * 100;
    
    const diff = actualProgress - expectedProgress;
    
    if (diff > 10) return { label: 'Ahead', color: 'bg-purple-500/20 text-purple-400' };
    if (diff >= 0) return { label: 'On track', color: 'bg-emerald-500/20 text-emerald-400' };
    if (diff > -10) return { label: 'Slightly behind', color: 'bg-amber-500/20 text-amber-400' };
    return { label: 'Behind', color: 'bg-destructive/20 text-destructive' };
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
          
          const daysLeft = goal.deadline ? getDaysLeft(goal.deadline) : null;
          const status = getStatus(goal);
          const dailyTarget = !isCompleted && daysLeft && daysLeft > 0 && !isMilestone 
            ? Math.round((goal.target - goal.saved) / daysLeft) 
            : null;

          const lastUpdatedDays = goal.lastUpdated 
            ? Math.floor((new Date().getTime() - new Date(goal.lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-[2.5rem] relative group border border-white/5 flex flex-col"
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
                    {daysLeft !== null && (
                      <div 
                        title={`Deadline: ${new Date(goal.deadline!).toLocaleDateString()}`}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          daysLeft < 7 ? "bg-destructive/20 text-destructive" :
                          daysLeft <= 14 ? "bg-amber-500/20 text-amber-500" :
                          "bg-secondary text-muted-foreground"
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
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

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tabular tracking-tighter">
                    {Math.round(progress)}%
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">complete</span>
                    {status && (
                      <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-1", status.color)}>
                        {status.label}
                      </div>
                    )}
                  </div>
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
              <div className="space-y-2 mb-8">
                <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
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
                {dailyTarget && (
                  <div className="text-[10px] text-muted-foreground font-medium italic">
                    {formatCurrency(dailyTarget, 'INR')} / day needed to hit target
                  </div>
                )}
              </div>

              {/* Milestone Tracker specifically for Web Dev or goals with totalMilestones */}
              {goal.totalMilestones && goal.totalMilestones > 0 && (
                <div className="mb-8 p-4 bg-secondary/30 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Milestones</div>
                    <div className="text-xs font-bold text-primary">{goal.currentMilestone} / {goal.totalMilestones} done</div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: goal.totalMilestones }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          i < (goal.currentMilestone || 0) ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-secondary"
                        )}
                      />
                    ))}
                  </div>
                  {!isCompleted && (
                    <button 
                      onClick={() => incrementMilestone(goal)}
                      className="w-full py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Increment Milestone
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between items-end gap-4 mb-8">
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

              <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Add a note..."
                    defaultValue={goal.notes}
                    onBlur={(e) => updateNotes(goal.id, e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.currentTarget.blur(); } }}
                    className="bg-transparent border-none p-0 text-xs text-muted-foreground focus:ring-0 placeholder:text-muted-foreground/30 w-full"
                  />
                </div>
                {lastUpdatedDays !== null && (
                  <div className={cn(
                    "text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                    lastUpdatedDays >= 7 ? "text-amber-500" : "text-muted-foreground/50"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", lastUpdatedDays >= 7 ? "bg-amber-500 animate-pulse" : "bg-muted-foreground/30")} />
                    Updated {lastUpdatedDays === 0 ? "today" : `${lastUpdatedDays} days ago`}
                    {lastUpdatedDays >= 7 && " — Log your progress"}
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
