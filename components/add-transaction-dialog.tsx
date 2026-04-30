"use client";

import * as React from "react";
import { useFinanceStore } from "@/lib/store";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddTransactionDialog({ children }: { children?: React.ReactNode }) {
  const { accounts, addTransaction, settings } = useFinanceStore();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [toAccountId, setToAccountId] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !category || !description) return;

    addTransaction({
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : null,
      category,
      description,
      date,
      currency: accounts.find(a => a.id === accountId)?.currency || settings.currency,
      createdAt: new Date().toISOString()
    });

    setOpen(false);
    // Reset form
    setAmount("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-xl">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Amount</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account</label>
              <Select onValueChange={setAccountId} required>
                <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length > 0 ? (
                    accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No accounts found. Add one first.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {type === 'transfer' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">To Account</label>
                <Select onValueChange={setToAccountId} required>
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                  {accounts.length > 0 ? (
                    accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No accounts found. Add one first.
                    </SelectItem>
                  )}
                </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                <Input 
                  placeholder="Food, Rent..." 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-secondary/50 border-border/50 rounded-xl"
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Description</label>
            <Input 
              placeholder="What was this for?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Date</label>
            <Input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-6 rounded-2xl shadow-lg shadow-primary/20">
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
