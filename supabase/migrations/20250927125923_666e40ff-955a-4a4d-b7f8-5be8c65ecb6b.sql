-- Create users table for authentication
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies for usuarios table
CREATE POLICY "Allow public read for login" 
ON public.usuarios 
FOR SELECT 
USING (true);

-- Insert some test users
INSERT INTO public.usuarios (codigo, senha, nome) VALUES 
('USR001', '123456', 'João Silva'),
('USR002', '654321', 'Maria Santos'),
('USR003', 'admin', 'Administrador');

-- Add user_codigo to listas table to track who is working on the list
ALTER TABLE public.listas ADD COLUMN user_codigo TEXT;

-- Add status column to listas table
ALTER TABLE public.listas ADD COLUMN status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida'));

-- Update existing data
UPDATE public.listas SET status = CASE 
  WHEN concluida = true THEN 'concluida' 
  ELSE 'pendente' 
END;

-- Create trigger for updated_at on usuarios
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();