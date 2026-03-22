import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, FileDown, Plus, Trash2, ImageIcon, Search, AlertTriangle, Radar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initialItems, type ItemEstoque } from "@/data/pecas";
import jsPDF from "jspdf";

interface PecaUsada {
  nome: string;
  codigo: string;
  quantidade: number;
}

const OSRastreamento = () => {
  const { user } = useAuth();
  const [placa, setPlaca] = useState("");
  const [frota, setFrota] = useState("");
  const [descricao, setDescricao] = useState("");
  const [estoque, setEstoque] = useState<ItemEstoque[]>(initialItems);
  const [pecasUsadas, setPecasUsadas] = useState<PecaUsada[]>([]);
  const [showEstoqueAlert, setShowEstoqueAlert] = useState(false);
  const [buscaPeca, setBuscaPeca] = useState("");
  const [fotoPecaAntiga, setFotoPecaAntiga] = useState<string | null>(null);
  const [fotoPecaNova, setFotoPecaNova] = useState<string | null>(null);
  const inputFotoAntigaRef = useRef<HTMLInputElement>(null);
  const inputFotoNovaRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // FILTRO INTELIGENTE: apenas peças tipo "Rastreamento"
  const pecasRastreamento = estoque.filter((p) => p.tipo === "Rastreamento");

  const pecasFiltradas = pecasRastreamento.filter(
    (p) =>
      p.nome.toLowerCase().includes(buscaPeca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(buscaPeca.toLowerCase())
  );

  const addPeca = (peca: ItemEstoque) => {
    if (peca.quantidade <= 0) {
      setShowEstoqueAlert(true);
      setTimeout(() => setShowEstoqueAlert(false), 3000);
      return;
    }

    setEstoque((prev) =>
      prev.map((p) => (p.id === peca.id ? { ...p, quantidade: p.quantidade - 1 } : p))
    );

    const existing = pecasUsadas.find((p) => p.codigo === peca.codigo);
    if (existing) {
      setPecasUsadas(pecasUsadas.map((p) => (p.codigo === peca.codigo ? { ...p, quantidade: p.quantidade + 1 } : p)));
    } else {
      setPecasUsadas([...pecasUsadas, { nome: peca.nome, codigo: peca.codigo, quantidade: 1 }]);
    }
    toast({ title: `${peca.nome} adicionada` });
  };

  const removePeca = (codigo: string) => {
    const peca = pecasUsadas.find((p) => p.codigo === codigo);
    if (peca) {
      setEstoque((prev) =>
        prev.map((p) => (p.codigo === codigo ? { ...p, quantidade: p.quantidade + peca.quantidade } : p))
      );
    }
    setPecasUsadas(pecasUsadas.filter((p) => p.codigo !== codigo));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>, tipo: "antiga" | "nova") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (tipo === "antiga") setFotoPecaAntiga(reader.result as string);
        else setFotoPecaNova(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const gerarPDF = () => {
    if (!fotoPecaAntiga || !fotoPecaNova) {
      toast({ title: "Fotos obrigatórias!", description: "Adicione fotos da peça antiga e nova.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("OFICINA-BLU - O.S. Rastreamento", 20, 20);
    doc.setFontSize(12);
    doc.text(`Placa: ${placa}`, 20, 40);
    doc.text(`Frota: ${frota}`, 20, 50);
    doc.text(`Técnico: ${user?.name || ""}`, 20, 60);
    doc.text(`CPF: ${user?.cpf || ""}`, 20, 70);
    doc.text(`Descrição: ${descricao}`, 20, 80);
    doc.text("Peças de Rastreamento Utilizadas:", 20, 100);
    pecasUsadas.forEach((p, i) => {
      doc.text(`  - ${p.nome} [${p.codigo}] (x${p.quantidade})`, 20, 110 + i * 10);
    });

    const yFotos = 120 + pecasUsadas.length * 10;
    doc.text("Fotos:", 20, yFotos);
    doc.text("Peça Antiga:", 20, yFotos + 10);
    if (fotoPecaAntiga) doc.addImage(fotoPecaAntiga, "JPEG", 20, yFotos + 15, 70, 50);
    doc.text("Peça Nova:", 110, yFotos + 10);
    if (fotoPecaNova) doc.addImage(fotoPecaNova, "JPEG", 110, yFotos + 15, 70, 50);

    doc.save(`OS_Rastreamento_${placa || "sem-placa"}.pdf`);
    toast({ title: "PDF gerado com sucesso!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Radar className="w-7 h-7 text-primary" />
        <h2 className="font-display text-2xl font-bold text-glow-green">O.S. RASTREAMENTO</h2>
      </div>

      {/* Stock alert popup */}
      <AnimatePresence>
        {showEstoqueAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <div className="bg-card border-2 border-primary rounded-xl p-8 glow-green text-center max-w-sm">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="font-display text-xl font-bold text-primary mb-2">⚠ PEÇA DE RASTREAMENTO ESGOTADA!</p>
              <p className="text-muted-foreground">Esta peça não possui estoque disponível. O.S. bloqueada.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-floating p-6">
        <h3 className="font-display text-lg font-bold text-primary mb-4">IDENTIFICAÇÃO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Placa do Veículo</label>
            <input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="input-neon w-full" placeholder="ABC-1D23" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Número da Frota</label>
            <input value={frota} onChange={(e) => setFrota(e.target.value)} className="input-neon w-full" placeholder="FR-001" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Técnico Responsável</label>
            <div className="input-neon w-full opacity-70 cursor-not-allowed">{user?.name || "—"}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">CPF</label>
            <div className="input-neon w-full opacity-70 cursor-not-allowed">{user?.cpf || "—"}</div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">Descrição do Serviço</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-neon w-full min-h-[80px] resize-none" placeholder="Descreva o serviço de rastreamento realizado..." />
        </div>
      </motion.div>

      {/* Parts selection - RASTREAMENTO ONLY */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-floating p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-primary">PEÇAS DE RASTREAMENTO</h3>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <Radar className="w-3 h-3" />
            Filtro: Rastreamento
          </span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={buscaPeca}
            onChange={(e) => setBuscaPeca(e.target.value)}
            className="input-neon w-full pl-10"
            placeholder="Buscar peça por nome ou código de referência..."
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {pecasFiltradas.map((p) => (
            <button
              key={p.codigo}
              onClick={() => addPeca(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                p.quantidade > 0
                  ? "border-primary/30 text-primary hover:bg-primary/10 hover:glow-green"
                  : "border-destructive/30 text-destructive opacity-50 cursor-not-allowed"
              }`}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              {p.nome} [{p.codigo}] ({p.quantidade})
            </button>
          ))}
          {pecasFiltradas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma peça de rastreamento encontrada.</p>
          )}
        </div>

        {pecasUsadas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Peças selecionadas</h4>
            {pecasUsadas.map((p) => (
              <div key={p.codigo} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2">
                <span className="text-sm font-semibold">{p.nome} <span className="text-muted-foreground font-mono text-xs">[{p.codigo}]</span> <span className="text-muted-foreground">x{p.quantidade}</span></span>
                <button onClick={() => removePeca(p.codigo)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dual Photo System */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-floating p-6">
        <h3 className="font-display text-lg font-bold text-primary mb-4">PROVA VISUAL (OBRIGATÓRIO)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input ref={inputFotoAntigaRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFoto(e, "antiga")} />
            <Button variant="neonCyan" className="w-full mb-3" onClick={() => inputFotoAntigaRef.current?.click()}>
              <Camera className="w-4 h-4" />
              FOTO: PEÇA ANTIGA
            </Button>
            {fotoPecaAntiga ? (
              <div className="rounded-lg overflow-hidden border border-border/50 aspect-video">
                <img src={fotoPecaAntiga} alt="Peça antiga" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/50 aspect-video flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div>
            <input ref={inputFotoNovaRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFoto(e, "nova")} />
            <Button variant="neonCyan" className="w-full mb-3" onClick={() => inputFotoNovaRef.current?.click()}>
              <Camera className="w-4 h-4" />
              FOTO: PEÇA NOVA
            </Button>
            {fotoPecaNova ? (
              <div className="rounded-lg overflow-hidden border border-border/50 aspect-video">
                <img src={fotoPecaNova} alt="Peça nova" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/50 aspect-video flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="neonMagenta" size="lg" onClick={gerarPDF}>
          <FileDown className="w-4 h-4" />
          Gerar PDF de Serviço
        </Button>
      </div>
    </div>
  );
};

export default OSRastreamento;
