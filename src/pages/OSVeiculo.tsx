import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, FileDown, Plus, Trash2, ImageIcon, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEstoque } from "@/hooks/useEstoque";
import { useOrdensServico } from "@/hooks/useOrdensServico";
import jsPDF from "jspdf";

interface PecaUsada {
  id: string;
  nome: string;
  codigo: string;
  quantidade: number;
}

const OSVeiculo = () => {
  const { user, supabaseUser } = useAuth();
  const { items, decrementStock, incrementStock } = useEstoque();
  const { createOS } = useOrdensServico();
  const [placa, setPlaca] = useState("");
  const [frota, setFrota] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pecasUsadas, setPecasUsadas] = useState<PecaUsada[]>([]);
  const [showEstoqueAlert, setShowEstoqueAlert] = useState(false);
  const [buscaPeca, setBuscaPeca] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const pecasFiltradas = items.filter(
    (p) => p.nome.toLowerCase().includes(buscaPeca.toLowerCase()) || p.codigo.toLowerCase().includes(buscaPeca.toLowerCase())
  );

  const addPeca = async (peca: typeof items[0]) => {
    if (peca.quantidade <= 0) {
      setShowEstoqueAlert(true);
      setTimeout(() => setShowEstoqueAlert(false), 3000);
      return;
    }
    const ok = await decrementStock(peca.id);
    if (!ok) return;
    const existing = pecasUsadas.find((p) => p.codigo === peca.codigo);
    if (existing) {
      setPecasUsadas(pecasUsadas.map((p) => (p.codigo === peca.codigo ? { ...p, quantidade: p.quantidade + 1 } : p)));
    } else {
      setPecasUsadas([...pecasUsadas, { id: peca.id, nome: peca.nome, codigo: peca.codigo, quantidade: 1 }]);
    }
    toast({ title: `${peca.nome} adicionada` });
  };

  const removePeca = async (peca: PecaUsada) => {
    await incrementStock(peca.id, peca.quantidade);
    setPecasUsadas(pecasUsadas.filter((p) => p.codigo !== peca.codigo));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const salvarOS = async () => {
    if (!placa || !frota) {
      toast({ title: "Preencha placa e frota", variant: "destructive" });
      return;
    }
    if (fotos.length === 0) {
      toast({ title: "Adicione pelo menos 1 foto!", variant: "destructive" });
      return;
    }
    await createOS(
      {
        tipo: "Veículo",
        placa,
        frota,
        tecnico_nome: user?.name || "",
        tecnico_cpf: user?.cpf || "",
        descricao,
        foto_peca_antiga: fotos[0] || null,
        foto_peca_nova: fotos[1] || null,
        user_id: supabaseUser?.id || null,
      },
      pecasUsadas.map((p) => ({ nome: p.nome, codigo: p.codigo, quantidade: p.quantidade })),
      fotos
    );
    setPlaca("");
    setFrota("");
    setDescricao("");
    setPecasUsadas([]);
    setFotos([]);
  };

  const gerarPDF = () => {
    if (fotos.length === 0) {
      toast({ title: "Adicione pelo menos 1 foto!", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("OFICINA-BLU - Ordem de Serviço", 20, 20);
    doc.setFontSize(12);
    doc.text(`Placa: ${placa}`, 20, 40);
    doc.text(`Frota: ${frota}`, 20, 50);
    doc.text(`Técnico: ${user?.name || ""}`, 20, 60);
    doc.text(`CPF: ${user?.cpf || ""}`, 20, 70);
    doc.text(`Descrição: ${descricao}`, 20, 80);
    doc.text("Peças Utilizadas:", 20, 100);
    pecasUsadas.forEach((p, i) => {
      doc.text(`  - ${p.nome} [${p.codigo}] (x${p.quantidade})`, 20, 110 + i * 10);
    });
    let yFotos = 120 + pecasUsadas.length * 10;
    doc.text("Fotos:", 20, yFotos);
    fotos.forEach((foto, i) => {
      const x = 20 + (i % 2) * 90;
      const row = Math.floor(i / 2);
      const y = yFotos + 10 + row * 60;
      if (y + 50 > 280) {
        doc.addPage();
        yFotos = 20 - 10 - row * 60;
      }
      doc.addImage(foto, "JPEG", x, y, 70, 50);
    });
    doc.save(`OS_${placa || "sem-placa"}.pdf`);
    toast({ title: "PDF gerado com sucesso!" });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-glow-green">O.S. VEÍCULO</h2>

      <AnimatePresence>
        {showEstoqueAlert && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="bg-card border-2 border-primary rounded-xl p-8 glow-green text-center max-w-sm">
              <p className="font-display text-xl font-bold text-primary mb-2">⚠ PEÇA FORA DE ESTOQUE!</p>
              <p className="text-muted-foreground">Esta peça não possui estoque disponível. O.S. bloqueada.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-neon w-full min-h-[80px] resize-none" placeholder="Descreva o serviço realizado..." />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-floating p-6">
        <h3 className="font-display text-lg font-bold text-primary mb-4">SELEÇÃO DE PEÇAS</h3>
        <input value={buscaPeca} onChange={(e) => setBuscaPeca(e.target.value)} className="input-neon w-full mb-4" placeholder="Buscar por nome ou código de referência..." />
        <div className="flex flex-wrap gap-2 mb-4">
          {pecasFiltradas.map((p) => (
            <button key={p.codigo} onClick={() => addPeca(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${p.quantidade > 0 ? "border-primary/30 text-primary hover:bg-primary/10" : "border-destructive/30 text-destructive opacity-50 cursor-not-allowed"}`}>
              <Plus className="w-3 h-3 inline mr-1" />
              {p.nome} [{p.codigo}] ({p.quantidade})
            </button>
          ))}
        </div>
        {pecasUsadas.length > 0 && (
          <div className="space-y-2">
            {pecasUsadas.map((p) => (
              <div key={p.codigo} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2">
                <span className="text-sm font-semibold">{p.nome} <span className="text-muted-foreground font-mono text-xs">[{p.codigo}]</span> <span className="text-muted-foreground">x{p.quantidade}</span></span>
                <button onClick={() => removePeca(p)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-floating p-6">
        <h3 className="font-display text-lg font-bold text-primary mb-4">FOTOS DO SERVIÇO</h3>
        <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleFoto} />
        <Button variant="neonCyan" className="w-full mb-4" onClick={() => inputFotoRef.current?.click()}>
          <Camera className="w-4 h-4" />
          TIRAR / ADICIONAR FOTOS
        </Button>
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fotos.map((foto, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-border/50 aspect-video group">
                <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFoto(i)}
                  className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 bg-background/70 text-xs px-1.5 py-0.5 rounded font-semibold">#{i + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/50 aspect-video flex items-center justify-center text-muted-foreground max-w-xs mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center">{fotos.length} foto(s) adicionada(s)</p>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        <Button variant="neonCyan" size="lg" onClick={salvarOS}><Save className="w-4 h-4" />Salvar O.S.</Button>
        <Button variant="neonMagenta" size="lg" onClick={gerarPDF}><FileDown className="w-4 h-4" />Gerar PDF de Serviço</Button>
      </div>
    </div>
  );
};

export default OSVeiculo;
