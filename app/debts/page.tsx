"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, TrendingDown, Calendar, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AddDebtDialog } from "@/components/add-debt-dialog";

export default function DebtsPage() {
  const { debts, transactions, settings } = useFinanceStore();
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') return a.balance - b.balance;
    return b.rate - a.rate;
  });

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + Number(d.minPayment), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Debt Command Center</h1>
          <p className="text-muted-foreground mt-1">Strategies to reach financial freedom faster.</p>
        </div>
        <AddDebtDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Liabilities</div>
          <div className="text-3xl font-bold text-destructive tabular">{formatCurrency(totalDebt, settings.currency)}</div>
        </div>
        <div className="glass p-6 rounded-3xl">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Monthly Minimums</div>
          <div className="text-3xl font-bold tabular">{formatCurrency(totalMinPayment, settings.currency)}</div>
        </div>
        <div className="glass p-6 rounded-3xl flex flex-col justify-center">
          <div className="flex gap-2 p-1 bg-secondary rounded-xl">
            <button 
              onClick={() => setStrategy('avalanche')}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                strategy === 'avalanche' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Avalanche
            </button>
            <button 
              onClick={() => setStrategy('snowball')}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                strategy === 'snowball' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Snowball
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {strategy === 'avalanche' ? "Highest interest first (saves more money)" : "Smallest balance first (builds momentum)"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDebts.map((debt, index) => {
          const progress = ((debt.total - debt.balance) / debt.total) * 100;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-3xl relative group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{debt.name}</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Percent className="w-3 h-3" /> {debt.rate}% interest
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" /> Min: {formatCurrency(debt.minPayment, settings.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end">
                  <div className="text-2xl font-bold tabular text-destructive">
                    {formatCurrency(debt.balance, settings.currency)}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-xs text-muted-foreground">
                      of {formatCurrency(debt.total, settings.currency)} original
                    </div>
                    <button 
                      onClick={() => { if(confirm('Delete this debt?')) deleteDebt(debt.id) }}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                    >
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-destructive rounded-full" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 blur-3xl -mr-16 -mt-16 group-hover:bg-destructive/10 transition-colors" />
            </motion.div>
          );
        })}
        
        {debts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center glass rounded-3xl border-dashed">
            <h3 className="text-lg font-semibold">You're debt-free!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              All liabilities are cleared. Add any future loans or credit card balances here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
