"use client";

import { useEffect, useState } from "react";
import { runMigration } from "@/lib/migration";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    runMigration();
    setMounted(true);
  }, []);

  // We always render children so Server Components (like the root redirect) execute properly.
  // The opacity trick prevents hydration flashes while still preserving the DOM tree.
  return (
    <div className={mounted ? "opacity-100" : "opacity-0"}>
      {children}
    </div>
  );
}
