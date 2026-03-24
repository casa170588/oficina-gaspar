
-- Delete duplicate profiles, keeping only the first one per user_id
DELETE FROM public.profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.profiles
  ORDER BY user_id, created_at ASC
);

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Add os_fotos table for multiple photos per OS
CREATE TABLE public.os_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  foto_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.os_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read os_fotos" ON public.os_fotos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert os_fotos" ON public.os_fotos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete os_fotos" ON public.os_fotos FOR DELETE TO authenticated USING (true);
