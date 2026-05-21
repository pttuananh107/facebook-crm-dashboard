"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "admin" | "viewer";
  assigned_page_ids: string[];
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      console.log("[Auth] initializing...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Auth] session:", session?.user?.email ?? "none");
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(session.user);
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          console.log("[Auth] profile:", data?.role ?? "none", error?.message ?? "ok");
          if (mounted) setProfile(data as UserProfile | null);
        }
      } catch (err) {
        console.error("[Auth] init error:", err);
      } finally {
        if (mounted) {
          console.log("[Auth] done loading");
          setLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] state change:", event);
        if (!mounted) return;
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          if (mounted) setProfile(data as UserProfile | null);
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
