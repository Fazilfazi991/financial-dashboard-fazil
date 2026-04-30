"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Target, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AddGoalDialog } from "@/components/add-goal-dialog";

export default function GoalsPage() {
  const { goals, settings } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
          const progress = (goal.saved / goal.target) * 100;
          const isCompleted = progress >= 100;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-[2.5rem] relative group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  isCompleted ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-500"
                )}>
                  {isCompleted ? <Trophy className="w-7 h-7" /> : <Target className="w-7 h-7" />}
                </div>
                <div className="flex flex-col items-end gap-2">
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
              </div>

              <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-3xl font-black tabular tracking-tighter">
                  {Math.round(progress)}%
                </span>
                <span className="text-sm text-muted-foreground font-medium">complete</span>
              </div>

              {/* Circular Progress (Visual Representation) */}
              <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
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

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saved So Far</div>
                  <div className="text-lg font-bold tabular">{formatCurrency(goal.saved, settings.currency)}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target</div>
                  <div className="text-lg font-bold tabular text-muted-foreground">{formatCurrency(goal.target, settings.currency)}</div>
                </div>
              </div>

              <button className="w-full mt-8 py-3 rounded-2xl bg-secondary text-foreground text-sm font-bold hover:bg-secondary/80 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                Add Funds
              </button>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass rounded-3xl border-dashed">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">What are you working toward?</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              A new car, a house deposit, or your dream vacation. Add it here to stay motivated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
