import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertTriangle, Pencil, Check, X, Trash2 } from "lucide-react";
import { useEstoque, type ItemEstoque } from "@/hooks/useEstoque";
import { TIPOS_PECA } from "@/data/pecas";

const Estoque = () => {
  const { items, loading, addItem, updateItem, deleteItem } = useEstoque();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ItemEstoque>>({});
  const [newItem, setNewItem] = useState({ nome: "", codigo: "", quantidade: 0, tipo: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = items.filter(
    (i) =>
      (i.nome.toLowerCase().includes(search.toLowerCase()) ||
        i.codigo.toLowerCase().includes(search.toLowerCase())) &&
      (filterTipo ? i.tipo === filterTipo : true)
  );

  const lowStock = items.filter((i) => i.quantidade <= 2);

  const handleAdd = async () => {
    if (!newItem.nome || !newItem.codigo || !newItem.tipo) return;
    const ok = await addItem(newItem);
    if (ok) {
      setNewItem({ nome: "", codigo: "", quantidade: 0, tipo: "" });
      setShowAdd(false);
    }
  };

  const startEdit = (item: ItemEstoque) => {
    setEditingId(item.id);
    setEditData({ nome: item.nome, codigo: item.codigo, quantidade: item.quantidade, tipo: item.tipo });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const ok = await updateItem(editingId, editData);
    if (ok) {
      setEditingId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando estoque...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-glow-green">ESTOQUE & PEÇAS</h2>
        <Button variant="neonCyan" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </div>

      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 border border-primary/30 rounded-xl p-4 glow-green">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-primary text-sm">ALERTAS DE ESTOQUE BAIXO</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold">
                {i.nome}: {i.quantidade} un.
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon w-full pl-10" placeholder="Buscar por nome ou código..." />
        </div>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="input-neon min-w-[160px]">
          <option value="">Todos os Tipos</option>
          {TIPOS_PECA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Nome Peça</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Cód. Referência</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Quantidade</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Tipo</th>
                <th className="text-left py-3 px-4 text-muted-foreground uppercase tracking-wider text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  {editingId === item.id ? (
                    <>
                      <td className="py-2 px-4"><input value={editData.nome || ""} onChange={(e) => setEditData({ ...editData, nome: e.target.value })} className="input-neon w-full text-xs py-1" /></td>
                      <td className="py-2 px-4"><input value={editData.codigo || ""} onChange={(e) => setEditData({ ...editData, codigo: e.target.value })} className="input-neon w-full text-xs py-1 font-mono" /></td>
                      <td className="py-2 px-4"><input type="number" value={editData.quantidade ?? 0} onChange={(e) => setEditData({ ...editData, quantidade: Number(e.target.value) })} className="input-neon w-20 text-xs py-1" /></td>
                      <td className="py-2 px-4">
                        <select value={editData.tipo || ""} onChange={(e) => setEditData({ ...editData, tipo: e.target.value })} className="input-neon w-full text-xs py-1">
                          {TIPOS_PECA.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4 flex gap-1">
                        <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                        <button onClick={cancelEdit} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-semibold">{item.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{item.codigo}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.quantidade === 0 ? "bg-destructive/20 text-destructive"
                            : item.quantidade <= 5 ? "bg-neon-amber/20 text-neon-amber"
                            : "bg-primary/10 text-primary"
                        }`}>{item.quantidade}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{item.tipo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deleteItem(item.id)} className="text-destructive hover:text-destructive/80 text-xs font-bold">Confirmar</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground text-xs">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum item encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card-floating p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold text-primary mb-4">NOVO ITEM</h3>
              <div className="space-y-3">
                <input value={newItem.nome} onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })} className="input-neon w-full" placeholder="Nome da peça" />
                <input value={newItem.codigo} onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })} className="input-neon w-full" placeholder="Código de referência" />
                <input value={newItem.quantidade} onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })} className="input-neon w-full" placeholder="Quantidade" type="number" />
                <select value={newItem.tipo} onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })} className="input-neon w-full">
                  <option value="">Selecione o Tipo</option>
                  {TIPOS_PECA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
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

export default Estoque;
