
-- Add numero_os to ordens_servico with auto-increment sequence
CREATE SEQUENCE IF NOT EXISTS os_numero_seq START 1;

ALTER TABLE public.ordens_servico ADD COLUMN IF NOT EXISTS numero_os integer UNIQUE DEFAULT nextval('os_numero_seq');

-- Create patio table
CREATE TABLE public.patio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  placa text NOT NULL DEFAULT '',
  frota text NOT NULL DEFAULT '',
  tipo_veiculo text NOT NULL DEFAULT 'Carreta',
  eixos text NOT NULL DEFAULT '2 Eixos',
  carga text NOT NULL DEFAULT 'Vazia',
  situacao text NOT NULL DEFAULT 'Livre',
  motivo_bloqueio text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.patio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read patio" ON public.patio FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert patio" ON public.patio FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update patio" ON public.patio FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete patio" ON public.patio FOR DELETE TO authenticated USING (true);

-- Enable realtime for patio
ALTER PUBLICATION supabase_realtime ADD TABLE public.patio;
