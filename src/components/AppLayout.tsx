import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Package, Users, LogOut } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { path: "/os-veiculo", label: "O.S. Veículo", icon: FileText },
  { path: "/estoque", label: "Estoque", icon: Package },
  { path: "/usuarios", label: "Usuários", icon: Users },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="font-display text-xl font-bold text-primary text-glow-cyan">OFICINA-BLU</h1>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 uppercase tracking-wider ${
                    active
                      ? "bg-primary/10 text-primary glow-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Logado como</p>
              <p className="text-sm font-semibold text-primary text-glow-cyan">
                {user?.name} <span className="text-secondary">({user?.level})</span>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-border/30 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-semibold transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
