import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Wrench, Camera, Pencil, User, Trash2, X, Search, Check } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({ nome: "", cpf: "", login: "", senha: "", nivel: "TÉCNICO", avatar: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const editFotoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.cpf.includes(search) ||
      u.login.toLowerCase().includes(search.toLowerCase())
  );

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewUser({ ...newUser, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleEditFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editUser) {
      const reader = new FileReader();
      reader.onload = () => setEditUser({ ...editUser, avatar: reader.result as string });
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
    setUsers(users.map((u) => (u.id === editingId ? editUser : u)));
    setEditingId(null);
    setEditUser(null);
    toast({ title: "Usuário atualizado" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUser(null);
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDeleteId(null);
    toast({ title: "Usuário excluído" });
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-neon w-full pl-10"
          placeholder="Buscar por nome, CPF ou login..."
        />
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="card-floating p-6">
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
              <div className="flex gap-3 mt-4">
                <Button variant="neonCyan" onClick={handleAdd}>Cadastrar</Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Usuário</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">CPF</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Login</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Nível</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  {editingId === user.id && editUser ? (
                    <>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => editFotoRef.current?.click()}>
                            {editUser.avatar ? <img src={editUser.avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <input ref={editFotoRef} type="file" accept="image/*" className="hidden" onChange={handleEditFoto} />
                          <input value={editUser.nome} onChange={(e) => setEditUser({ ...editUser, nome: e.target.value })} className="input-neon text-xs py-1 flex-1" />
                        </div>
                      </td>
                      <td className="py-2 px-4"><input value={editUser.cpf} onChange={(e) => setEditUser({ ...editUser, cpf: e.target.value })} className="input-neon text-xs py-1 w-full font-mono" /></td>
                      <td className="py-2 px-4"><input value={editUser.login} onChange={(e) => setEditUser({ ...editUser, login: e.target.value })} className="input-neon text-xs py-1 w-full" /></td>
                      <td className="py-2 px-4">
                        <select value={editUser.nivel} onChange={(e) => setEditUser({ ...editUser, nivel: e.target.value })} className="input-neon text-xs py-1 w-full">
                          <option value="TÉCNICO">Técnico</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="MASTER">Master</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <div className={`w-2 h-2 rounded-full inline-block mr-1 ${user.status === "Online" ? "bg-primary" : "bg-muted-foreground"}`} />
                        <span className="text-xs">{user.status}</span>
                      </td>
                      <td className="py-2 px-4 flex gap-1">
                        <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                        <button onClick={cancelEdit} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.nome} className="w-full h-full object-cover" />
                            ) : user.nivel === "MASTER" ? (
                              <Shield className="w-4 h-4 text-primary" />
                            ) : (
                              <Wrench className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className="font-semibold">{user.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{user.cpf}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.login}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{user.nivel}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${user.status === "Online" ? "bg-primary" : "bg-muted-foreground"}`} />
                          <span className={`text-xs font-semibold ${user.status === "Online" ? "text-primary" : "text-muted-foreground"}`}>{user.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(user)} className="text-muted-foreground hover:text-primary transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === user.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deleteUser(user.id)} className="text-destructive hover:text-destructive/80 text-xs font-bold">Sim</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground hover:text-foreground text-xs">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(user.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default GestaoUsuarios;
