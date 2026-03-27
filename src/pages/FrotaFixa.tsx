import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Check, X, Trash2, Truck, FileDown, Upload, FileText } from "lucide-react";
import { useFrotaFixa, type VeiculoFrota } from "@/hooks/useFrotaFixa";
import jsPDF from "jspdf";

const FILIAIS = ["BLU", "JVL", "FLN"] as const;

const FrotaFixa = () => {
  const { veiculos, loading, addVeiculo, updateVeiculo, deleteVeiculo, uploadDocumento } = useFrotaFixa();
  const [search, setSearch] = useState("");
  const [filterFilial, setFilterFilial] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<VeiculoFrota>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newV, setNewV] = useState({
    filial: "BLU", placa: "", frota: "", marca: "", modelo: "", ano: "", cor: "", chassi: "", renavam: "", observacoes: "", documento_url: null as string | null,
  });
  const docRef = useRef<HTMLInputElement>(null);
  const editDocRef = useRef<HTMLInputElement>(null);

  const filtered = veiculos.filter((v) => {
    const matchSearch = v.placa.toLowerCase().includes(search.toLowerCase()) || v.frota.toLowerCase().includes(search.toLowerCase()) || v.marca.toLowerCase().includes(search.toLowerCase());
    const matchFilial = !filterFilial || v.filial === filterFilial;
    return matchSearch && matchFilial;
  });

  const handleAdd = async () => {
    if (!newV.placa || !newV.frota) return;
    const ok = await addVeiculo(newV);
    if (ok) {
      setNewV({ filial: "BLU", placa: "", frota: "", marca: "", modelo: "", ano: "", cor: "", chassi: "", renavam: "", observacoes: "", documento_url: null });
    }
  };

  const startEdit = (v: VeiculoFrota) => { setEditingId(v.id); setEditData({ ...v }); };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateVeiculo(editingId, editData);
    setEditingId(null);
  };

  const handleEditDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingId) {
      await uploadDocumento(editingId, file);
    }
  };

  const gerarPDF = (v: VeiculoFrota) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("FICHA DO VEÍCULO - FROTA FIXA", 20, 20);
    doc.setFontSize(12);
    const fields = [
      ["Filial", v.filial], ["Placa", v.placa], ["Frota", v.frota],
      ["Marca", v.marca], ["Modelo", v.modelo], ["Ano", v.ano],
      ["Cor", v.cor], ["Chassi", v.chassi], ["Renavam", v.renavam],
      ["Observações", v.observacoes],
    ];
    let y = 35;
    fields.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "—", 70, y);
      y += 8;
    });
    doc.save(`veiculo_${v.placa}.pdf`);
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando frota...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-primary" />
          <h2 className="font-display text-2xl font-bold text-glow-green">FROTA FIXA</h2>
        </div>
        <Button variant="neonCyan" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Novo Veículo</Button>
      </div>

      {/* Filial tabs */}
      <div className="flex gap-2">
        <button onClick={() => setFilterFilial("")} className={`px-4 py-2 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all ${!filterFilial ? "border-primary bg-primary/20 text-primary glow-green" : "border-primary/30 text-primary/60 hover:bg-primary/10"}`}>Todas</button>
        {FILIAIS.map((f) => (
          <button key={f} onClick={() => setFilterFilial(f)} className={`px-4 py-2 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all ${filterFilial === f ? "border-primary bg-primary/20 text-primary glow-green" : "border-primary/30 text-primary/60 hover:bg-primary/10"}`}>{f}</button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon w-full pl-10" placeholder="Buscar por placa, frota ou marca..." />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="px-3 py-3 text-left">Filial</th>
              <th className="px-3 py-3 text-left">Placa</th>
              <th className="px-3 py-3 text-left">Frota</th>
              <th className="px-3 py-3 text-left">Marca</th>
              <th className="px-3 py-3 text-left">Modelo</th>
              <th className="px-3 py-3 text-left">Ano</th>
              <th className="px-3 py-3 text-left">Chassi</th>
              <th className="px-3 py-3 text-left">Doc</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                {editingId === v.id ? (
                  <>
                    <td className="px-3 py-2">
                      <select className="input-neon text-xs w-full" value={editData.filial} onChange={(e) => setEditData({ ...editData, filial: e.target.value })}>
                        {FILIAIS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.placa || ""} onChange={(e) => setEditData({ ...editData, placa: e.target.value.toUpperCase() })} /></td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.frota || ""} onChange={(e) => setEditData({ ...editData, frota: e.target.value })} /></td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.marca || ""} onChange={(e) => setEditData({ ...editData, marca: e.target.value })} /></td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.modelo || ""} onChange={(e) => setEditData({ ...editData, modelo: e.target.value })} /></td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.ano || ""} onChange={(e) => setEditData({ ...editData, ano: e.target.value })} /></td>
                    <td className="px-3 py-2"><input className="input-neon w-full text-xs" value={editData.chassi || ""} onChange={(e) => setEditData({ ...editData, chassi: e.target.value })} /></td>
                    <td className="px-3 py-2">
                      <input ref={editDocRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleEditDoc} />
                      <button onClick={() => editDocRef.current?.click()} className="text-primary hover:text-primary/80"><Upload className="w-4 h-4" /></button>
                    </td>
                    <td className="px-3 py-2 text-right flex gap-1 justify-end">
                      <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{v.filial}</span></td>
                    <td className="px-3 py-3 font-mono font-bold">{v.placa}</td>
                    <td className="px-3 py-3">{v.frota}</td>
                    <td className="px-3 py-3">{v.marca}</td>
                    <td className="px-3 py-3">{v.modelo}</td>
                    <td className="px-3 py-3">{v.ano}</td>
                    <td className="px-3 py-3 font-mono text-xs">{v.chassi || "—"}</td>
                    <td className="px-3 py-3">
                      {v.documento_url ? (
                        <a href={v.documento_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80"><FileText className="w-4 h-4" /></a>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => gerarPDF(v)} className="text-primary hover:text-primary/80" title="Gerar PDF"><FileDown className="w-4 h-4" /></button>
                        <button onClick={() => startEdit(v)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(v.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Nenhum veículo encontrado</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Add Modal - stays open for batch */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-floating p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-primary">CADASTRAR VEÍCULO NA FROTA</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Filial</label>
                  <div className="flex gap-2">
                    {FILIAIS.map((f) => (
                      <button key={f} onClick={() => setNewV({ ...newV, filial: f })} className={`px-4 py-2 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all ${newV.filial === f ? "border-primary bg-primary/20 text-primary glow-green" : "border-primary/30 text-primary/60 hover:bg-primary/10"}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Placa</label><input className="input-neon w-full" value={newV.placa} onChange={(e) => setNewV({ ...newV, placa: e.target.value.toUpperCase() })} placeholder="ABC-1D23" /></div>
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Frota</label><input className="input-neon w-full" value={newV.frota} onChange={(e) => setNewV({ ...newV, frota: e.target.value })} placeholder="FR-001" /></div>
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Marca</label><input className="input-neon w-full" value={newV.marca} onChange={(e) => setNewV({ ...newV, marca: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Modelo</label><input className="input-neon w-full" value={newV.modelo} onChange={(e) => setNewV({ ...newV, modelo: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Ano</label><input className="input-neon w-full" value={newV.ano} onChange={(e) => setNewV({ ...newV, ano: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Cor</label><input className="input-neon w-full" value={newV.cor} onChange={(e) => setNewV({ ...newV, cor: e.target.value })} /></div>
                </div>
                <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Chassi</label><input className="input-neon w-full" value={newV.chassi} onChange={(e) => setNewV({ ...newV, chassi: e.target.value })} /></div>
                <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Renavam</label><input className="input-neon w-full" value={newV.renavam} onChange={(e) => setNewV({ ...newV, renavam: e.target.value })} /></div>
                <div><label className="block text-xs font-semibold text-primary mb-1 uppercase">Observações</label><textarea className="input-neon w-full min-h-[50px] resize-none" value={newV.observacoes} onChange={(e) => setNewV({ ...newV, observacoes: e.target.value })} /></div>
                <Button variant="neonCyan" className="w-full" onClick={handleAdd}><Plus className="w-4 h-4" /> Cadastrar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-floating p-6 text-center max-w-sm">
              <p className="font-display text-lg font-bold text-destructive mb-4">Remover veículo da frota?</p>
              <div className="flex gap-3 justify-center">
                <Button variant="destructive" onClick={async () => { await deleteVeiculo(confirmDeleteId); setConfirmDeleteId(null); }}>Sim, remover</Button>
                <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FrotaFixa;
