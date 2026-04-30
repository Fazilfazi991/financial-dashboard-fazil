"use client";

import { useFinanceStore } from "@/lib/store";
import { MetricCard } from "@/components/metric-card";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const OverviewChart = dynamic(() => import("@/components/overview-chart").then(mod => mod.OverviewChart), { ssr: false });
const SpendingBreakdownChart = dynamic(() => import("@/components/overview-chart").then(mod => mod.SpendingBreakdownChart), { ssr: false });

export default function OverviewPage() {
  const { 
    accounts, 
    transactions, 
    debts, 
    settings, 
    rates 
  } = useFinanceStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Helper to convert to base currency
  const convert = (amount: number, fromCurrency: string) => {
    if (fromCurrency === settings.currency) return amount;
    const usdAmount = amount / (rates.rates[fromCurrency] || 1);
    return usdAmount * (rates.rates[settings.currency] || 1);
  };

  // Helper to get account balance
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

  const totalAssets = accounts.reduce((sum, a) => sum + convert(getAccountBalance(a.id), a.currency), 0);
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance || 0), 0);
  const netWorth = totalAssets - totalDebt;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((sum, t) => sum + convert(t.amount, t.currency || settings.currency), 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((sum, t) => sum + convert(t.amount, t.currency || settings.currency), 0);

  const cashFlow = monthlyIncome - monthlyExpenses;

  // Emergency Fund calculation
  const monthlyExpensesAvg = 3500; // Placeholder or calculate from last 3 months
  const cashAssets = accounts
    .filter(a => ['current', 'savings', 'cash'].includes(a.type))
    .reduce((sum, a) => sum + convert(getAccountBalance(a.id), a.currency), 0);
  const efCoverage = cashAssets / (monthlyExpenses || monthlyExpensesAvg);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Good morning, {settings.name}</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your financial snapshot for today.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground tabular">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Net Worth"
          value={formatCurrency(netWorth, settings.currency)}
          subtitle={`${accounts.length} linked assets`}
          className={netWorth >= 0 ? "border-primary/20" : "border-destructive/20"}
        />
        <MetricCard 
          label="Emergency Fund"
          value={`${efCoverage.toFixed(1)} mo`}
          subtitle="Coverage of expenses"
          progress={{ value: Math.min(100, (efCoverage / 6) * 100), color: "var(--clr-purple)" }}
        />
        <MetricCard 
          label="Monthly Cash Flow"
          value={formatCurrency(cashFlow, settings.currency)}
          subtitle="Income vs Expenses"
          trend={{ value: 12, isPositive: cashFlow >= 0 }}
        />
        <MetricCard 
          label="Total Debt"
          value={formatCurrency(totalDebt, settings.currency)}
          subtitle="Total liabilities"
          className="text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl min-h-[400px]">
            <h3 className="text-lg font-semibold mb-6 text-primary">Cash Flow Analysis</h3>
            <OverviewChart />
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                      t.type === 'income' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}>
                      {t.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-muted-foreground">{t.category}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold tabular",
                    t.type === 'income' ? "text-primary" : "text-destructive"
                  )}>
                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, t.currency || settings.currency)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet.
                </div>
              )}
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-semibold mb-6">Spending Breakdown</h3>
            <SpendingBreakdownChart />
          </div>
        </div>
      </div>
    </div>
  );
}
