import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ItemEstoque {
  id: string;
  nome: string;
  codigo: string;
  quantidade: number;
  tipo: string;
}

export function useEstoque() {
  const [items, setItems] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("pecas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar estoque", variant: "destructive" });
      return;
    }
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (item: { nome: string; codigo: string; quantidade: number; tipo: string }) => {
    const { error } = await supabase.from("pecas").insert(item);
    if (error) {
      toast({ title: "Erro ao adicionar item", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchItems();
    toast({ title: "Item adicionado ao estoque" });
    return true;
  };

  const updateItem = async (id: string, updates: Partial<ItemEstoque>) => {
    const { error } = await supabase.from("pecas").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchItems();
    toast({ title: "Item atualizado" });
    return true;
  };

  const decrementStock = async (id: string, qty: number = 1) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.quantidade < qty) return false;
    const { error } = await supabase
      .from("pecas")
      .update({ quantidade: item.quantidade - qty })
      .eq("id", id);
    if (error) return false;
    await fetchItems();
    return true;
  };

  const incrementStock = async (id: string, qty: number = 1) => {
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    const { error } = await supabase
      .from("pecas")
      .update({ quantidade: item.quantidade + qty })
      .eq("id", id);
    if (error) return false;
    await fetchItems();
    return true;
  };

  return { items, loading, fetchItems, addItem, updateItem, decrementStock, incrementStock };
}
