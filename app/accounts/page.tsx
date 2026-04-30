"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, MoreVertical, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/components/add-account-dialog";
import { Edit2 } from "lucide-react";

export default function AccountsPage() {
  const { accounts, transactions, settings, rates, deleteAccount } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const convert = (amount: number, fromCurrency: string) => {
    if (fromCurrency === settings.currency) return amount;
    const usdAmount = amount / (rates.rates[fromCurrency] || 1);
    return usdAmount * (rates.rates[settings.currency] || 1);
  };

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

  const totalBalance = accounts.reduce((sum, a) => sum + convert(getAccountBalance(a.id), a.currency), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Accounts & Wallets</h1>
          <p className="text-muted-foreground mt-1">Manage your financial institutions and balances.</p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="text-left sm:text-right">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Balance</div>
            <div className="text-2xl font-bold tabular">{formatCurrency(totalBalance, settings.currency)}</div>
          </div>
          <AccountDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc, index) => {
          const balance = getAccountBalance(acc.id);
          const baseBalance = convert(balance, acc.currency);
          
          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-6 rounded-3xl relative overflow-hidden group border-l-4"
              style={{ borderLeftColor: acc.color }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{acc.institution}</div>
                    <div className="font-bold">{acc.name}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <AccountDialog account={acc}>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </AccountDialog>
                  <button 
                    onClick={() => { if(confirm('Delete this account? This will NOT delete its transactions.')) deleteAccount(acc.id) }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold tabular tracking-tight">
                  {acc.currency} {balance.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(baseBalance, settings.currency)}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-secondary text-secondary-foreground text-xs font-semibold py-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  Transfer
                </button>
                <button className="flex-1 bg-secondary text-secondary-foreground text-xs font-semibold py-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  Details
                </button>
              </div>
            </motion.div>
          );
        })}

        {accounts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass rounded-3xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No accounts found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Add your bank accounts, wallets, or cash to start tracking your net worth.
            </p>
            <button className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Add First Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
