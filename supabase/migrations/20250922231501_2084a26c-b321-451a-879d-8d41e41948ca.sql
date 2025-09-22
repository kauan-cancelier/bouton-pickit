-- Create tables for the list scanner app
CREATE TABLE public.listas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tempo_total INTEGER DEFAULT 0,
  concluida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listas ENABLE ROW LEVEL SECURITY;

-- Create policies for listas
CREATE POLICY "Users can view their own lists" 
ON public.listas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists" 
ON public.listas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
ON public.listas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
ON public.listas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create itens table
CREATE TABLE public.itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID NOT NULL REFERENCES public.listas(id) ON DELETE CASCADE,
  pos INTEGER NOT NULL,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  quantidade REAL NOT NULL,
  concluido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.itens ENABLE ROW LEVEL SECURITY;

-- Create policies for itens (they inherit access through the lista)
CREATE POLICY "Users can view items from their own lists" 
ON public.itens 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  WHERE listas.id = itens.lista_id 
  AND listas.user_id = auth.uid()
));

CREATE POLICY "Users can create items in their own lists" 
ON public.itens 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.listas 
  WHERE listas.id = itens.lista_id 
  AND listas.user_id = auth.uid()
));

CREATE POLICY "Users can update items in their own lists" 
ON public.itens 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  WHERE listas.id = itens.lista_id 
  AND listas.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their own lists" 
ON public.itens 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  WHERE listas.id = itens.lista_id 
  AND listas.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_listas_updated_at
BEFORE UPDATE ON public.listas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itens_updated_at
BEFORE UPDATE ON public.itens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();