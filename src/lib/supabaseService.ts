import { supabase } from '@/integrations/supabase/client';
import { ParsedItem } from './textParser';

// Helper function to handle cases where user might not be authenticated
// For local testing, we'll create a fallback approach
async function getCurrentUserId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return user.id;
    }
  } catch (error) {
    console.warn('Auth not available, using localStorage fallback');
  }
  
  // Fallback for local development - use a temporary user ID
  let tempUserId = localStorage.getItem('temp_user_id');
  if (!tempUserId) {
    tempUserId = 'temp-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('temp_user_id', tempUserId);
  }
  return tempUserId;
}

export interface Lista {
  id: string;
  nome: string;
  data_inicio: string;
  tempo_total: number;
  concluida: boolean;
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

export async function saveLista(nome: string, items: ParsedItem[], tempoTotal: number = 0) {
  try {
    const userId = await getCurrentUserId();

    // Inserir lista
    const { data: lista, error: listaError } = await supabase
      .from('listas')
      .insert({
        nome,
        data_inicio: new Date().toISOString(),
        tempo_total: tempoTotal,
        concluida: false,
        user_id: userId
      })
      .select()
      .single();

    if (listaError) throw listaError;

    // Inserir itens
    const itemsToInsert = items.map(item => ({
      lista_id: lista.id,
      pos: item.pos,
      codigo: item.codigo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      concluido: item.concluido
    }));

    const { error: itensError } = await supabase
      .from('itens')
      .insert(itemsToInsert);

    if (itensError) throw itensError;

    return lista;
  } catch (error) {
    console.error('Erro ao salvar lista:', error);
    throw error;
  }
}

export async function updateItemStatus(listaId: string, pos: number, concluido: boolean) {
  try {
    const { error } = await supabase
      .from('itens')
      .update({ concluido })
      .match({ lista_id: listaId, pos });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
}

export async function updateListaTempoTotal(listaId: string, tempoTotal: number) {
  try {
    const { error } = await supabase
      .from('listas')
      .update({ tempo_total: tempoTotal })
      .eq('id', listaId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar tempo:', error);
    throw error;
  }
}

export async function completeLista(listaId: string) {
  try {
    const { error } = await supabase
      .from('listas')
      .update({ concluida: true })
      .eq('id', listaId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao completar lista:', error);
    throw error;
  }
}

export async function getListaAtiva() {
  try {
    const userId = await getCurrentUserId();

    const { data: listas, error: listasError } = await supabase
      .from('listas')
      .select('*')
      .eq('concluida', false)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (listasError) throw listasError;

    if (!listas || listas.length === 0) {
      return null;
    }

    const lista = listas[0];

    const { data: itens, error: itensError } = await supabase
      .from('itens')
      .select('*')
      .eq('lista_id', lista.id)
      .order('pos');

    if (itensError) throw itensError;

    return {
      lista,
      itens: itens || []
    };
  } catch (error) {
    console.error('Erro ao buscar lista ativa:', error);
    return null;
  }
}