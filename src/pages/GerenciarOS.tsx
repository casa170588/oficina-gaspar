import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Eye, Trash2, X, FileText, Radar, ChevronDown, Pencil, Check } from "lucide-react";
import { useOrdensServico, type OrdemServico } from "@/hooks/useOrdensServico";

type OSStatus = "Aberta" | "Em andamento" | "Concluída" | "Cancelada";
const STATUS_OPTIONS: OSStatus[] = ["Aberta", "Em andamento", "Concluída", "Cancelada"];

const statusColor: Record<string, string> = {
  "Aberta": "bg-neon-amber/20 text-neon-amber",
  "Em andamento": "bg-secondary/20 text-secondary",
  "Concluída": "bg-primary/20 text-primary",
  "Cancelada": "bg-destructive/20 text-destructive",
};

const GerenciarOS = () => {
  const { osList, loading, updateStatus, updateOS, deleteOS } = useOrdensServico();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [viewOS, setViewOS] = useState<OrdemServico | null>(null);
  const [editStatusId, setEditStatusId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OrdemServico>>({});

  const filtered = osList.filter((os) => {
    const matchSearch =
      os.placa.toLowerCase().includes(search.toLowerCase()) ||
      os.frota.toLowerCase().includes(search.toLowerCase()) ||
      os.tecnico_nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? os.status === filterStatus : true;
    const matchTipo = filterTipo ? os.tipo === filterTipo : true;
    return matchSearch && matchStatus && matchTipo;
  });

  const handleUpdateStatus = async (id: string, status: OSStatus) => {
    await updateStatus(id, status);
    setEditStatusId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteOS(id);
  };

  const startEdit = (os: OrdemServico) => {
    setEditingId(os.id);
    setEditData({
      placa: os.placa,
      frota: os.frota,
      tecnico_nome: os.tecnico_nome,
      tecnico_cpf: os.tecnico_cpf,
      descricao: os.descricao,
      tipo: os.tipo,
      status: os.status,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const ok = await updateOS(editingId, editData);
    if (ok) {
      setEditingId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando O.S....</div>;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-glow-green">GERENCIAR O.S.</h2>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon w-full pl-10" placeholder="Buscar por placa, frota ou técnico..." />
        </div>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="input-neon min-w-[140px]">
          <option value="">Todos os Tipos</option>
          <option value="Veículo">Veículo</option>
          <option value="Rastreamento">Rastreamento</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-neon min-w-[150px]">
          <option value="">Todos os Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Tipo</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Placa</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Frota</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Técnico</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Data</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((os) => (
                <tr key={os.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  {editingId === os.id ? (
                    <>
                      <td className="py-2 px-4">
                        <select value={editData.tipo || ""} onChange={(e) => setEditData({ ...editData, tipo: e.target.value })} className="input-neon text-xs py-1 w-full">
                          <option value="Veículo">Veículo</option>
                          <option value="Rastreamento">Rastreamento</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input value={editData.placa || ""} onChange={(e) => setEditData({ ...editData, placa: e.target.value.toUpperCase() })} className="input-neon text-xs py-1 w-full font-mono" />
                      </td>
                      <td className="py-2 px-4">
                        <input value={editData.frota || ""} onChange={(e) => setEditData({ ...editData, frota: e.target.value })} className="input-neon text-xs py-1 w-full" />
                      </td>
                      <td className="py-2 px-4">
                        <input value={editData.tecnico_nome || ""} onChange={(e) => setEditData({ ...editData, tecnico_nome: e.target.value })} className="input-neon text-xs py-1 w-full" />
                      </td>
                      <td className="py-2 px-4 text-muted-foreground text-xs">{new Date(os.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="py-2 px-4">
                        <select value={editData.status || ""} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="input-neon text-xs py-1 w-full">
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                          <button onClick={cancelEdit} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          {os.tipo === "Rastreamento" ? <Radar className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-secondary" />}
                          {os.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono">{os.placa}</td>
                      <td className="py-3 px-4 text-muted-foreground">{os.frota}</td>
                      <td className="py-3 px-4">{os.tecnico_nome}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(os.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4">
                        {editStatusId === os.id ? (
                          <select
                            value={os.status}
                            onChange={(e) => handleUpdateStatus(os.id, e.target.value as OSStatus)}
                            onBlur={() => setEditStatusId(null)}
                            autoFocus
                            className="input-neon text-xs py-1 w-full"
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <button onClick={() => setEditStatusId(os.id)} className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[os.status] || ""} cursor-pointer hover:opacity-80 flex items-center gap-1`}>
                            {os.status}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(os)} className="text-muted-foreground hover:text-primary transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setViewOS(os)} className="text-muted-foreground hover:text-primary transition-colors" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(os.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma O.S. encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewOS && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4" onClick={() => setViewOS(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card-floating p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-primary">DETALHES DA O.S.</h3>
                <button onClick={() => setViewOS(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[viewOS.status] || ""}`}>{viewOS.status}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    {viewOS.tipo === "Rastreamento" ? <Radar className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {viewOS.tipo}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Placa</span>
                    <p className="font-bold font-mono">{viewOS.placa}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Frota</span>
                    <p className="font-semibold">{viewOS.frota}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Técnico</span>
                    <p className="font-semibold">{viewOS.tecnico_nome}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">CPF</span>
                    <p className="font-mono text-xs">{viewOS.tecnico_cpf}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Data</span>
                    <p className="font-semibold">{new Date(viewOS.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descrição</span>
                  <p className="text-sm mt-1 bg-muted/30 rounded-lg p-3">{viewOS.descricao}</p>
                </div>

                {viewOS.pecas.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Peças Utilizadas</span>
                    <div className="space-y-1 mt-1">
                      {viewOS.pecas.map((p) => (
                        <div key={p.codigo} className="flex justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm">
                          <span className="font-semibold">{p.nome} <span className="text-muted-foreground font-mono text-xs">[{p.codigo}]</span></span>
                          <span className="text-muted-foreground">x{p.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full mt-5" onClick={() => setViewOS(null)}>Fechar</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GerenciarOS;
