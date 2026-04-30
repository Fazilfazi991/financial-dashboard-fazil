"use client";

import { useEffect, useState } from "react";
import { runMigration } from "@/lib/migration";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    runMigration();
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
