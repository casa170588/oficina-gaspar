import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VeiculoPatio {
  id: string;
  placa: string;
  frota: string;
  tipo_veiculo: string;
  eixos: string;
  carga: string;
  situacao: string;
  motivo_bloqueio: string;
  created_at: string;
  updated_at: string;
}

export function usePatio() {
  const [veiculos, setVeiculos] = useState<VeiculoPatio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVeiculos = async () => {
    const { data, error } = await supabase
      .from("patio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar pátio", variant: "destructive" });
    } else {
      setVeiculos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVeiculos();
    const channel = supabase
      .channel("patio-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patio" }, () => fetchVeiculos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addVeiculo = async (v: Omit<VeiculoPatio, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("patio").insert(v);
    if (error) {
      toast({ title: "Erro ao cadastrar veículo", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo cadastrado no pátio!" });
    return true;
  };

  const updateVeiculo = async (id: string, updates: Partial<VeiculoPatio>) => {
    const { error } = await supabase.from("patio").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo atualizado!" });
    return true;
  };

  const deleteVeiculo = async (id: string) => {
    const { error } = await supabase.from("patio").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo removido do pátio!" });
    return true;
  };

  return { veiculos, loading, addVeiculo, updateVeiculo, deleteVeiculo, refresh: fetchVeiculos };
}
