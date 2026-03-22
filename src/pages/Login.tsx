import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wrench, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix-style background decoration */}
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
          {/* Avatar Circle */}
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
          <p className="text-muted-foreground mt-2 text-lg">Sistema de Gestão Elite</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-neon w-full"
              placeholder="Digite seu usuário"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-neon w-full"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="neonCyan" size="lg" className="w-full animate-glow-breathe">
            ENTRAR
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Demo: admin / admin123
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
