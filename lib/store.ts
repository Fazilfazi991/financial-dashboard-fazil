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
    theme: 'light' | 'dark';
    name: string;
    accentColor: string;
    onboarded: boolean;
    migrated_v3: boolean;
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
        theme: 'dark',
        name: 'User',
        accentColor: '#10b981',
        onboarded: false,
        migrated_v3: true,
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
    }),
    {
      name: 'financeOS_data',
    }
  )
);
