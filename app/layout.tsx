import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/sidebar-nav";
import { ClientProvider } from "@/components/client-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "financeOS — Premium Finance Dashboard",
  description: "A world-class personal finance dashboard.",
};

import { CommandPalette } from "@/components/command-palette";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background min-h-screen")}>
        <ClientProvider>
          <div className="flex">
            <SidebarNav />
            <main className="flex-1 min-h-screen relative pb-32 lg:pb-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10 p-4 lg:p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <CommandPalette />
        </ClientProvider>
      </body>
    </html>
  );
}
