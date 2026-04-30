"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, TrendingDown, Info, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AddDebtDialog } from "@/components/add-debt-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DebtsPage() {
  const { debts, settings, deleteDebt } = useFinanceStore();
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') return a.balance - b.balance;
    return b.rate - a.rate;
  });

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Debt Command Center</h1>
          <p className="text-muted-foreground mt-1">₹{totalDebt.toLocaleString('en-IN')} to go. You&apos;ve got this.</p>
        </div>
        <AddDebtDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {sortedDebts.map((debt, index) => {
            const progress = ((debt.total - debt.balance) / debt.total) * 100;
            return (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-3xl relative group overflow-hidden border-l-4"
                style={{ borderLeftColor: debt.color }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary">
                      <TrendingDown className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{debt.name}</h3>
                        {debt.name === "Ikaka Gold" && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase rounded tracking-tighter">
                            Gold Offset Case
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{debt.notes}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <div className="text-2xl font-bold tabular">
                      {formatCurrency(debt.balance, 'INR')}
                    </div>
                  </div>

                  <button 
                    onClick={() => { if(confirm(`Delete debt to ${debt.name}?`)) deleteDebt(debt.id) }}
                    className="absolute top-0 right-0 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:text-destructive"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* Snowball Order Recommendation */}
          <div className="glass p-8 rounded-[2.5rem] border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Snowball Order
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs glass p-4">
                    <p className="text-xs leading-relaxed">
                      The <strong>Snowball Method</strong> recommends paying off the smallest balances first to build psychological momentum and clear individual debts faster.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-4">
              {[...debts].sort((a, b) => a.balance - b.balance).map((debt, i) => (
                <div key={debt.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className={cn("text-sm font-medium", i === 0 ? "text-foreground" : "text-muted-foreground")}>
                      {debt.name}
                    </span>
                    <span className="text-[10px] font-bold tabular text-muted-foreground">
                      {formatCurrency(debt.balance, 'INR')}
                    </span>
                  </div>
                  {i === 0 && <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Start Here</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Calculator/Insight */}
          <div className="glass p-8 rounded-[2.5rem]">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-muted-foreground" /> Insight
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                At your current monthly recurring expenses of <span className="text-foreground font-bold">{formatCurrency(27500, 'INR')}</span>, every extra rupee earned accelerates your freedom.
              </p>
              <p className="text-xs">
                To be debt-free in <strong>24 months</strong>, you need to earn <span className="text-foreground font-bold">₹[X]</span> above expenses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 14.71 11.29 2 13 2.12a.5.5 0 0 1 .47.51l-.74 9.37 7.27-1.29a.5.5 0 0 1 .53.68L12.71 22 11 21.88a.5.5 0 0 1-.47-.51l.74-9.37-7.27 1.29a.5.5 0 0 1-.53-.68Z" />
    </svg>
  );
}
