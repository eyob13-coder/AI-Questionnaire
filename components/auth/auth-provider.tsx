"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (isPending) {
      setLoading(true);
      return;
    }

    if (data) {
      // Data contains session and user objects
      setAuth(data.user as any, data.session as any);
    } else {
      setAuth(null, null);
    }
  }, [data, isPending, setAuth, setLoading]);

  return <>{children}</>;
}
