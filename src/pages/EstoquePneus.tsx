import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Check, X, Trash2, CircleDot } from "lucide-react";
import { usePneus, type Pneu } from "@/hooks/usePneus";

const TIPOS_PNEU = ["Novo", "Recapado"] as const;

const MEDIDAS_COMUNS = [
  "295/80 R22.5",
  "275/80 R22.5",
  "215/75 R17.5",
  "235/75 R17.5",
  "11.00 R22.5",
  "12.00 R24",
  "1000 R20",
  "900 R20",
  "750 R16",
  "700 R16",
];

const EstoquePneus = () => {
  const { pneus, loading, addPneu, updatePneu, deletePneu } = usePneus();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Pneu>>({});
  const [newPneu, setNewPneu] = useState({ medida: "", numero_fogo: "", quantidade: 0, tipo: "Novo" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = pneus.filter(
    (p) =>
      p.medida.toLowerCase().includes(search.toLowerCase()) &&
      (filterTipo ? p.tipo === filterTipo : true)
  );

  

  const handleAdd = async () => {
    if (!newPneu.medida || !newPneu.tipo) return;
    const ok = await addPneu(newPneu);
    if (ok) {
      setNewPneu({ medida: "", numero_fogo: "", quantidade: 0, tipo: "Novo" });
      setShowAdd(false);
    }
  };

  const startEdit = (pneu: Pneu) => {
    setEditingId(pneu.id);
    setEditData({ medida: pneu.medida, numero_fogo: pneu.numero_fogo, quantidade: pneu.quantidade, tipo: pneu.tipo });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const ok = await updatePneu(editingId, editData);
    if (ok) {
      setEditingId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: string) => {
    await deletePneu(id);
    setConfirmDeleteId(null);
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando estoque de pneus...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CircleDot className="w-7 h-7 text-primary" />
          <h2 className="font-display text-2xl font-bold text-glow-green">ESTOQUE DE PNEUS</h2>
        </div>
        <Button variant="neonCyan" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Novo Pneu
        </Button>
      </div>




      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon w-full pl-10" placeholder="Buscar por medida..." />
        </div>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="input-neon min-w-[160px]">
          <option value="">Todos os Tipos</option>
          {TIPOS_PNEU.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Medida</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Nº Fogo</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Quantidade</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Tipo</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pneu) => (
                <tr key={pneu.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  {editingId === pneu.id ? (
                    <>
                      <td className="py-2 px-4">
                        <input value={editData.medida || ""} onChange={(e) => setEditData({ ...editData, medida: e.target.value })} className="input-neon w-full text-xs py-1" list="medidas-list" />
                      </td>
                      <td className="py-2 px-4">
                        <input value={editData.numero_fogo || ""} onChange={(e) => setEditData({ ...editData, numero_fogo: e.target.value })} className="input-neon w-full text-xs py-1" placeholder="Número de fogo" />
                      </td>
                      <td className="py-2 px-4">
                        <input type="number" value={editData.quantidade ?? 0} onChange={(e) => setEditData({ ...editData, quantidade: Number(e.target.value) })} className="input-neon w-20 text-xs py-1" />
                      </td>
                      <td className="py-2 px-4">
                        <select value={editData.tipo || ""} onChange={(e) => setEditData({ ...editData, tipo: e.target.value })} className="input-neon w-full text-xs py-1">
                          {TIPOS_PNEU.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4 flex gap-1">
                        <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                        <button onClick={cancelEdit} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-semibold font-mono">{pneu.medida}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{pneu.numero_fogo || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          pneu.quantidade === 0 ? "bg-destructive/20 text-destructive"
                            : pneu.quantidade <= 4 ? "bg-neon-amber/20 text-neon-amber"
                            : "bg-primary/10 text-primary"
                        }`}>{pneu.quantidade}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          pneu.tipo === "Novo" ? "bg-primary/10 text-primary" : "bg-neon-amber/10 text-neon-amber"
                        }`}>{pneu.tipo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(pneu)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === pneu.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(pneu.id)} className="text-destructive hover:text-destructive/80 text-xs font-bold">Confirmar</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground text-xs">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(pneu.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum pneu encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <datalist id="medidas-list">
        {MEDIDAS_COMUNS.map((m) => <option key={m} value={m} />)}
      </datalist>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card-floating p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold text-primary mb-4">NOVO PNEU</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Medida do Pneu</label>
                  <input value={newPneu.medida} onChange={(e) => setNewPneu({ ...newPneu, medida: e.target.value })} className="input-neon w-full" placeholder="Ex: 295/80 R22.5" list="medidas-list-add" />
                  <datalist id="medidas-list-add">
                    {MEDIDAS_COMUNS.map((m) => <option key={m} value={m} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Número de Fogo</label>
                  <input value={newPneu.numero_fogo} onChange={(e) => setNewPneu({ ...newPneu, numero_fogo: e.target.value })} className="input-neon w-full" placeholder="Digite o número de fogo" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Quantidade</label>
                  <input value={newPneu.quantidade} onChange={(e) => setNewPneu({ ...newPneu, quantidade: Number(e.target.value) })} className="input-neon w-full" placeholder="Quantidade" type="number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Tipo</label>
                  <select value={newPneu.tipo} onChange={(e) => setNewPneu({ ...newPneu, tipo: e.target.value })} className="input-neon w-full">
                    {TIPOS_PNEU.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="neonCyan" className="flex-1" onClick={handleAdd}>Salvar</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancelar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EstoquePneus;
