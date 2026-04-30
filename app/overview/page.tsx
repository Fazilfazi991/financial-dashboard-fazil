"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency, toAED, fmtAED } from "@/lib/utils";
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
  CheckCircle2
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
  
  const monthlyBurn = expenses.reduce((sum, e) => sum + Number(e.budgeted), 0);
  const monthsToFreedom = extraPayment > 0 ? (freedomNumber / extraPayment).toFixed(1) : "∞";

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  const getAccountBalance = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 0;
    const txns = transactions.filter(t => t.accountId === accId || t.toAccountId === accId);
    let balance = Number(acc.openingBalance || 0);
    txns.forEach(t => {
      const amt = Number(t.amount);
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
          <h1 className="text-6xl lg:text-8xl font-black tabular tracking-tighter mb-2 text-foreground">
            {formatCurrency(freedomNumber, 'INR')}
          </h1>
          <div className="text-2xl font-bold text-muted-foreground mb-8">
            {fmtAED(toAED(freedomNumber))}
          </div>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Every rupee earned above expenses clears 0.06% of your total debt.
          </p>
        </div>
      </motion.div>

      {/* Section: Wallets Row */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold px-1 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" /> Active Wallets
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {accounts.filter(a => a.type !== 'receivable').map(account => {
            const Icon = ICON_MAP[account.icon || ''] || Wallet;
            const balance = getAccountBalance(account.id);
            return (
              <div key={account.id} className="glass min-w-[280px] p-6 rounded-3xl shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}15`, color: account.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{account.tag}</span>
                </div>
                <div className="text-lg font-black tabular">
                  {account.currency === 'INR' ? formatCurrency(balance, 'INR') : fmtAED(balance)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground mt-1">
                  {account.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Money Coming In */}
      {receivables.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold px-1 flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-primary" /> Money Coming In
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivables.map(acc => {
              const amount = getAccountBalance(acc.id);
              return (
                <div key={acc.id} className="glass p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowDownLeft className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Expected Soon</div>
                      <div className="text-xs font-bold text-muted-foreground">Due in 5 days</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{acc.institution}</div>
                    <h3 className="text-xl font-black">{acc.name}</h3>
                  </div>
                  <div className="mt-6 text-3xl font-black text-primary tabular">
                    {fmtAED(amount)}
                  </div>
                  <button className="w-full mt-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Mark Received
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem]">
          <div className="flex flex-col h-full justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payoff Momentum</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every ₹1,000 extra clears <span className="text-primary font-bold">0.06%</span> of total debt.
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
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
                <div className="text-3xl font-black text-primary tabular">{monthsToFreedom} <span className="text-xs">months</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
