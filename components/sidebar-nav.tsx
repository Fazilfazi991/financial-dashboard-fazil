"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  TrendingDown, 
  TrendingUp, 
  Kanban, 
  PieChart, 
  Target, 
  BarChart3, 
  Flame, 
  LineChart, 
  Bot, 
  Settings 
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Debts", href: "/debts", icon: TrendingDown },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Budget", href: "/budget", icon: PieChart },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Forecast", href: "/forecast", icon: BarChart3 },
  { name: "Heatmap", href: "/heatmap", icon: Flame },
  { name: "Net Worth", href: "/net-worth", icon: LineChart },
  { name: "AI Advisor", href: "/ai", icon: Bot },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-md h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            finance<span className="text-primary">OS</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-border/50">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200",
            pathname === "/settings" && "bg-secondary text-foreground"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
