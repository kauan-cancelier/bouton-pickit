// Função para limpar dados antigos e inicializar com o novo formato
export function initializeLocalStorage() {
  // Verifica se já existe dados no formato antigo e limpa
  const oldListas = localStorage.getItem('listas');
  if (oldListas) {
    try {
      const parsed = JSON.parse(oldListas);
      // Se não tem o campo status, é formato antigo
      if (parsed.length > 0 && !parsed[0].hasOwnProperty('status')) {
        console.log('Removendo dados no formato antigo...');
        localStorage.removeItem('listas');
        localStorage.removeItem('itens');
      }
    } catch (error) {
      console.error('Erro ao verificar formato dos dados:', error);
    }
  }
}

// Função para popular o sistema com dados mocados
export function populateMockData() {
  const mockListas = [
    {
      id: 'lista-001',
      nome: 'Pedido #1234 - Supermercado',
      status: 'concluida',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 1250,
      user_codigo: 'picker1'
    },
    {
      id: 'lista-002',
      nome: 'Pedido #1235 - Bebidas',
      status: 'concluida',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 890,
      user_codigo: 'picker2'
    },
    {
      id: 'lista-003',
      nome: 'Pedido #1236 - Higiene',
      status: 'concluida',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 1560,
      user_codigo: 'picker1'
    },
    {
      id: 'lista-004',
      nome: 'Pedido #1237 - Limpeza',
      status: 'em_andamento',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 0,
      user_codigo: 'picker3'
    },
    {
      id: 'lista-005',
      nome: 'Pedido #1238 - Alimentos',
      status: 'pendente',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 0,
      user_codigo: 'picker2'
    },
    {
      id: 'lista-006',
      nome: 'Pedido #1239 - Hortifruti',
      status: 'pendente',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      tempo_total: 0
    },
    {
      id: 'lista-007',
      nome: 'Pedido #1240 - Padaria',
      status: 'pendente',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      tempo_total: 0
    },
    {
      id: 'lista-008',
      nome: 'Pedido #1241 - Frios',
      status: 'concluida',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tempo_total: 720,
      user_codigo: 'picker3'
    },
    {
      id: 'lista-009',
      nome: 'Pedido #1242 - Congelados',
      status: 'concluida',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      tempo_total: 980,
      user_codigo: 'picker1'
    }
  ];

  const mockItens = [
    // Lista 001 - Concluída
    { id: 'item-001-1', lista_id: 'lista-001', pos: 1, codigo: 'PROD001', descricao: 'ARROZ BRANCO 5KG', quantidade: 2, concluido: true },
    { id: 'item-001-2', lista_id: 'lista-001', pos: 2, codigo: 'PROD002', descricao: 'FEIJAO PRETO 1KG', quantidade: 3, concluido: true },
    { id: 'item-001-3', lista_id: 'lista-001', pos: 3, codigo: 'PROD003', descricao: 'OLEO DE SOJA 900ML', quantidade: 1, concluido: true },
    
    // Lista 002 - Concluída
    { id: 'item-002-1', lista_id: 'lista-002', pos: 1, codigo: 'BEB001', descricao: 'REFRIGERANTE COLA 2L', quantidade: 4, concluido: true },
    { id: 'item-002-2', lista_id: 'lista-002', pos: 2, codigo: 'BEB002', descricao: 'SUCO LARANJA 1L', quantidade: 2, concluido: true },
    { id: 'item-002-3', lista_id: 'lista-002', pos: 3, codigo: 'BEB003', descricao: 'AGUA MINERAL 500ML', quantidade: 12, concluido: true },
    
    // Lista 003 - Concluída
    { id: 'item-003-1', lista_id: 'lista-003', pos: 1, codigo: 'HIG001', descricao: 'SABONETE LIQUIDO 250ML', quantidade: 2, concluido: true },
    { id: 'item-003-2', lista_id: 'lista-003', pos: 2, codigo: 'HIG002', descricao: 'SHAMPOO 400ML', quantidade: 1, concluido: true },
    { id: 'item-003-3', lista_id: 'lista-003', pos: 3, codigo: 'HIG003', descricao: 'PASTA DE DENTE 90G', quantidade: 3, concluido: true },
    { id: 'item-003-4', lista_id: 'lista-003', pos: 4, codigo: 'HIG004', descricao: 'PAPEL HIGIENICO 12UN', quantidade: 2, concluido: true },
    
    // Lista 004 - Em andamento (alguns concluídos)
    { id: 'item-004-1', lista_id: 'lista-004', pos: 1, codigo: 'LMP001', descricao: 'DETERGENTE LIQUIDO 500ML', quantidade: 3, concluido: true },
    { id: 'item-004-2', lista_id: 'lista-004', pos: 2, codigo: 'LMP002', descricao: 'DESINFETANTE 2L', quantidade: 2, concluido: true },
    { id: 'item-004-3', lista_id: 'lista-004', pos: 3, codigo: 'LMP003', descricao: 'ESPONJA MULTIUSO 6UN', quantidade: 1, concluido: false },
    { id: 'item-004-4', lista_id: 'lista-004', pos: 4, codigo: 'LMP004', descricao: 'AGUA SANITARIA 1L', quantidade: 2, concluido: false },
    
    // Lista 005 - Pendente
    { id: 'item-005-1', lista_id: 'lista-005', pos: 1, codigo: 'ALM001', descricao: 'MACARRAO PARAFUSO 500G', quantidade: 5, concluido: false },
    { id: 'item-005-2', lista_id: 'lista-005', pos: 2, codigo: 'ALM002', descricao: 'MOLHO TOMATE 340G', quantidade: 3, concluido: false },
    { id: 'item-005-3', lista_id: 'lista-005', pos: 3, codigo: 'ALM003', descricao: 'BISCOITO CREAM CRACKER', quantidade: 2, concluido: false },
    { id: 'item-005-4', lista_id: 'lista-005', pos: 4, codigo: 'ALM004', descricao: 'CAFE TORRADO 500G', quantidade: 1, concluido: false },
    { id: 'item-005-5', lista_id: 'lista-005', pos: 5, codigo: 'ALM005', descricao: 'ACUCAR CRISTAL 1KG', quantidade: 2, concluido: false },
    
    // Lista 006 - Pendente
    { id: 'item-006-1', lista_id: 'lista-006', pos: 1, codigo: 'HRT001', descricao: 'TOMATE SALADA KG', quantidade: 2, concluido: false },
    { id: 'item-006-2', lista_id: 'lista-006', pos: 2, codigo: 'HRT002', descricao: 'ALFACE CRESPA UN', quantidade: 3, concluido: false },
    { id: 'item-006-3', lista_id: 'lista-006', pos: 3, codigo: 'HRT003', descricao: 'BANANA PRATA KG', quantidade: 1, concluido: false },
    { id: 'item-006-4', lista_id: 'lista-006', pos: 4, codigo: 'HRT004', descricao: 'LARANJA LIMA KG', quantidade: 2, concluido: false },
    
    // Lista 007 - Pendente
    { id: 'item-007-1', lista_id: 'lista-007', pos: 1, codigo: 'PAD001', descricao: 'PAO FRANCES KG', quantidade: 1, concluido: false },
    { id: 'item-007-2', lista_id: 'lista-007', pos: 2, codigo: 'PAD002', descricao: 'PAO DE FORMA INTEGRAL', quantidade: 2, concluido: false },
    { id: 'item-007-3', lista_id: 'lista-007', pos: 3, codigo: 'PAD003', descricao: 'BOLO DE CENOURA UN', quantidade: 1, concluido: false },
    
    // Lista 008 - Concluída
    { id: 'item-008-1', lista_id: 'lista-008', pos: 1, codigo: 'FRO001', descricao: 'PRESUNTO FATIADO 200G', quantidade: 2, concluido: true },
    { id: 'item-008-2', lista_id: 'lista-008', pos: 2, codigo: 'FRO002', descricao: 'QUEIJO MUSSARELA 300G', quantidade: 1, concluido: true },
    { id: 'item-008-3', lista_id: 'lista-008', pos: 3, codigo: 'FRO003', descricao: 'MORTADELA FATIADA 200G', quantidade: 1, concluido: true },
    
    // Lista 009 - Concluída (hoje)
    { id: 'item-009-1', lista_id: 'lista-009', pos: 1, codigo: 'CNG001', descricao: 'PIZZA MUSSARELA 400G', quantidade: 2, concluido: true },
    { id: 'item-009-2', lista_id: 'lista-009', pos: 2, codigo: 'CNG002', descricao: 'BATATA CONGELADA 1KG', quantidade: 1, concluido: true },
    { id: 'item-009-3', lista_id: 'lista-009', pos: 3, codigo: 'CNG003', descricao: 'HAMBURGUER BOVINO 672G', quantidade: 2, concluido: true }
  ];

  // Salvar no localStorage
  localStorage.setItem('listas', JSON.stringify(mockListas));
  localStorage.setItem('itens', JSON.stringify(mockItens));
  
  console.log('✅ Sistema populado com dados mocados!');
  console.log(`📦 ${mockListas.length} listas criadas`);
  console.log(`📋 ${mockItens.length} itens criados`);
}