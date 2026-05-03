"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Wallet,
  ArrowDownLeft,
  PiggyBank,
  CheckCircle2,
  Trophy
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  piggy: PiggyBank,
  wallet: Wallet,
  'arrow-in': ArrowDownLeft,
};

export default function OverviewPage() {
  const { 
    debts, 
    goals, 
    expenses,
    transactions,
    accounts,
    incomes,
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
  const totalDebtPaidOff = debts.reduce((sum, d) => sum + (Number(d.total) - Number(d.balance)), 0);
  
  const monthlyBurn = expenses.reduce((sum, e) => sum + Number(e.budgeted), 0);
  const monthsToFreedom = extraPayment > 0 ? (freedomNumber / extraPayment).toFixed(1) : "∞";

  const today = new Date().toISOString().split('T')[0];
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => {
    const amt = t.currency === 'AED' ? Number(t.amount) * settings.aedToInr : Number(t.amount);
    return sum + amt;
  }, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => {
    const amt = t.currency === 'AED' ? Number(t.amount) * settings.aedToInr : Number(t.amount);
    return sum + amt;
  }, 0);

  const getAccountBalance = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 0;
    const txns = transactions.filter(t => t.accountId === accId || t.toAccountId === accId);
    let balance = Number(acc.openingBalance || 0);
    txns.forEach(t => {
      let amt = Number(t.amount);
      // Convert transaction amount to account currency if they differ
      if (t.currency && t.currency !== acc.currency) {
        if (t.currency === 'INR' && acc.currency === 'AED') {
          amt = amt / settings.aedToInr;
        } else if (t.currency === 'AED' && acc.currency === 'INR') {
          amt = amt * settings.aedToInr;
        }
      }
      if (t.type === 'income' && t.accountId === accId) balance += amt;
      else if (t.type === 'expense' && t.accountId === accId) balance -= amt;
      else if (t.type === 'transfer') {
        if (t.accountId === accId) balance -= amt;
        if (t.toAccountId === accId) balance += amt;
      }
    });
    return balance;
  };

  const receivables = accounts.filter(a => a.type === 'receivable');

  return (
    <div className="space-y-12 pb-32">
      {/* Section A: Freedom Number Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass p-10 lg:p-16 rounded-[3rem] text-center border-destructive/20 bg-destructive/5"
      >
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-destructive uppercase tracking-[0.3em] mb-4">The Freedom Number</div>
          <h1 className="text-6xl lg:text-8xl font-black tabular tracking-tighter mb-8 text-foreground">
            {formatCurrency(freedomNumber, 'INR')}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Every rupee earned above expenses clears 0.06% of your total debt.
          </p>
        </div>
      </motion.div>

      {/* Section B: Debt Paid Off Banner */}
      <div className="px-1">
        <div className="glass p-8 rounded-[2.5rem] bg-primary/5 border-primary/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">Progress Milestone</div>
              <h3 className="text-xl font-bold tracking-tight">Total Debt Paid Off Till Date</h3>
            </div>
          </div>
          <div className="text-4xl md:text-5xl font-black text-primary tabular tracking-tighter relative z-10">
            {formatCurrency(totalDebtPaidOff, 'INR')}
          </div>
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-500">
            <CheckCircle2 className="w-48 h-48 rotate-12" />
          </div>
        </div>
      </div>      {/* Section: Debt Portfolio */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold">Debt Portfolio</h2>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{debts.length} Active Debts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {debts.map((debt) => (
            <div key={debt.id} className="glass p-6 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">
                  {debt.name}
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: debt.color }} />
              </div>
              <div className="text-xl font-black tabular mt-2">
                {formatCurrency(debt.balance, 'INR')}
              </div>
              {debt.name === "Ikaka Gold" && (
                <div className="mt-4 py-1.5 bg-amber-500/10 rounded-lg text-center">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Gold Offset Applied</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section D: Big Picture Summary & Payoff Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[2.5rem] bg-secondary/10">
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
            <div className="flex justify-between pt-2 text-lg font-black text-primary">
              <span className="uppercase tracking-wider">Grand Total</span>
              <span>{formatCurrency(freedomNumber, 'INR')}</span>
            </div>
          </div>

          <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <p className="text-[11px] text-amber-500 leading-relaxed italic">
              &quot;At current monthly expenses of {formatCurrency(monthlyBurn, 'INR')}, you need to earn that minimum just to survive. Every rupee above that goes toward the goal.&quot;
            </p>
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem]">
          <div className="flex flex-col h-full justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payoff Momentum</h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
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
                <div className="text-3xl font-black text-primary tabular">{monthsToFreedom} <span className="text-xs font-normal">months</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
              <TrendingUp className="w-3 h-3" /> Today&apos;s Snapshot
            </div>
            <div className="flex gap-12">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Income</div>
                <div className="text-xl font-bold text-primary">+{formatCurrency(todayIncome, 'INR')}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Expense</div>
                <div className="text-xl font-bold text-destructive">-{formatCurrency(todayExpense, 'INR')}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Net</div>
                <div className="text-xl font-bold text-foreground">{formatCurrency(todayIncome - todayExpense, 'INR')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm">Stay Focused</h3>
          <p className="text-[10px] text-muted-foreground mt-1 px-4">Every rupee saved is a step toward your freedom number.</p>
        </div>
      </div>
    </div>
  );
}
