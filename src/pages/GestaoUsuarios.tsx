import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Wrench, Camera, Pencil, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  login: string;
  nivel: string;
  status: string;
  avatar?: string;
}

const initialUsers: Usuario[] = [
  { id: 1, nome: "Carlos Silva", cpf: "123.456.789-00", login: "admin", nivel: "MASTER", status: "Online" },
  { id: 2, nome: "João Técnico", cpf: "987.654.321-00", login: "tecnico", nivel: "TÉCNICO", status: "Online" },
  { id: 3, nome: "Maria Santos", cpf: "111.222.333-44", login: "maria", nivel: "TÉCNICO", status: "Offline" },
  { id: 4, nome: "Pedro Supervisor", cpf: "555.666.777-88", login: "pedro", nivel: "SUPERVISOR", status: "Online" },
];

const GestaoUsuarios = () => {
  const [users, setUsers] = useState<Usuario[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ nome: "", cpf: "", login: "", senha: "", nivel: "TÉCNICO", avatar: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<Partial<Usuario> | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewUser({ ...newUser, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newUser.nome || !newUser.cpf || !newUser.login) return;
    setUsers([...users, {
      id: Date.now(),
      nome: newUser.nome,
      cpf: newUser.cpf,
      login: newUser.login,
      nivel: newUser.nivel,
      status: "Offline",
      avatar: newUser.avatar || undefined,
    }]);
    setNewUser({ nome: "", cpf: "", login: "", senha: "", nivel: "TÉCNICO", avatar: "" });
    setShowAdd(false);
    toast({ title: "Usuário cadastrado" });
  };

  const startEdit = (user: Usuario) => {
    setEditingId(user.id);
    setEditUser({ ...user });
  };

  const saveEdit = () => {
    if (!editUser || !editingId) return;
    setUsers(users.map((u) => (u.id === editingId ? { ...u, ...editUser } as Usuario : u)));
    setEditingId(null);
    setEditUser(null);
    toast({ title: "Usuário atualizado" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-glow-green">GESTÃO DE EQUIPE</h2>
        <Button variant="neonCyan" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-floating p-6">
          <h3 className="font-display text-lg font-bold text-primary mb-4">CADASTRAR USUÁRIO</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center overflow-hidden">
              {newUser.avatar ? (
                <img src={newUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <input ref={fotoRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFoto} />
              <Button variant="outline" size="sm" onClick={() => fotoRef.current?.click()}>
                <Camera className="w-4 h-4" />
                Capturar Foto
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Nome Completo</label>
              <input value={newUser.nome} onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })} className="input-neon w-full" placeholder="Nome" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">CPF</label>
              <input value={newUser.cpf} onChange={(e) => setNewUser({ ...newUser, cpf: e.target.value })} className="input-neon w-full" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Login</label>
              <input value={newUser.login} onChange={(e) => setNewUser({ ...newUser, login: e.target.value })} className="input-neon w-full" placeholder="Login" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Senha</label>
              <input type="password" value={newUser.senha} onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })} className="input-neon w-full" placeholder="Senha" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Nível de Acesso</label>
              <select value={newUser.nivel} onChange={(e) => setNewUser({ ...newUser, nivel: e.target.value })} className="input-neon w-full">
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
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center glow-green border border-primary/30 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nome} className="w-full h-full object-cover" />
                ) : user.nivel === "MASTER" ? (
                  <Shield className="w-5 h-5 text-primary" />
                ) : (
                  <Wrench className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editingId === user.id && editUser ? (
                  <div className="space-y-1">
                    <input value={editUser.nome || ""} onChange={(e) => setEditUser({ ...editUser, nome: e.target.value })} className="input-neon w-full text-xs py-1" />
                    <select value={editUser.nivel || ""} onChange={(e) => setEditUser({ ...editUser, nivel: e.target.value })} className="input-neon w-full text-xs py-1">
                      <option value="TÉCNICO">Técnico</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="MASTER">Master</option>
                    </select>
                    <Button variant="neonCyan" size="sm" onClick={saveEdit}>Salvar</Button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-foreground truncate">{user.nome}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{user.nivel}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.cpf}</p>
                  </>
                )}
              </div>
              {editingId !== user.id && (
                <button onClick={() => startEdit(user)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.status === "Online" ? "bg-primary" : "bg-muted-foreground"}`} />
              <span className={`text-xs font-semibold ${user.status === "Online" ? "text-primary" : "text-muted-foreground"}`}>
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
