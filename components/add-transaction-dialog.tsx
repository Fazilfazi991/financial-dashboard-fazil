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
import { Plus, Info } from "lucide-react";

interface AddTransactionDialogProps {
  children?: React.ReactNode;
  initialType?: 'income' | 'expense' | 'transfer';
  initialStreamId?: string;
}

export function AddTransactionDialog({ 
  children, 
  initialType = 'expense',
  initialStreamId = "" 
}: AddTransactionDialogProps) {
  const { accounts, incomes, addTransaction, settings } = useFinanceStore();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<'income' | 'expense' | 'transfer'>(initialType);
  const [amount, setAmount] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [toAccountId, setToAccountId] = React.useState("");
  const [incomeStreamId, setIncomeStreamId] = React.useState(initialStreamId);
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  // Sync with props when they change or dialog opens
  React.useEffect(() => {
    if (open) {
      setType(initialType);
      setIncomeStreamId(initialStreamId);
      
      // Auto-select account based on stream
      if (initialStreamId) {
        const stream = incomes.find(s => s.id === initialStreamId);
        if (stream && stream.linkedAccountId) {
          setAccountId(stream.linkedAccountId);
          setCategory(stream.type);
          setDescription(`Income from ${stream.name}`);
        }
      } else if (initialType === 'income') {
        const defaultAED = accounts.find(a => a.currency === 'AED' && a.isDefault);
        if (defaultAED) setAccountId(defaultAED.id);
      }
    }
  }, [open, initialType, initialStreamId, incomes, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    addTransaction({
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      incomeStreamId: type === 'income' ? incomeStreamId : undefined,
      category: type === 'transfer' ? 'Transfer' : category,
      description,
      date,
      currency: accounts.find(a => a.id === accountId)?.currency || settings.currency,
      createdAt: new Date().toISOString()
    });

    setOpen(false);
    setAmount("");
    setDescription("");
  };

  const activeIncomes = incomes.filter(s => s.status === 'active');

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
              className="bg-secondary/50 border-border/50 rounded-xl py-6 text-lg font-bold"
              required
            />
          </div>

          {type === 'income' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Income Stream</label>
              <Select value={incomeStreamId} onValueChange={(val) => {
                setIncomeStreamId(val);
                const stream = incomes.find(s => s.id === val);
                if (stream) {
                  if (stream.linkedAccountId) setAccountId(stream.linkedAccountId);
                  setCategory(stream.type);
                }
              }}>
                <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {activeIncomes.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.currency === 'AED' ? '🇦🇪' : '🇮🇳'} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                {type === 'transfer' ? 'From Account' : 'Wallet / Account'}
              </label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.type !== 'receivable').map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.currency === 'AED' ? '🇦🇪' : '🇮🇳'} {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === 'transfer' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">To Account</label>
                <Select value={toAccountId} onValueChange={setToAccountId} required>
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.id !== accountId && a.type !== 'receivable').map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                <Input 
                  placeholder="e.g. Rent, Business" 
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
              placeholder="Optional notes..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl"
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-6 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
