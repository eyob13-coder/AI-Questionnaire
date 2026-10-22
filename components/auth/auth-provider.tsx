"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useAuthStore, type User, type Session } from "@/lib/store/auth-store";

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
      setAuth(
        (data.user as unknown as User) || null,
        (data.session as unknown as Session) || null
      );
    } else {
      setAuth(null, null);
    }
  }, [data, isPending, setAuth, setLoading]);

  return <>{children}</>;
}
