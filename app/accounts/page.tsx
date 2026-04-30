"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Wallet, 
  PiggyBank, 
  ArrowDownLeft, 
  ShieldCheck,
  LayoutGrid,
  ArrowRightLeft,
  CircleDollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/components/add-account-dialog";

const ICON_MAP: Record<string, any> = {
  piggy: PiggyBank,
  wallet: Wallet,
  'arrow-in': ArrowDownLeft,
};

export default function AccountsPage() {
  const { accounts, transactions, settings, deleteAccount } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  const totalBalance = accounts.reduce((sum, a) => {
    return sum + getAccountBalance(a.id);
  }, 0);

  return (
    <div className="space-y-12 pb-32">
      {/* Header & Asset Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Wallets & Assets</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Active management of {accounts.length} storage locations.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="glass px-8 py-5 rounded-[2rem] border-primary/20 bg-primary/5 min-w-[240px] relative overflow-hidden group">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-2">Total Combined Value</div>
            <div className="text-3xl font-black tabular tracking-tighter">{formatCurrency(totalBalance, 'INR')}</div>
            <CircleDollarSign className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <AccountDialog />
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {accounts.map((account, index) => {
          const balance = getAccountBalance(account.id);
          const Icon = ICON_MAP[account.icon || ''] || Wallet;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group h-[280px]"
            >
              <div 
                className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: account.color }}
              />
              
              <div className="relative h-full glass rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${account.color}15`, color: account.color }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{account.institution}</div>
                      <h3 className="text-xl font-black mt-1">{account.name}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-white/5">
                      {account.tag || account.type}
                    </span>
                    <button 
                      onClick={() => { if(confirm(`Remove ${account.name}?`)) deleteAccount(account.id) }}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-4xl font-black tabular tracking-tighter">
                      {formatCurrency(balance, 'INR')}
                    </div>
                  </div>
                </div>

                {/* Abstract Card Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <LayoutGrid className="w-24 h-24 rotate-12" />
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none opacity-10" style={{ backgroundColor: account.color }} />
              </div>
            </motion.div>
          );
        })}

        {/* Add Wallet Placeholder */}
        <AccountDialog>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[280px] rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-muted-foreground group-hover:text-foreground transition-colors">Add New Wallet</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Cash, Bank, or Savings</p>
          </motion.div>
        </AccountDialog>
      </div>

      {/* Quick Security/Status Note */}
      <div className="flex justify-center pt-8">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          All amounts are reconciled in real-time based on logged transactions.
        </div>
      </div>
    </div>
  );
}
