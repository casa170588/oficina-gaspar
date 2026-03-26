import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentOS {
  placa: string;
  frota: string;
  tecnico: string;
  status: string;
}

interface PneuPorTamanho {
  medida: string;
  novos: number;
  recapados: number;
}

interface DashboardMetrics {
  totalServicosMes: number;
  alertasEstoque: number;
  tecnicos: number;
  osAbertas: number;
  recentOS: RecentOS[];
  pneusPorTamanho: PneuPorTamanho[];
}

const initialMetrics: DashboardMetrics = {
  totalServicosMes: 0,
  alertasEstoque: 0,
  tecnicos: 0,
  osAbertas: 0,
  recentOS: [],
  pneusPorTamanho: [],
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [osMes, pecasBaixas, tecnicos, osAbertas, recentes, pneusAll] = await Promise.all([
      supabase.from("ordens_servico").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
      supabase.from("pecas").select("id", { count: "exact", head: true }).lte("quantidade", 2),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("nivel", "TÉCNICO"),
      supabase.from("ordens_servico").select("id", { count: "exact", head: true }).neq("status", "Concluída"),
      supabase.from("ordens_servico").select("placa, frota, tecnico_nome, status").order("created_at", { ascending: false }).limit(5),
      supabase.from("pneus").select("medida, quantidade, tipo"),
    ]);

    // Aggregate tires by size
    const pneusMap = new Map<string, { novos: number; recapados: number }>();
    (pneusAll.data || []).forEach((p: any) => {
      const entry = pneusMap.get(p.medida) || { novos: 0, recapados: 0 };
      if (p.tipo === "Novo") entry.novos += p.quantidade;
      else entry.recapados += p.quantidade;
      pneusMap.set(p.medida, entry);
    });

    const pneusPorTamanho: PneuPorTamanho[] = Array.from(pneusMap.entries()).map(([medida, v]) => ({ medida, ...v }));

    setMetrics({
      totalServicosMes: osMes.count || 0,
      alertasEstoque: pecasBaixas.count || 0,
      tecnicos: tecnicos.count || 0,
      osAbertas: osAbertas.count || 0,
      recentOS: (recentes.data || []).map((item) => ({
        placa: item.placa,
        frota: item.frota,
        tecnico: item.tecnico_nome,
        status: item.status,
      })),
      pneusPorTamanho,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();

    const channels = ["ordens_servico", "pecas", "pneus", "profiles"].map((table) =>
      supabase
        .channel(`dashboard-${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => fetchMetrics())
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, []);

  return { metrics, loading, refresh: fetchMetrics };
}
