import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Wrench, Camera, Pencil, User, Trash2, X, Search, Check, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MODULOS = [
  { key: "dashboard", label: "Painel" },
  { key: "os-veiculo", label: "O.S. Veículo" },
  { key: "os-rastreamento", label: "O.S. Rastreamento" },
  { key: "gerenciar-os", label: "Gerenciar O.S." },
  { key: "estoque", label: "Estoque Peças" },
  { key: "estoque-pneus", label: "Estoque Pneus" },
  { key: "patio", label: "Pátio" },
  { key: "frota-fixa", label: "Frota Fixa" },
  { key: "usuarios", label: "Usuários" },
];

interface Usuario {
  id: string;
  user_id: string | null;
  nome: string;
  nivel: string;
  avatar_url: string | null;
  permissoes: string[];
}

const GestaoUsuarios = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({ nome: "", senha: "", nivel: "TÉCNICO", avatar: "", permissoes: MODULOS.map(m => m.key) });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<(Partial<Usuario> & { senha?: string }) | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const editFotoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    if (!error && data) {
      setUsers(data.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        nome: p.nome,
        nivel: p.nivel,
        avatar_url: p.avatar_url,
        permissoes: (p as any).permissoes || MODULOS.map(m => m.key),
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.nivel.toLowerCase().includes(search.toLowerCase())
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
      reader.onload = () => setEditUser({ ...editUser, avatar_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newUser.nome || !newUser.senha) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const { error } = await supabase.functions.invoke("user-management", {
      body: {
        action: "create",
        nome: newUser.nome,
        senha: newUser.senha,
        nivel: newUser.nivel,
        avatar_url: newUser.avatar || null,
        permissoes: newUser.permissoes,
      },
    });

    if (error) {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
      return;
    }

    setNewUser({ nome: "", senha: "", nivel: "TÉCNICO", avatar: "", permissoes: MODULOS.map(m => m.key) });
    setShowAdd(false);
    await fetchUsers();
    toast({ title: "Usuário cadastrado com sucesso!" });
  };

  const startEdit = (user: Usuario) => {
    setEditingId(user.id);
    setEditUser({ ...user });
  };

  const saveEdit = async () => {
    if (!editUser || !editingId) return;
    const { error } = await supabase.functions.invoke("user-management", {
      body: {
        action: "update",
        id: editingId,
        nome: editUser.nome,
        nivel: editUser.nivel,
        avatar_url: editUser.avatar_url,
        senha: editUser.senha,
        permissoes: editUser.permissoes,
      },
    });

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    setEditUser(null);
    await fetchUsers();
    toast({ title: "Usuário atualizado" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUser(null);
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.functions.invoke("user-management", {
      body: {
        action: "delete",
        id,
      },
    });

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setConfirmDeleteId(null);
    await fetchUsers();
    toast({ title: "Usuário excluído" });
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-glow-green">GESTÃO DE EQUIPE</h2>
        <Button variant="neonCyan" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon w-full pl-10" placeholder="Buscar por nome ou nível..." />
      </div>

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
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Nome</label>
                  <input value={newUser.nome} onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })} className="input-neon w-full" placeholder="Nome" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Senha</label>
                  <input type="password" value={newUser.senha} onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })} className="input-neon w-full" placeholder="Mínimo 6 caracteres" />
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
              <div className="mt-4">
                <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Permissões de Módulos</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MODULOS.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUser.permissoes.includes(m.key)}
                        onChange={(e) => {
                          const perms = e.target.checked
                            ? [...newUser.permissoes, m.key]
                            : newUser.permissoes.filter((p) => p !== m.key);
                          setNewUser({ ...newUser, permissoes: perms });
                        }}
                        className="accent-primary"
                      />
                      <span className="text-foreground">{m.label}</span>
                    </label>
                  ))}
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Usuário</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Nível</th>
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
                            {editUser.avatar_url ? <img src={editUser.avatar_url} alt="Avatar do usuário" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <input ref={editFotoRef} type="file" accept="image/*" className="hidden" onChange={handleEditFoto} />
                          <input value={editUser.nome || ""} onChange={(e) => setEditUser({ ...editUser, nome: e.target.value })} className="input-neon text-xs py-1 flex-1" />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <select value={editUser.nivel || ""} onChange={(e) => setEditUser({ ...editUser, nivel: e.target.value })} className="input-neon text-xs py-1 w-full">
                          <option value="TÉCNICO">Técnico</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="MASTER">Master</option>
                        </select>
                        <div className="relative mt-2">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input type="password" value={editUser.senha || ""} onChange={(e) => setEditUser({ ...editUser, senha: e.target.value })} className="input-neon text-xs py-1 w-full pl-8" placeholder="Nova senha (opcional)" />
                        </div>
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase">Permissões</p>
                          <div className="flex flex-wrap gap-1">
                            {MODULOS.map((m) => (
                              <label key={m.key} className="flex items-center gap-1 text-[10px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(editUser.permissoes || []).includes(m.key)}
                                  onChange={(e) => {
                                    const perms = e.target.checked
                                      ? [...(editUser.permissoes || []), m.key]
                                      : (editUser.permissoes || []).filter((p) => p !== m.key);
                                    setEditUser({ ...editUser, permissoes: perms });
                                  }}
                                  className="accent-primary w-3 h-3"
                                />
                                {m.label}
                              </label>
                            ))}
                          </div>
                        </div>
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
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                            ) : user.nivel === "MASTER" ? (
                              <Shield className="w-4 h-4 text-primary" />
                            ) : (
                              <Wrench className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className="font-semibold">{user.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{user.nivel}</span>
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
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default GestaoUsuarios;
