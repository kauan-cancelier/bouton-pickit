-- Insert some sample lists for testing with proper UUIDs
INSERT INTO public.listas (id, nome, data_inicio, tempo_total, concluida, user_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Lista Teste 1 - Concluída', '2025-01-20 10:00:00+00', 1800, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Lista Teste 2 - Em Andamento', '2025-01-21 14:30:00+00', 900, false, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Lista Escaneada 22/01/2025', '2025-01-22 09:15:00+00', 2400, true, '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample items for the lists
INSERT INTO public.itens (lista_id, pos, codigo, descricao, quantidade, concluido) VALUES
-- Items for Lista Teste 1 - Concluída
('550e8400-e29b-41d4-a716-446655440001', 1, 'B0291', 'ALIANCE PRODUTO TESTE 1', 2.0, true),
('550e8400-e29b-41d4-a716-446655440001', 2, 'B0292', 'ALIANCE PRODUTO TESTE 2', 2.0, true),
('550e8400-e29b-41d4-a716-446655440001', 3, 'B0293', 'ALIANCE PRODUTO TESTE 3', 2.0, true),

-- Items for Lista Teste 2 - Em Andamento
('550e8400-e29b-41d4-a716-446655440002', 1, 'C0511', 'PRODUTO EM ANDAMENTO 1', 1.5, true),
('550e8400-e29b-41d4-a716-446655440002', 2, 'C0512', 'PRODUTO EM ANDAMENTO 2', 1.5, true),
('550e8400-e29b-41d4-a716-446655440002', 3, 'C0513', 'PRODUTO EM ANDAMENTO 3', 1.5, true),
('550e8400-e29b-41d4-a716-446655440002', 4, 'C0514', 'PRODUTO EM ANDAMENTO 4', 1.5, false),
('550e8400-e29b-41d4-a716-446655440002', 5, 'C0515', 'PRODUTO EM ANDAMENTO 5', 1.5, false),

-- Items for Lista Escaneada 22/01/2025
('550e8400-e29b-41d4-a716-446655440003', 1, 'D0721', 'PRODUTO ESCANEADO 1', 3.0, true),
('550e8400-e29b-41d4-a716-446655440003', 2, 'D0722', 'PRODUTO ESCANEADO 2', 3.0, true),
('550e8400-e29b-41d4-a716-446655440003', 3, 'D0723', 'PRODUTO ESCANEADO 3', 3.0, true);