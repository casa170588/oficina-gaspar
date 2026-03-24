import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OSVeiculo from "./pages/OSVeiculo";
import OSRastreamento from "./pages/OSRastreamento";
import GerenciarOS from "./pages/GerenciarOS";
import Estoque from "./pages/Estoque";
import EstoquePneus from "./pages/EstoquePneus";
import GestaoUsuarios from "./pages/GestaoUsuarios";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/os-veiculo" element={<OSVeiculo />} />
        <Route path="/os-rastreamento" element={<OSRastreamento />} />
        <Route path="/gerenciar-os" element={<GerenciarOS />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/usuarios" element={<GestaoUsuarios />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
