
CREATE TABLE public.frota_fixa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial text NOT NULL DEFAULT 'BLU',
  placa text NOT NULL DEFAULT '',
  frota text NOT NULL DEFAULT '',
  marca text NOT NULL DEFAULT '',
  modelo text NOT NULL DEFAULT '',
  ano text NOT NULL DEFAULT '',
  cor text NOT NULL DEFAULT '',
  chassi text NOT NULL DEFAULT '',
  renavam text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  documento_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.frota_fixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read frota_fixa" ON public.frota_fixa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert frota_fixa" ON public.frota_fixa FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update frota_fixa" ON public.frota_fixa FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete frota_fixa" ON public.frota_fixa FOR DELETE TO authenticated USING (true);
