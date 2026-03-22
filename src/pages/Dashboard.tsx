import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Users, TrendingUp } from "lucide-react";

const cards = [
  { title: "Total Serviços Mês", value: "47", icon: Wrench, color: "text-primary" },
  { title: "Alertas de Estoque", value: "3", icon: AlertTriangle, color: "text-destructive" },
  { title: "Técnicos Online", value: "5", icon: Users, color: "text-primary" },
  { title: "O.S. Abertas", value: "12", icon: TrendingUp, color: "text-secondary" },
];

const recentOS = [
  { placa: "ABC-1D23", frota: "FR-012", tecnico: "João", status: "Concluída" },
  { placa: "XYZ-4E56", frota: "FR-045", tecnico: "Pedro", status: "Em andamento" },
  { placa: "DEF-7G89", frota: "FR-078", tecnico: "Maria", status: "Aguardando peças" },
];

const Dashboard = () => {
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
              <p className="text-3xl font-display font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">{card.title}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
              {recentOS.map((os) => (
                <tr key={os.placa} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
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
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
