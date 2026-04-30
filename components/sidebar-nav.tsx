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
  { name: "Ledger", href: "/transactions", icon: ArrowLeftRight },
  { name: "Debts", href: "/debts", icon: TrendingDown },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Budget", href: "/budget", icon: PieChart },
  { name: "Goals", href: "/goals", icon: Target },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-md h-screen sticky top-0">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
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

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 px-6 pb-6 pt-3">
        <nav className="flex justify-between items-center max-w-md mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name === "Overview" ? "Home" : item.name}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Set</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
