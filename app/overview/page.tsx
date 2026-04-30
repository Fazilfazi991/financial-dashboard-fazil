"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency, toAED, fmtAED } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, ShieldAlert, Zap, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";

export default function OverviewPage() {
  const { 
    debts, 
    goals, 
    expenses,
    transactions,
    settings,
    resetToRealData
  } = useFinanceStore();

  const [mounted, setMounted] = useState(false);
  const [extraPayment, setExtraPayment] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!settings.migrated_real_data) {
      resetToRealData();
    }
  }, [settings.migrated_real_data, resetToRealData]);

  if (!mounted) return null;

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const visaGoals = goals.filter(g => g.name.toLowerCase().includes('visa'));
  const totalVisaGoal = visaGoals.reduce((sum, g) => sum + Number(g.target), 0);
  const freedomNumber = totalDebt + totalVisaGoal;
  
  const monthlyBurn = expenses.reduce((sum, e) => sum + Number(e.budgeted), 0);
  
  // Simple payoff calculation
  const monthsToFreedom = extraPayment > 0 ? (freedomNumber / extraPayment).toFixed(1) : "∞";

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-12 pb-20">
      {/* Section A: Freedom Number Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass p-10 lg:p-16 rounded-[3rem] text-center border-destructive/20 bg-destructive/5"
      >
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-destructive uppercase tracking-[0.3em] mb-4">The Freedom Number</div>
          <h1 className="text-6xl lg:text-8xl font-black tabular tracking-tighter mb-2 text-foreground">
            {formatCurrency(freedomNumber, 'INR')}
          </h1>
          <div className="text-2xl font-bold text-muted-foreground mb-8">
            {fmtAED(toAED(freedomNumber))}
          </div>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            This is the number that stands between you and a fresh start. Every decision from here on is about bringing this number to zero.
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1)_0%,transparent_70%)] pointer-events-none" />
      </motion.div>

      {/* Section B: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border-l-4 border-destructive">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingDown className="w-3 h-3" /> Total Debt
          </div>
          <div className="text-xl font-bold tabular">{formatCurrency(totalDebt, 'INR')}</div>
          <div className="text-[10px] font-medium text-muted-foreground mt-1">{fmtAED(toAED(totalDebt))}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-amber-500">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" /> Visa Goals
          </div>
          <div className="text-xl font-bold tabular">{formatCurrency(totalVisaGoal, 'INR')}</div>
          <div className="text-[10px] font-medium text-muted-foreground mt-1">{fmtAED(toAED(totalVisaGoal))}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-primary">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Monthly Burn
          </div>
          <div className="text-xl font-bold tabular">{formatCurrency(monthlyBurn, 'INR')}</div>
          <div className="text-[10px] font-medium text-muted-foreground mt-1">{fmtAED(toAED(monthlyBurn))}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-purple-500">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Target Date
          </div>
          <div className="text-xl font-bold">Dec 2027</div>
          <div className="text-[10px] font-medium text-muted-foreground mt-1">Based on goals</div>
        </div>
      </div>

      {/* Section C: Debt Breakdown */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold tracking-tight px-1">Debt Portfolio</h2>
          <div className="text-xs text-muted-foreground font-medium">8 Active Debts</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {debts.map(debt => (
            <div key={debt.id} className="glass p-5 rounded-2xl group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{debt.name}</div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: debt.color }} />
              </div>
              <div className="text-lg font-bold tabular">{formatCurrency(debt.balance, 'INR')}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{fmtAED(toAED(debt.balance))}</div>
              {debt.name === "Ikaka Gold" && (
                <div className="mt-3 px-2 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase rounded text-center tracking-tighter">
                  Gold Offset Applied
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section D: Big Picture Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[2.5rem] bg-secondary/20">
          <h2 className="text-2xl font-bold mb-6">Big Picture Summary</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground uppercase">Total Debts</span>
              <span>{formatCurrency(totalDebt, 'INR')}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-muted-foreground uppercase">Visa Goals</span>
              <span>{formatCurrency(totalVisaGoal, 'INR')}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-black">
              <span className="text-primary uppercase tracking-wider">Grand Total</span>
              <span className="text-primary">{formatCurrency(freedomNumber, 'INR')}</span>
            </div>
            <div className="flex justify-between pt-1 text-xs text-muted-foreground">
              <span>AED Equivalent</span>
              <span>{fmtAED(toAED(freedomNumber))}</span>
            </div>
          </div>

          <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <p className="text-xs text-amber-500 leading-relaxed italic">
              &quot;At current monthly expenses of {formatCurrency(monthlyBurn, 'INR')}, you need to earn that minimum just to survive. Every rupee above that goes toward the goal.&quot;
            </p>
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem]">
          <div className="flex flex-col h-full justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payoff Momentum</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every ₹1,000 you earn above your monthly expenses clears <span className="text-primary font-bold">0.06%</span> of your total debt.
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Monthly Surplus</span>
                  <span className="text-primary">{formatCurrency(extraPayment, 'INR')}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500000" 
                  step="5000"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Time to Freedom</div>
                <div className="text-3xl font-black text-primary tabular">{monthsToFreedom} <span className="text-xs">months</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section E: Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Today&apos;s Snapshot
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Income</div>
              <div className="text-xl font-bold text-primary tabular">+{formatCurrency(todayIncome, 'INR')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expense</div>
              <div className="text-xl font-bold text-destructive tabular">-{formatCurrency(todayExpense, 'INR')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net</div>
              <div className={cn("text-xl font-bold tabular", (todayIncome - todayExpense) >= 0 ? "text-primary" : "text-destructive")}>
                {formatCurrency(todayIncome - todayExpense, 'INR')}
              </div>
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <ArrowUpRight className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-bold mb-1">Stay Focused</h4>
          <p className="text-xs text-muted-foreground">Every rupee saved is a step toward your freedom number.</p>
        </div>
      </div>
    </div>
  );
}
