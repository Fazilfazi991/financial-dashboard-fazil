import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  total: number;
}

export interface Income {
  id: string;
  name: string;
  type: 'salary' | 'freelance' | 'dividend' | 'other';
  expected: number;
  actual: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  value: number;
  received: number;
  status: 'pending' | 'in-progress' | 'invoiced' | 'paid';
}

export interface Expense {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  category: string;
  date?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: string;
  currency: string;
  openingBalance: number;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  accountId: string;
  toAccountId?: string;
  category: string;
  description: string;
  date: string;
  currency: string;
  createdAt: string;
}

interface FinanceState {
  debts: Debt[];
  incomes: Income[];
  projects: Project[];
  expenses: Expense[];
  goals: Goal[];
  accounts: Account[];
  transactions: Transaction[];
  rates: {
    base: string;
    rates: Record<string, number>;
    updated: number;
  };
  settings: {
    currency: string;
    secondaryCurrency: string;
    aedToInr: number;
    theme: 'light' | 'dark';
    name: string;
    accentColor: string;
    onboarded: boolean;
    migrated_real_data: boolean;
    apiKey: string;
  };
  
  // Actions
  setDebts: (debts: Debt[]) => void;
  setIncomes: (incomes: Income[]) => void;
  setProjects: (projects: Project[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGoals: (goals: Goal[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setRates: (rates: FinanceState['rates']) => void;
  
  addTransaction: (txn: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  deleteDebt: (id: string) => void;
  deleteGoal: (id: string) => void;
  deleteProject: (id: string) => void;
  updateSettings: (settings: Partial<FinanceState['settings']>) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  updateProject: (project: Project) => void;
  setSettings: (settings: Partial<FinanceState['settings']>) => void;
  resetToRealData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      debts: [],
      incomes: [],
      projects: [],
      expenses: [],
      goals: [],
      accounts: [],
      transactions: [],
      rates: { base: 'USD', rates: { INR: 83.5, AED: 3.67, EUR: 0.92, USD: 1 }, updated: 0 },
      settings: {
        currency: 'INR',
        secondaryCurrency: 'AED',
        aedToInr: 25,
        theme: 'dark',
        name: 'User',
        accentColor: '#10b981',
        onboarded: false,
        migrated_real_data: false,
        apiKey: '',
      },
      
      setDebts: (debts) => set({ debts }),
      setIncomes: (incomes) => set({ incomes }),
      setProjects: (projects) => set({ projects }),
      setExpenses: (expenses) => set({ expenses }),
      setGoals: (goals) => set({ goals }),
      setAccounts: (accounts) => set({ accounts }),
      setTransactions: (transactions) => set({ transactions }),
      setRates: (rates) => set({ rates }),
      
      addTransaction: (txn) => set((state) => ({ transactions: [txn, ...state.transactions] })),
      deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),
      addAccount: (acc) => set((state) => ({ accounts: [...state.accounts, acc] })),
      deleteAccount: (id) => set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) })),
      deleteDebt: (id) => set((state) => ({ debts: state.debts.filter(d => d.id !== id) })),
      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter(g => g.id !== id) })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      updateProjectStatus: (id, status) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status } : p)
      })),
      updateProject: (updatedProject) => set((state) => ({
        projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      })),

      resetToRealData: () => set({
        transactions: [],
        expenses: [
          { id: "rec_001", name: "Rent", budgeted: 12500, spent: 0, category: "Housing" },
          { id: "rec_002", name: "Travel", budgeted: 7500, spent: 0, category: "Transport" },
          { id: "rec_003", name: "Basic Living Expenses", budgeted: 7500, spent: 0, category: "Food & Dining" }
        ],
        debts: [
          { id: "debt_001", name: "Alumol", total: 498326, balance: 498326, rate: 0, minPayment: 0, notes: "Personal debt — priority payoff", color: "#E24B4A" },
          { id: "debt_002", name: "Ikaka Gold", total: 770000, balance: 770000, rate: 0, minPayment: 0, notes: "Original ₹5,50,000 + Gold Sold ₹2,20,000. Sold 2 pavan gold on his behalf.", color: "#EF9F27" },
          { id: "debt_003", name: "Vappa", total: 211000, balance: 211000, rate: 0, minPayment: 0, notes: "Family debt", color: "#7F77DD" },
          { id: "debt_004", name: "Fayiz", total: 125000, balance: 125000, rate: 0, minPayment: 0, notes: "Personal loan", color: "#378ADD" },
          { id: "debt_005", name: "Azeezka", total: 20000, balance: 20000, rate: 0, minPayment: 0, notes: "Small personal debt — clear first (snowball)", color: "#1D9E75" },
          { id: "debt_006", name: "Kamru Zaman", total: 70000, balance: 70000, rate: 0, minPayment: 0, notes: "Personal debt", color: "#D85A30" },
          { id: "debt_007", name: "Ayishatha", total: 125000, balance: 125000, rate: 0, minPayment: 0, notes: "5,000 AED × 25 = ₹1,25,000", color: "#639922" },
          { id: "debt_008", name: "Mummy", total: 200000, balance: 200000, rate: 0, minPayment: 0, notes: "8,000 AED × 25 = ₹2,00,000", color: "#E24B4A" }
        ],
        goals: [
          { id: "goal_001", name: "Visa Fine", target: 400000, saved: 0, deadline: "2025-12-31" },
          { id: "goal_002", name: "Visa Processing Expenses", target: 175000, saved: 0, deadline: "2025-12-31" },
          { id: "goal_003", name: "Full Debt Freedom", target: 1579326, saved: 0, deadline: "2027-12-31" }
        ],
        accounts: [
          { id: "acc_001", name: "Primary Savings", institution: "Bank", type: "savings", currency: "INR", openingBalance: 0, color: "#1D9E75", createdAt: new Date().toISOString() },
          { id: "acc_002", name: "Cash Wallet", institution: "Cash", type: "cash", currency: "INR", openingBalance: 0, color: "#EF9F27", createdAt: new Date().toISOString() },
          { id: "acc_003", name: "UAE Account", institution: "UAE Bank", type: "current", currency: "AED", openingBalance: 0, color: "#378ADD", createdAt: new Date().toISOString() }
        ],
        settings: {
          currency: 'INR',
          secondaryCurrency: 'AED',
          aedToInr: 25,
          theme: 'dark',
          name: 'Your Name',
          accentColor: '#10b981',
          onboarded: true,
          migrated_real_data: true,
          apiKey: '',
        }
      })
    }),
    {
      name: 'financeOS_data',
    }
  )
);
