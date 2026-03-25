import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Lock, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(usuario, password);
    if (ok) {
      navigate("/dashboard");
    } else {
      toast({ title: "Credenciais inválidas", description: "Use o nome cadastrado ou o login antigo.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(135 100% 50% / 0.03) 2px, hsl(135 100% 50% / 0.03) 4px)`,
          backgroundSize: '100% 4px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-floating p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/50 mb-4 glow-green"
          >
            <User className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground text-glow-green">
            OFICINA-BLU
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Sistema de Gestão Elite
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={usuario} onChange={(e) => setUsuario(e.target.value)} className="input-neon w-full pl-10" placeholder="Digite seu nome de acesso" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-neon w-full pl-10" placeholder="••••••••" required minLength={6} />
            </div>
          </div>

          <Button type="submit" variant="neonCyan" size="lg" className="w-full animate-glow-breathe">
            <><LogIn className="w-4 h-4" /> ENTRAR</>
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
