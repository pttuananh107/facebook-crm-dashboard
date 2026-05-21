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
  status: string;
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

    // Đợi INITIAL_SESSION trước - đây là event quan trọng nhất
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("[Auth] event:", event, session?.user?.email ?? "none");

        if (event === "INITIAL_SESSION") {
          if (!session?.user) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          setUser(session.user);
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          if (mounted) {
            setProfile((data as unknown as UserProfile) ?? null);
            setLoading(false);
          }
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          if (mounted) {
            setProfile((data as unknown as UserProfile) ?? null);
            setLoading(false);
          }
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
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
