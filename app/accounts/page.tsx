"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency, toAED, fmtAED } from "@/lib/utils";
import { 
  Plus, 
  Wallet, 
  PiggyBank, 
  ArrowDownLeft, 
  MoreHorizontal, 
  CreditCard,
  Banknote,
  ShieldCheck
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

  const totalInINR = accounts.reduce((sum, a) => {
    const bal = getAccountBalance(a.id);
    return sum + (a.currency === 'INR' ? bal : bal * settings.aedToInr);
  }, 0);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Wallets & Assets</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Managing {accounts.length} storage locations.
          </p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Assets (INR)</div>
            <div className="text-3xl font-black tabular">{formatCurrency(totalInINR, 'INR')}</div>
          </div>
          <AccountDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account, index) => {
          const balance = getAccountBalance(account.id);
          const Icon = ICON_MAP[account.icon || ''] || Wallet;
          const isReceivable = account.type === 'receivable';

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "glass p-8 rounded-[2.5rem] relative group overflow-hidden border-t-4",
                isReceivable ? "bg-primary/5 border-primary" : ""
              )}
              style={{ borderTopColor: isReceivable ? undefined : account.color }}
            >
              <div className="flex justify-between items-start mb-8">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${account.color}15`, color: account.color }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex gap-2">
                  {account.tag && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      isReceivable ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {account.tag}
                    </span>
                  )}
                  <button 
                    onClick={() => { if(confirm(`Remove ${account.name}?`)) deleteAccount(account.id) }}
                    className="p-2 rounded-xl bg-secondary opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{account.institution}</div>
                <h3 className="text-xl font-black">{account.name}</h3>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="text-3xl font-black tabular">
                  {account.currency === 'INR' ? formatCurrency(balance, 'INR') : fmtAED(balance)}
                </div>
                <div className="text-sm font-bold text-muted-foreground mt-1">
                  {account.currency === 'INR' ? fmtAED(toAED(balance)) : formatCurrency(balance * settings.aedToInr, 'INR')}
                </div>
              </div>

              {isReceivable && (
                <button className="w-full mt-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
                  Mark Received
                </button>
              )}
              
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mb-16 -mr-16 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
