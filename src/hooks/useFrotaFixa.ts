import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VeiculoFrota {
  id: string;
  filial: string;
  placa: string;
  frota: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  chassi: string;
  renavam: string;
  observacoes: string;
  documento_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useFrotaFixa() {
  const [veiculos, setVeiculos] = useState<VeiculoFrota[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVeiculos = async () => {
    const { data, error } = await supabase
      .from("frota_fixa")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar frota", variant: "destructive" });
    } else {
      setVeiculos((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVeiculos();
    const channel = supabase
      .channel("frota-fixa-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "frota_fixa" }, () => fetchVeiculos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addVeiculo = async (v: Omit<VeiculoFrota, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("frota_fixa" as any).insert(v as any);
    if (error) {
      toast({ title: "Erro ao cadastrar veículo", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo cadastrado na frota!" });
    return true;
  };

  const updateVeiculo = async (id: string, updates: Partial<VeiculoFrota>) => {
    const { error } = await supabase.from("frota_fixa" as any).update({ ...updates, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo atualizado!" });
    return true;
  };

  const deleteVeiculo = async (id: string) => {
    const { error } = await supabase.from("frota_fixa" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
      return false;
    }
    await fetchVeiculos();
    toast({ title: "Veículo removido da frota!" });
    return true;
  };

  const uploadDocumento = async (id: string, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `frota/${id}/documento.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Erro ao enviar documento", variant: "destructive" });
      return false;
    }
    const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(path);
    await updateVeiculo(id, { documento_url: urlData.publicUrl });
    return true;
  };

  return { veiculos, loading, addVeiculo, updateVeiculo, deleteVeiculo, uploadDocumento, refresh: fetchVeiculos };
}
