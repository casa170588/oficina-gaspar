
-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL DEFAULT '',
  login TEXT NOT NULL DEFAULT '',
  nivel TEXT NOT NULL DEFAULT 'TÉCNICO',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert profiles"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete profiles"
  ON public.profiles FOR DELETE TO authenticated USING (true);

-- Pecas (inventory) table
CREATE TABLE public.pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  quantidade INTEGER NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read pecas"
  ON public.pecas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert pecas"
  ON public.pecas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update pecas"
  ON public.pecas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete pecas"
  ON public.pecas FOR DELETE TO authenticated USING (true);

-- Ordens de Servico table
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'Veículo',
  placa TEXT NOT NULL DEFAULT '',
  frota TEXT NOT NULL DEFAULT '',
  tecnico_nome TEXT NOT NULL DEFAULT '',
  tecnico_cpf TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Aberta',
  foto_peca_antiga TEXT,
  foto_peca_nova TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read os"
  ON public.ordens_servico FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert os"
  ON public.ordens_servico FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update os"
  ON public.ordens_servico FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete os"
  ON public.ordens_servico FOR DELETE TO authenticated USING (true);

-- OS Pecas (parts used in each OS)
CREATE TABLE public.os_pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  peca_nome TEXT NOT NULL,
  peca_codigo TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.os_pecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read os_pecas"
  ON public.os_pecas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert os_pecas"
  ON public.os_pecas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete os_pecas"
  ON public.os_pecas FOR DELETE TO authenticated USING (true);

-- Insert initial inventory data
INSERT INTO public.pecas (nome, codigo, quantidade, tipo) VALUES
  ('Filtro de Óleo', 'FO-001', 12, 'Filtro'),
  ('Pastilha de Freio', 'PF-002', 8, 'Freio'),
  ('Pneu 195/65R15', 'PN-003', 4, 'Pneus'),
  ('Correia Dentada', 'CD-004', 0, 'Motor'),
  ('Amortecedor Dianteiro', 'AD-005', 6, 'Suspensão'),
  ('Vela de Ignição', 'VI-006', 20, 'Motor'),
  ('Pneu 205/55R16', 'PN-007', 2, 'Pneus'),
  ('Óleo Motor 5W30', 'OM-008', 15, 'Lubrificante'),
  ('Rastreador GPS Veicular', 'RT-001', 10, 'Rastreamento'),
  ('Antena Rastreamento', 'RT-002', 5, 'Rastreamento'),
  ('Chicote Elétrico Rastreador', 'RT-003', 3, 'Rastreamento'),
  ('Módulo GSM Rastreamento', 'RT-004', 0, 'Rastreamento'),
  ('Relé de Bloqueio', 'RT-005', 7, 'Rastreamento');

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true);

CREATE POLICY "Authenticated can upload fotos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos');

CREATE POLICY "Anyone can view fotos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'fotos');
