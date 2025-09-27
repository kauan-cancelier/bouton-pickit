import { ParsedItem } from './textParser';

// Gerar IDs simples
function generateId() {
  return crypto.randomUUID();
}

// Função utilitária para ler/gravar no localStorage
function getData<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Simula usuário logado (sempre o mesmo em local)
async function getCurrentUserId(): Promise<string> {
  return '550e8400-e29b-41d4-a716-446655440000';
}

export interface Lista {
  id: string;
  nome: string;
  data_inicio: string;
  tempo_total: number;
  concluida: boolean;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ItemLista {
  id: string;
  lista_id: string;
  pos: number;
  codigo: string;
  descricao: string;
  quantidade: number;
  concluido: boolean;
}

// Salvar nova lista e itens
export async function saveLista(nome: string, items: ParsedItem[], tempoTotal: number = 0): Promise<Lista> {
  const userId = await getCurrentUserId();
  const listas = getData<Lista>('listas');

  const novaLista: Lista = {
    id: generateId(),
    nome,
    data_inicio: new Date().toISOString(),
    tempo_total: tempoTotal,
    concluida: false,
    status: 'pendente',
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  listas.push(novaLista);
  setData('listas', listas);

  const itens = getData<ItemLista>('itens');
  const novosItens = items.map(item => ({
    id: generateId(),
    lista_id: novaLista.id,
    pos: item.pos,
    codigo: item.codigo,
    descricao: item.descricao,
    quantidade: item.quantidade,
    concluido: item.concluido,
  }));

  setData('itens', [...itens, ...novosItens]);

  return novaLista;
}

// Atualizar status de item
export async function updateItemStatus(listaId: string, pos: number, concluido: boolean) {
  const itens = getData<ItemLista>('itens');
  const idx = itens.findIndex(i => i.lista_id === listaId && i.pos === pos);
  if (idx !== -1) {
    itens[idx].concluido = concluido;
    setData('itens', itens);
  }
}

// Atualizar tempo total da lista
export async function updateListaTempoTotal(listaId: string, tempoTotal: number) {
  const listas = getData<Lista>('listas');
  const idx = listas.findIndex(l => l.id === listaId);
  if (idx !== -1) {
    listas[idx].tempo_total = tempoTotal;
    listas[idx].updated_at = new Date().toISOString();
    setData('listas', listas);
  }
}

// Completar lista
export async function completeLista(listaId: string) {
  const listas = getData<Lista>('listas');
  const idx = listas.findIndex(l => l.id === listaId);
  if (idx !== -1) {
    listas[idx].concluida = true;
    listas[idx].status = 'concluida';
    listas[idx].updated_at = new Date().toISOString();
    setData('listas', listas);
  }
}

// Buscar lista ativa
export async function getListaAtiva() {
  const userId = await getCurrentUserId();
  const listas = getData<Lista>('listas')
    .filter(l => l.user_id === userId && l.status === 'em_andamento')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (listas.length === 0) return null;

  const lista = listas[0];
  const itens = getData<ItemLista>('itens').filter(i => i.lista_id === lista.id);

  return { lista, itens };
}

