import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: number;
  nome: string;
  codigo: string;
  quantidade: number;
  tipo: string;
}

const initialItems: Item[] = [
  { id: 1, nome: "Filtro de Óleo", codigo: "FO-001", quantidade: 12, tipo: "Filtro" },
  { id: 2, nome: "Pastilha de Freio", codigo: "PF-002", quantidade: 8, tipo: "Freio" },
  { id: 3, nome: "Pneu 195/65R15", codigo: "PN-003", quantidade: 4, tipo: "Pneu" },
  { id: 4, nome: "Correia Dentada", codigo: "CD-004", quantidade: 0, tipo: "Motor" },
  { id: 5, nome: "Amortecedor Dianteiro", codigo: "AD-005", quantidade: 6, tipo: "Suspensão" },
  { id: 6, nome: "Vela de Ignição", codigo: "VI-006", quantidade: 20, tipo: "Motor" },
  { id: 7, nome: "Pneu 205/55R16", codigo: "PN-007", quantidade: 2, tipo: "Pneu" },
  { id: 8, nome: "Óleo Motor 5W30", codigo: "OM-008", quantidade: 15, tipo: "Lubrificante" },
];

const Estoque = () => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ nome: "", codigo: "", quantidade: 0, tipo: "" });
  const { toast } = useToast();

  const filtered = items.filter(
    (i) =>
      i.nome.toLowerCase().includes(search.toLowerCase()) ||
      i.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items.filter((i) => i.quantidade <= 2);

  const handleAdd = () => {
    if (!newItem.nome || !newItem.codigo) return;
    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({ nome: "", codigo: "", quantidade: 0, tipo: "" });
    setShowAdd(false);
    toast({ title: "Item adicionado ao estoque" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-glow-cyan">ESTOQUE & PNEUS</h2>
        <Button variant="neonCyan" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </div>

      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 glow-red">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="font-display font-bold text-destructive text-sm">ALERTAS DE ESTOQUE BAIXO</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="text-xs bg-destructive/20 text-destructive rounded-full px-3 py-1 font-semibold">
                {i.nome}: {i.quantidade} un.
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-neon w-full pl-10"
          placeholder="Buscar por nome ou código..."
        />
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-semibold">{item.nome}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{item.codigo}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.quantidade === 0
                        ? "bg-destructive/20 text-destructive"
                        : item.quantidade <= 5
                        ? "bg-secondary/20 text-secondary"
                        : "bg-neon-green/10 text-neon-green"
                    }`}>
                      {item.quantidade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{item.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-floating p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-4">NOVO ITEM</h3>
              <div className="space-y-3">
                <input value={newItem.nome} onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })} className="input-neon w-full" placeholder="Nome da peça" />
                <input value={newItem.codigo} onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })} className="input-neon w-full" placeholder="Código de referência" />
                <input value={newItem.quantidade} onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })} className="input-neon w-full" placeholder="Quantidade" type="number" />
                <input value={newItem.tipo} onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })} className="input-neon w-full" placeholder="Tipo (Pneu, Motor, etc.)" />
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
