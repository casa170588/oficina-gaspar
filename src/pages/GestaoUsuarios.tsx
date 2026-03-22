import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Usuario {
  id: number;
  nome: string;
  nivel: string;
  status: string;
}

const initialUsers: Usuario[] = [
  { id: 1, nome: "Carlos Silva", nivel: "MASTER", status: "Online" },
  { id: 2, nome: "João Técnico", nivel: "TÉCNICO", status: "Online" },
  { id: 3, nome: "Maria Santos", nivel: "TÉCNICO", status: "Offline" },
  { id: 4, nome: "Pedro Supervisor", nivel: "SUPERVISOR", status: "Online" },
];

const GestaoUsuarios = () => {
  const [users, setUsers] = useState<Usuario[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ nome: "", nivel: "TÉCNICO" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newUser.nome) return;
    setUsers([...users, { id: Date.now(), nome: newUser.nome, nivel: newUser.nivel, status: "Offline" }]);
    setNewUser({ nome: "", nivel: "TÉCNICO" });
    setShowAdd(false);
    toast({ title: "Usuário cadastrado" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-glow-cyan">GESTÃO DE USUÁRIOS</h2>
        <Button variant="neonCyan" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-floating p-6">
          <h3 className="font-display text-lg font-bold text-primary mb-4">CADASTRAR USUÁRIO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Nome Completo</label>
              <input value={newUser.nome} onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })} className="input-neon w-full" placeholder="Nome do usuário" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Nível de Acesso</label>
              <select
                value={newUser.nivel}
                onChange={(e) => setNewUser({ ...newUser, nivel: e.target.value })}
                className="input-neon w-full"
              >
                <option value="TÉCNICO">Técnico</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="MASTER">Master</option>
              </select>
            </div>
          </div>
          <Button variant="neonCyan" className="mt-4" onClick={handleAdd}>Cadastrar</Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-floating p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center glow-cyan">
                {user.nivel === "MASTER" ? <Shield className="w-5 h-5 text-primary" /> : <Wrench className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.nome}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{user.nivel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.status === "Online" ? "bg-neon-green" : "bg-muted-foreground"}`} />
              <span className={`text-xs font-semibold ${user.status === "Online" ? "text-neon-green" : "text-muted-foreground"}`}>
                {user.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GestaoUsuarios;
