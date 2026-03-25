ALTER TABLE public.pneus ADD COLUMN IF NOT EXISTS numero_fogo text NOT NULL DEFAULT '';

ALTER PUBLICATION supabase_realtime ADD TABLE public.pecas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pneus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordens_servico;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;