import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Lock, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      const ok = await signup(email, password, { nome, cpf, nivel: "TÉCNICO" });
      if (ok) {
        toast({ title: "Conta criada com sucesso!" });
        setIsSignup(false);
      } else {
        toast({ title: "Erro ao criar conta", variant: "destructive" });
      }
    } else {
      const ok = await login(email, password);
      if (ok) {
        navigate("/dashboard");
      } else {
        toast({ title: "Credenciais inválidas", variant: "destructive" });
      }
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
            {isSignup ? "Criar Conta" : "Sistema de Gestão Elite"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Nome Completo</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} className="input-neon w-full" placeholder="Nome completo" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">CPF</label>
                <input value={cpf} onChange={(e) => setCpf(e.target.value)} className="input-neon w-full" placeholder="000.000.000-00" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">E-mail</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-neon w-full pl-10" placeholder="email@exemplo.com" required />
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
            {isSignup ? <><UserPlus className="w-4 h-4" /> CRIAR CONTA</> : <><LogIn className="w-4 h-4" /> ENTRAR</>}
          </Button>
        </form>

        <button onClick={() => setIsSignup(!isSignup)} className="w-full text-center text-muted-foreground text-xs mt-6 hover:text-primary transition-colors">
          {isSignup ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
