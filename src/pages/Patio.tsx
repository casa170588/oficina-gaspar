import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, X, Check, Truck, ParkingSquare, CalendarDays, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { usePatio, VeiculoPatio } from "@/hooks/usePatio";
import { format } from "date-fns";

const TIPO_VEICULO = ["Carreta", "Bitren"] as const;
const EIXOS = ["2 Eixos", "3 Eixos"] as const;
const CARGA = ["Carregada", "Vazia"] as const;
const SITUACAO = ["Livre", "Bloqueada"] as const;

interface NeonBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: "green" | "red" | "amber";
}

const NeonBtn = ({ label, active, onClick, color = "green" }: NeonBtnProps) => {
  const colors = {
    green: active ? "border-primary bg-primary/20 text-primary glow-green" : "border-primary/30 text-primary/60 hover:bg-primary/10",
    red: active ? "border-destructive bg-destructive/20 text-destructive" : "border-destructive/30 text-destructive/60 hover:bg-destructive/10",
    amber: active ? "border-neon-amber bg-neon-amber/20 text-neon-amber" : "border-neon-amber/30 text-neon-amber/60 hover:bg-neon-amber/10",
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${colors[color]}`}>
      {label}
    </button>
  );
};

const situacaoColor: Record<string, string> = {
  Livre: "bg-primary/20 text-primary border-primary/30",
  Bloqueada: "bg-destructive/20 text-destructive border-destructive/30",
};

const Patio = () => {
  const { veiculos, loading, addVeiculo, updateVeiculo, deleteVeiculo } = usePatio();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<VeiculoPatio>>({});
  const [newV, setNewV] = useState({
    placa: "", frota: "", tipo_veiculo: "Carreta", eixos: "2 Eixos", carga: "Vazia", situacao: "Livre", motivo_bloqueio: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filtered = veiculos.filter((v) => {
    const matchSearch = v.placa.toLowerCase().includes(search.toLowerCase()) || v.frota.toLowerCase().includes(search.toLowerCase());
    const vDate = v.created_at ? v.created_at.substring(0, 10) : "";
    const matchDate = !selectedDate || vDate === selectedDate;
    return matchSearch && matchDate;
  });

  const stats = {
    total: veiculos.length,
    livres: veiculos.filter((v) => v.situacao === "Livre").length,
    bloqueadas: veiculos.filter((v) => v.situacao === "Bloqueada").length,
    carretas: veiculos.filter((v) => v.tipo_veiculo === "Carreta").length,
    bitrens: veiculos.filter((v) => v.tipo_veiculo === "Bitren").length,
    carregadas: veiculos.filter((v) => v.carga === "Carregada").length,
    vazias: veiculos.filter((v) => v.carga === "Vazia").length,
  };

  const handleAdd = async () => {
    if (!newV.placa || !newV.frota) return;
    await addVeiculo(newV);
    setNewV({ placa: "", frota: "", tipo_veiculo: "Carreta", eixos: "2 Eixos", carga: "Vazia", situacao: "Livre", motivo_bloqueio: "" });
    // Modal stays open for batch registrations
  };

  const startEdit = (v: VeiculoPatio) => {
    setEditingId(v.id);
    setEditData({ ...v });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateVeiculo(editingId, editData);
    setEditingId(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE PÁTIO", 20, 15);
    doc.setFontSize(10);
    doc.text(`Data: ${selectedDate || "Todos"}`, 20, 22);
    let y = 30;
    doc.setFont("helvetica", "bold");
    doc.text("Placa", 15, y); doc.text("Frota", 40, y); doc.text("Tipo", 65, y); doc.text("Eixos", 95, y); doc.text("Carga", 120, y); doc.text("Situação", 148, y); doc.text("Motivo", 175, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    filtered.forEach((v) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(v.placa, 15, y); doc.text(v.frota, 40, y); doc.text(v.tipo_veiculo, 65, y); doc.text(v.eixos, 95, y); doc.text(v.carga, 120, y); doc.text(v.situacao, 148, y); doc.text(v.motivo_bloqueio || "", 175, y);
      y += 6;
    });
    doc.save(`patio_${selectedDate || "todos"}.pdf`);
  };

  const exportCSV = () => {
    const headers = "Placa,Frota,Tipo,Eixos,Carga,Situação,Motivo\n";
    const rows = filtered.map((v) => `${v.placa},${v.frota},${v.tipo_veiculo},${v.eixos},${v.carga},${v.situacao},${v.motivo_bloqueio || ""}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `patio_${selectedDate || "todos"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ParkingSquare className="w-7 h-7 text-primary" />
        <h2 className="font-display text-2xl font-bold text-glow-green">PÁTIO</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Livres", value: stats.livres },
          { label: "Bloqueadas", value: stats.bloqueadas },
          { label: "Carregadas", value: stats.carregadas },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-floating p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Date filter + Search + Add */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-neon text-sm" />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="text-xs text-muted-foreground hover:text-foreground">Todos</button>
          )}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-neon flex-1 min-w-[150px]" placeholder="Buscar por placa ou frota..." />
        <Button variant="neonCyan" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Cadastrar</Button>
        <Button variant="outline" onClick={exportPDF}><FileDown className="w-4 h-4" /> PDF</Button>
        <Button variant="outline" onClick={exportCSV}><FileDown className="w-4 h-4" /> CSV</Button>
      </div>

      {/* Vehicles Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Placa</th>
              <th className="px-4 py-3 text-left">Frota</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Eixos</th>
              <th className="px-4 py-3 text-left">Carga</th>
              <th className="px-4 py-3 text-left">Situação</th>
              <th className="px-4 py-3 text-left">Motivo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                {editingId === v.id ? (
                  <>
                    <td className="px-4 py-2"><input className="input-neon w-full text-xs" value={editData.placa || ""} onChange={(e) => setEditData({ ...editData, placa: e.target.value.toUpperCase() })} /></td>
                    <td className="px-4 py-2"><input className="input-neon w-full text-xs" value={editData.frota || ""} onChange={(e) => setEditData({ ...editData, frota: e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <select className="input-neon text-xs" value={editData.tipo_veiculo} onChange={(e) => setEditData({ ...editData, tipo_veiculo: e.target.value })}>
                        {TIPO_VEICULO.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="input-neon text-xs" value={editData.eixos} onChange={(e) => setEditData({ ...editData, eixos: e.target.value })}>
                        {EIXOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="input-neon text-xs" value={editData.carga} onChange={(e) => setEditData({ ...editData, carga: e.target.value })}>
                        {CARGA.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className="input-neon text-xs" value={editData.situacao} onChange={(e) => setEditData({ ...editData, situacao: e.target.value })}>
                        {SITUACAO.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      {editData.situacao === "Bloqueada" && (
                        <input className="input-neon w-full text-xs" placeholder="Motivo..." value={editData.motivo_bloqueio || ""} onChange={(e) => setEditData({ ...editData, motivo_bloqueio: e.target.value })} />
                      )}
                    </td>
                    <td className="px-4 py-2 text-right flex gap-1 justify-end">
                      <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono font-bold">{v.placa}</td>
                    <td className="px-4 py-3">{v.frota}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Truck className="w-3 h-3" />{v.tipo_veiculo}</span></td>
                    <td className="px-4 py-3">{v.eixos}</td>
                    <td className="px-4 py-3">{v.carga}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${situacaoColor[v.situacao] || ""}`}>{v.situacao}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{v.situacao === "Bloqueada" ? v.motivo_bloqueio || "—" : ""}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => startEdit(v)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(v.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum veículo no pátio</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-floating p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-primary">CADASTRAR NO PÁTIO</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Placa</label>
                    <input className="input-neon w-full" value={newV.placa} onChange={(e) => setNewV({ ...newV, placa: e.target.value.toUpperCase() })} placeholder="ABC-1D23" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Frota</label>
                    <input className="input-neon w-full" value={newV.frota} onChange={(e) => setNewV({ ...newV, frota: e.target.value })} placeholder="FR-001" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Tipo de Veículo</label>
                  <div className="flex gap-2">
                    {TIPO_VEICULO.map((t) => <NeonBtn key={t} label={t} active={newV.tipo_veiculo === t} onClick={() => setNewV({ ...newV, tipo_veiculo: t })} />)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Eixos</label>
                  <div className="flex gap-2">
                    {EIXOS.map((e) => <NeonBtn key={e} label={e} active={newV.eixos === e} onClick={() => setNewV({ ...newV, eixos: e })} />)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Carga</label>
                  <div className="flex gap-2">
                    {CARGA.map((c) => <NeonBtn key={c} label={c} active={newV.carga === c} onClick={() => setNewV({ ...newV, carga: c })} color="amber" />)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Situação</label>
                  <div className="flex gap-2">
                    <NeonBtn label="Livre" active={newV.situacao === "Livre"} onClick={() => setNewV({ ...newV, situacao: "Livre", motivo_bloqueio: "" })} />
                    <NeonBtn label="Bloqueada" active={newV.situacao === "Bloqueada"} onClick={() => setNewV({ ...newV, situacao: "Bloqueada" })} color="red" />
                  </div>
                </div>

                {newV.situacao === "Bloqueada" && (
                  <div>
                    <label className="block text-xs font-semibold text-destructive mb-1 uppercase tracking-wider">Motivo do Bloqueio</label>
                    <textarea className="input-neon w-full min-h-[60px] resize-none border-destructive/50" value={newV.motivo_bloqueio} onChange={(e) => setNewV({ ...newV, motivo_bloqueio: e.target.value })} placeholder="Descreva o motivo..." />
                  </div>
                )}

                <Button variant="neonCyan" className="w-full" onClick={handleAdd}>
                  <Plus className="w-4 h-4" /> Cadastrar Veículo
                </Button>
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
              <p className="font-display text-lg font-bold text-destructive mb-4">Remover do Pátio?</p>
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

export default Patio;
