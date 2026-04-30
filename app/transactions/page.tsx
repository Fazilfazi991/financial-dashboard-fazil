"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Filter, ArrowUpDown, Download, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

export default function TransactionsPage() {
  const { transactions, accounts, settings } = useFinanceStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Review and manage your daily ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <AddTransactionDialog />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search descriptions, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border/50 rounded-2xl text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((t, index) => {
              const account = accounts.find(a => a.id === t.accountId);
              return (
                <motion.tr 
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm tabular text-muted-foreground">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account?.color || 'var(--border)' }} />
                      {account?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-muted-foreground">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {t.description}
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold tabular",
                    t.type === 'income' ? "text-primary" : "text-destructive"
                  )}>
                    <div className="flex items-center justify-end gap-3">
                      <span>{t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, t.currency || settings.currency)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete this transaction?')) deleteTransaction(t.id) }}
                        className="p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                      >
                        <Plus className="w-3 h-3 rotate-45" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
