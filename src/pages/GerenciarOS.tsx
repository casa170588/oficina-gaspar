import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Eye, Pencil, Trash2, X, FileText, Radar, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OSStatus = "Aberta" | "Em andamento" | "Concluída" | "Cancelada";

interface OrdemServico {
  id: number;
  tipo: "Veículo" | "Rastreamento";
  placa: string;
  frota: string;
  tecnico: string;
  cpf: string;
  descricao: string;
  pecas: { nome: string; codigo: string; quantidade: number }[];
  status: OSStatus;
  data: string;
}

const STATUS_OPTIONS: OSStatus[] = ["Aberta", "Em andamento", "Concluída", "Cancelada"];

const statusColor: Record<OSStatus, string> = {
  "Aberta": "bg-neon-amber/20 text-neon-amber",
  "Em andamento": "bg-secondary/20 text-secondary",
  "Concluída": "bg-primary/20 text-primary",
  "Cancelada": "bg-destructive/20 text-destructive",
};

const initialOS: OrdemServico[] = [
  {
    id: 1, tipo: "Veículo", placa: "ABC-1D23", frota: "FR-012", tecnico: "João Técnico", cpf: "987.654.321-00",
    descricao: "Troca de pastilha de freio dianteira", pecas: [{ nome: "Pastilha de Freio", codigo: "PF-002", quantidade: 2 }],
    status: "Concluída", data: "2026-03-20",
  },
  {
    id: 2, tipo: "Rastreamento", placa: "XYZ-4E56", frota: "FR-045", tecnico: "Carlos Silva", cpf: "123.456.789-00",
    descricao: "Instalação de rastreador GPS", pecas: [{ nome: "Rastreador GPS Veicular", codigo: "RT-001", quantidade: 1 }, { nome: "Chicote Elétrico Rastreador", codigo: "RT-003", quantidade: 1 }],
    status: "Em andamento", data: "2026-03-21",
  },
  {
    id: 3, tipo: "Veículo", placa: "DEF-7G89", frota: "FR-078", tecnico: "Maria Santos", cpf: "111.222.333-44",
    descricao: "Troca de óleo e filtro", pecas: [{ nome: "Filtro de Óleo", codigo: "FO-001", quantidade: 1 }, { nome: "Óleo Motor 5W30", codigo: "OM-008", quantidade: 4 }],
    status: "Aberta", data: "2026-03-22",
  },
  {
    id: 4, tipo: "Rastreamento", placa: "GHI-2J34", frota: "FR-099", tecnico: "Pedro Supervisor", cpf: "555.666.777-88",
    descricao: "Substituição de antena de rastreamento", pecas: [{ nome: "Antena Rastreamento", codigo: "RT-002", quantidade: 1 }],
    status: "Aberta", data: "2026-03-22",
  },
];

const GerenciarOS = () => {
  const [osList, setOsList] = useState<OrdemServico[]>(initialOS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [viewOS, setViewOS] = useState<OrdemServico | null>(null);
  const [editStatusId, setEditStatusId] = useState<number | null>(null);
  const { toast } = useToast();

  const filtered = osList.filter((os) => {
    const matchSearch =
      os.placa.toLowerCase().includes(search.toLowerCase()) ||
      os.frota.toLowerCase().includes(search.toLowerCase()) ||
      os.tecnico.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? os.status === filterStatus : true;
    const matchTipo = filterTipo ? os.tipo === filterTipo : true;
    return matchSearch && matchStatus && matchTipo;
  });

  const updateStatus = (id: number, status: OSStatus) => {
    setOsList(osList.map((os) => (os.id === id ? { ...os, status } : os)));
    setEditStatusId(null);
    toast({ title: `Status atualizado para "${status}"` });
  };

  const deleteOS = (id: number) => {
    setOsList(osList.filter((os) => os.id !== id));
    toast({ title: "O.S. excluída" });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-glow-green">GERENCIAR O.S.</h2>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-neon w-full pl-10"
            placeholder="Buscar por placa, frota ou técnico..."
          />
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

      {/* OS Table */}
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
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      {os.tipo === "Rastreamento" ? <Radar className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-secondary" />}
                      {os.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold font-mono">{os.placa}</td>
                  <td className="py-3 px-4 text-muted-foreground">{os.frota}</td>
                  <td className="py-3 px-4">{os.tecnico}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{os.data}</td>
                  <td className="py-3 px-4">
                    {editStatusId === os.id ? (
                      <select
                        value={os.status}
                        onChange={(e) => updateStatus(os.id, e.target.value as OSStatus)}
                        onBlur={() => setEditStatusId(null)}
                        autoFocus
                        className="input-neon text-xs py-1 w-full"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditStatusId(os.id)} className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[os.status]} cursor-pointer hover:opacity-80 flex items-center gap-1`}>
                        {os.status}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewOS(os)} className="text-muted-foreground hover:text-primary transition-colors" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteOS(os.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma O.S. encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View OS Modal */}
      <AnimatePresence>
        {viewOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            onClick={() => setViewOS(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-floating p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-primary">
                  DETALHES DA O.S. #{viewOS.id}
                </h3>
                <button onClick={() => setViewOS(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[viewOS.status]}`}>{viewOS.status}</span>
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
                    <p className="font-semibold">{viewOS.tecnico}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">CPF</span>
                    <p className="font-mono text-xs">{viewOS.cpf}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Data</span>
                    <p className="font-semibold">{viewOS.data}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descrição</span>
                  <p className="text-sm mt-1 bg-muted/30 rounded-lg p-3">{viewOS.descricao}</p>
                </div>

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
