import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrdemServico {
  id: string;
  tipo: string;
  placa: string;
  frota: string;
  tecnico_nome: string;
  tecnico_cpf: string;
  descricao: string;
  status: string;
  foto_peca_antiga: string | null;
  foto_peca_nova: string | null;
  user_id: string | null;
  created_at: string;
  pecas: { nome: string; codigo: string; quantidade: number }[];
  fotos: string[];
}

export function useOrdensServico() {
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOS = async () => {
    const { data: osData, error } = await supabase
      .from("ordens_servico")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar O.S.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const osIds = (osData || []).map((os) => os.id);
    
    let pecasData: any[] = [];
    let fotosData: any[] = [];
    
    if (osIds.length > 0) {
      const [pecasRes, fotosRes] = await Promise.all([
        supabase.from("os_pecas").select("*").in("os_id", osIds),
        supabase.from("os_fotos").select("*").in("os_id", osIds),
      ]);
      pecasData = pecasRes.data || [];
      fotosData = fotosRes.data || [];
    }

    const result: OrdemServico[] = (osData || []).map((os) => ({
      ...os,
      pecas: pecasData
        .filter((p) => p.os_id === os.id)
        .map((p) => ({ nome: p.peca_nome, codigo: p.peca_codigo, quantidade: p.quantidade })),
      fotos: fotosData
        .filter((f) => f.os_id === os.id)
        .map((f) => f.foto_url),
    }));

    setOsList(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchOS();

    const ordensChannel = supabase
      .channel("ordens-servico-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordens_servico" },
        () => fetchOS()
      )
      .subscribe();

    const pecasChannel = supabase
      .channel("os-pecas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "os_pecas" },
        () => fetchOS()
      )
      .subscribe();

    const fotosChannel = supabase
      .channel("os-fotos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "os_fotos" },
        () => fetchOS()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordensChannel);
      supabase.removeChannel(pecasChannel);
      supabase.removeChannel(fotosChannel);
    };
  }, []);

  const createOS = async (
    os: {
      tipo: string;
      placa: string;
      frota: string;
      tecnico_nome: string;
      tecnico_cpf: string;
      descricao: string;
      foto_peca_antiga?: string | null;
      foto_peca_nova?: string | null;
      user_id?: string | null;
    },
    pecas: { nome: string; codigo: string; quantidade: number }[],
    fotos?: string[]
  ) => {
    const { data, error } = await supabase
      .from("ordens_servico")
      .insert({
        tipo: os.tipo,
        placa: os.placa,
        frota: os.frota,
        tecnico_nome: os.tecnico_nome,
        tecnico_cpf: os.tecnico_cpf,
        descricao: os.descricao,
        foto_peca_antiga: os.foto_peca_antiga || null,
        foto_peca_nova: os.foto_peca_nova || null,
        user_id: os.user_id || null,
      })
      .select()
      .single();

    if (error || !data) {
      toast({ title: "Erro ao salvar O.S.", description: error?.message, variant: "destructive" });
      return null;
    }

    if (pecas.length > 0) {
      await supabase.from("os_pecas").insert(
        pecas.map((p) => ({
          os_id: data.id,
          peca_nome: p.nome,
          peca_codigo: p.codigo,
          quantidade: p.quantidade,
        }))
      );
    }

    if (fotos && fotos.length > 0) {
      await supabase.from("os_fotos").insert(
        fotos.map((foto_url) => ({
          os_id: data.id,
          foto_url,
        }))
      );
    }

    await fetchOS();
    toast({ title: "O.S. salva com sucesso!" });
    return data;
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("ordens_servico").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return false;
    }
    await fetchOS();
    toast({ title: `Status atualizado para "${status}"` });
    return true;
  };

  const deleteOS = async (id: string) => {
    const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir O.S.", variant: "destructive" });
      return false;
    }
    await fetchOS();
    toast({ title: "O.S. excluída" });
    return true;
  };

  const updateOS = async (id: string, updates: Partial<OrdemServico>) => {
    const { pecas, fotos, ...dbUpdates } = updates as any;
    const { error } = await supabase.from("ordens_servico").update(dbUpdates).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar O.S.", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchOS();
    toast({ title: "O.S. atualizada" });
    return true;
  };

  return { osList, loading, fetchOS, createOS, updateStatus, updateOS, deleteOS };
}
