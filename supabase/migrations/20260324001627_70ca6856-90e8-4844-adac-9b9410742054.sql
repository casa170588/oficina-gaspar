
CREATE TABLE public.pneus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medida text NOT NULL,
  quantidade integer NOT NULL DEFAULT 0,
  tipo text NOT NULL DEFAULT 'Novo',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pneus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read pneus" ON public.pneus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pneus" ON public.pneus FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pneus" ON public.pneus FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete pneus" ON public.pneus FOR DELETE TO authenticated USING (true);
