// src/lib/localStorageService.ts

import { ParsedItem } from './textParser';

export interface Lista {
  id: string;
  nome: string;
  data_inicio: string;
  tempo_total: number;
  concluida: boolean;
  status: string;
  user_codigo?: string;
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

const LISTAS_KEY = 'listas';
const ITENS_KEY = 'itens';

function getData<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export const localStorageService = {
  saveLista: (nome: string, items: ParsedItem[], tempoTotal: number = 0): Lista => {
    const listas = getData<Lista>(LISTAS_KEY);
    const itens = getData<ItemLista>(ITENS_KEY);

    const now = new Date().toISOString();

    const novaLista: Lista = {
      id: generateId('lista'),
      nome,
      data_inicio: now,
      tempo_total: tempoTotal,
      concluida: false,
      status: 'pendente',
      created_at: now,
      updated_at: now
    };

    const novosItens: ItemLista[] = items.map(item => ({
      id: generateId('item'),
      lista_id: novaLista.id,
      pos: item.pos,
      codigo: item.codigo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      concluido: item.concluido
    }));

    setData(LISTAS_KEY, [...listas, novaLista]);
    setData(ITENS_KEY, [...itens, ...novosItens]);

    return novaLista;
  },

  updateItemStatus: (listaId: string, pos: number, concluido: boolean) => {
    const itens = getData<ItemLista>(ITENS_KEY);
    const updated = itens.map(it =>
      it.lista_id === listaId && it.pos === pos
        ? { ...it, concluido }
        : it
    );
    setData(ITENS_KEY, updated);
  },

  updateListaTempoTotal: (listaId: string, tempoTotal: number) => {
    const listas = getData<Lista>(LISTAS_KEY);
    const updated = listas.map(l =>
      l.id === listaId ? { ...l, tempo_total: tempoTotal, updated_at: new Date().toISOString() } : l
    );
    setData(LISTAS_KEY, updated);
  },

  completeLista: (listaId: string) => {
    const listas = getData<Lista>(LISTAS_KEY);
    const updated = listas.map(l =>
      l.id === listaId ? { ...l, concluida: true, status: 'concluida', updated_at: new Date().toISOString() } : l
    );
    setData(LISTAS_KEY, updated);
  },

  getListaAtiva: (): { lista: Lista; itens: ItemLista[] } | null => {
    const listas = getData<Lista>(LISTAS_KEY);
    const itens = getData<ItemLista>(ITENS_KEY);

    const ativa = [...listas]
      .filter(l => !l.concluida && l.status === 'em_andamento')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!ativa) return null;

    return {
      lista: ativa,
      itens: itens.filter(it => it.lista_id === ativa.id).sort((a, b) => a.pos - b.pos)
    };
  },

  getAllListas: (): Lista[] => {
    return getData<Lista>(LISTAS_KEY);
  }
};
