import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  cpf: string;
  level: string;
  avatar?: string;
  permissoes?: string[];
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, profile: { nome: string; cpf: string; nivel: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (sUser: SupabaseUser) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sUser.id)
      .maybeSingle();

    if (data) {
      setUser({
        id: sUser.id,
        name: data.nome,
        cpf: data.cpf,
        level: data.nivel,
        avatar: data.avatar_url || undefined,
        permissoes: (data as any).permissoes || undefined,
      });
    } else {
      // Create default profile only if none exists (unique constraint prevents duplicates)
      const nome = sUser.email?.split("@")[0] || "Usuário";
      const { data: newProfile } = await supabase.from("profiles").insert({
        user_id: sUser.id,
        nome,
        cpf: "",
        login: sUser.email || "",
        nivel: "TÉCNICO",
      }).select().maybeSingle();
      
      if (newProfile) {
        setUser({ id: sUser.id, name: newProfile.nome, cpf: newProfile.cpf, level: newProfile.nivel });
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadProfile(session.user);
      } else {
        setUser(null);
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    let resolvedLogin = identifier.trim();

    if (!resolvedLogin.includes("@")) {
      const { data: byLogin } = await supabase.from("profiles").select("login").eq("login", resolvedLogin).maybeSingle();

      if (byLogin?.login) {
        resolvedLogin = byLogin.login;
      } else {
        const { data: byName } = await supabase.from("profiles").select("login").ilike("nome", resolvedLogin).maybeSingle();
        if (byName?.login) resolvedLogin = byName.login;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email: resolvedLogin, password });
    return !error;
  };

  const signup = async (email: string, password: string, profile: { nome: string; cpf: string; nivel: string }): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return false;

    await supabase.from("profiles").insert({
      user_id: data.user.id,
      nome: profile.nome,
      cpf: profile.cpf,
      login: email,
      nivel: profile.nivel,
    });

    return true;
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
