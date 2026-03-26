import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Package, Users, LogOut, Menu, X, User, Radar, ClipboardList, CircleDot, ParkingSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const allNavItems = [
  { path: "/dashboard", key: "dashboard", label: "Painel", icon: LayoutDashboard },
  { path: "/os-veiculo", key: "os-veiculo", label: "O.S. Veículo", icon: FileText },
  { path: "/os-rastreamento", key: "os-rastreamento", label: "O.S. Rastreamento", icon: Radar },
  { path: "/gerenciar-os", key: "gerenciar-os", label: "Gerenciar O.S.", icon: ClipboardList },
  { path: "/estoque", key: "estoque", label: "Estoque Peças", icon: Package },
  { path: "/estoque-pneus", key: "estoque-pneus", label: "Estoque Pneus", icon: CircleDot },
  { path: "/patio", key: "patio", label: "Pátio", icon: ParkingSquare },
  { path: "/usuarios", key: "usuarios", label: "Usuários", icon: Users },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
          >
            {/* User Profile Section */}
            <div className="p-5 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center glow-green overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider">{user?.level}</p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="px-5 py-4">
              <h1 className="font-display text-lg font-bold text-primary text-glow-green tracking-widest">OFICINA-BLU</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {allNavItems.filter((item) => {
                if (user?.level === "MASTER") return true;
                const perms = (user as any)?.permissoes as string[] | undefined;
                if (!perms || perms.length === 0) return true;
                return perms.includes(item.key);
              }).map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 uppercase tracking-wider ${
                      active
                        ? "bg-primary/10 text-primary glow-green"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-sidebar-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all duration-300 uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-30 h-14 flex items-center px-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:block">
              Logado como <span className="text-primary font-bold text-glow-green">{user?.name}</span>
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
