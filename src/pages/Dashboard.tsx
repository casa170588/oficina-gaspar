import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const Dashboard = () => {
  const { metrics, loading } = useDashboardMetrics();

  const cards = [
    { title: "Total Serviços Mês", value: String(metrics.totalServicosMes), icon: Wrench, color: "text-primary" },
    { title: "Alertas de Estoque", value: String(metrics.alertasEstoque), icon: AlertTriangle, color: "text-destructive" },
    { title: "Técnicos Cadastrados", value: String(metrics.tecnicos), icon: Users, color: "text-primary" },
    { title: "O.S. Abertas", value: String(metrics.osAbertas), icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-glow-green">PAINEL DE CONTROLE</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-floating p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{loading ? "..." : card.value}</p>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">{card.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tire Inventory Summary */}
      {!loading && metrics.pneusPorTamanho.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-floating p-5">
          <h3 className="font-display text-lg font-bold text-primary mb-4">ESTOQUE DE PNEUS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Medida</th>
                  <th className="px-4 py-2 text-center">Novos</th>
                  <th className="px-4 py-2 text-center">Recapados</th>
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {metrics.pneusPorTamanho.map((p) => (
                  <tr key={p.medida} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 font-mono font-bold">{p.medida}</td>
                    <td className="px-4 py-2 text-center text-primary font-bold">{p.novos}</td>
                    <td className="px-4 py-2 text-center text-secondary font-bold">{p.recapados}</td>
                    <td className="px-4 py-2 text-center font-bold">{p.novos + p.recapados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-floating p-5"
      >
        <h3 className="font-display text-lg font-bold mb-4 text-primary">ORDENS RECENTES</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-muted-foreground uppercase tracking-wider text-xs">Placa</th>
                <th className="text-left py-3 px-2 text-muted-foreground uppercase tracking-wider text-xs">Frota</th>
                <th className="text-left py-3 px-2 text-muted-foreground uppercase tracking-wider text-xs">Técnico</th>
                <th className="text-left py-3 px-2 text-muted-foreground uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOS.map((os, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 font-semibold">{os.placa}</td>
                  <td className="py-3 px-2">{os.frota}</td>
                  <td className="py-3 px-2">{os.tecnico}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      os.status === "Concluída" ? "bg-primary/10 text-primary" :
                      os.status === "Em andamento" ? "bg-secondary/10 text-secondary" :
                      "bg-neon-amber/10 text-neon-amber"
                    }`}>
                      {os.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!metrics.recentOS.length && (
                <tr>
                  <td colSpan={4} className="py-6 px-2 text-center text-muted-foreground">Nenhuma O.S. cadastrada ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
