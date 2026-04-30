"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, TrendingUp, DollarSign, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IncomePage() {
  const { incomes, transactions, settings } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  // All Income Transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const totalMonthlyActual = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalMonthlyExpected = incomes.reduce((sum, i) => sum + Number(i.expected), 0);

  // Daily Tracker Logic
  const dailyData: Record<string, { income: number, expense: number }> = {};
  transactions.forEach(t => {
    const date = t.date;
    if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
    if (t.type === 'income') dailyData[date].income += Number(t.amount);
    if (t.type === 'expense') dailyData[date].expense += Number(t.amount);
  });

  const sortedDays = Object.entries(dailyData).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Income & Activity</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and daily cash flow.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl mb-8">
          <TabsTrigger value="sources" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sources</TabsTrigger>
          <TabsTrigger value="tracker" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Tracker</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Income History</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Monthly Progress</div>
                <div className="text-4xl font-black tabular tracking-tighter">{formatCurrency(totalMonthlyActual, settings.currency)}</div>
                <div className="text-xs text-muted-foreground mt-1">Target: {formatCurrency(totalMonthlyExpected, settings.currency)}</div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                  <span>Goal Completion</span>
                  <span>{Math.round((totalMonthlyActual / (totalMonthlyExpected || 1)) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalMonthlyActual / (totalMonthlyExpected || 1)) * 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Defined Sources</h3>
              {incomes.map((income, index) => {
                const actual = transactions
                  .filter(t => t.type === 'income' && t.description.toLowerCase().includes(income.name.toLowerCase()))
                  .reduce((sum, t) => sum + Number(t.amount), 0);
                
                return (
                  <motion.div
                    key={income.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass p-6 rounded-3xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        {income.type === 'freelance' ? <Briefcase className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{income.name}</h3>
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{income.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold tabular">{formatCurrency(actual, settings.currency)}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">This Month</div>
                    </div>
                  </motion.div>
                );
              })}
              {incomes.length === 0 && (
                <div className="py-12 text-center glass rounded-3xl border-dashed text-muted-foreground">
                  No fixed income sources defined.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tracker" className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {sortedDays.map(([date, data], index) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-5 rounded-2xl flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">{formatDate(date)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Activity Summary</div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <div className="text-primary font-bold tabular">+{formatCurrency(data.income, settings.currency)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Income</div>
                  </div>
                  <div className="text-right">
                    <div className="text-destructive font-bold tabular">-{formatCurrency(data.expense, settings.currency)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Expense</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {incomeTransactions.map((t, index) => (
                  <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-sm tabular text-muted-foreground">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{t.description}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary tabular">+{formatCurrency(t.amount, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
