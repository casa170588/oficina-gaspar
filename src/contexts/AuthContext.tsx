import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  cpf: string;
  level: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123", name: "Carlos Silva", cpf: "123.456.789-00", level: "MASTER" },
  { id: "2", username: "tecnico", password: "tec123", name: "João Técnico", cpf: "987.654.321-00", level: "TÉCNICO" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const found = MOCK_USERS.find((u) => u.username === username && u.password === password);
    if (found) {
      setUser({ id: found.id, name: found.name, cpf: found.cpf, level: found.level });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
