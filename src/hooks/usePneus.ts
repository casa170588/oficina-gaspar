import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Pneu {
  id: string;
  medida: string;
  quantidade: number;
  tipo: string;
  created_at: string;
}

export function usePneus() {
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPneus = async () => {
    const { data, error } = await supabase
      .from("pneus")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar pneus", variant: "destructive" });
      return;
    }
    setPneus(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPneus();
  }, []);

  const addPneu = async (pneu: { medida: string; quantidade: number; tipo: string }) => {
    const { error } = await supabase.from("pneus").insert(pneu);
    if (error) {
      toast({ title: "Erro ao adicionar pneu", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchPneus();
    toast({ title: "Pneu adicionado ao estoque" });
    return true;
  };

  const updatePneu = async (id: string, updates: Partial<Pneu>) => {
    const { error } = await supabase.from("pneus").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchPneus();
    toast({ title: "Pneu atualizado" });
    return true;
  };

  const deletePneu = async (id: string) => {
    const { error } = await supabase.from("pneus").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchPneus();
    toast({ title: "Pneu excluído" });
    return true;
  };

  return { pneus, loading, fetchPneus, addPneu, updatePneu, deletePneu };
}
