import { useState, useEffect } from "react";
import { getData } from "@/lib/storage";

interface Lista {
  id: string;
  status: string;
  updated_at: string;
  concluida: boolean;
  tempo_total: number;
}

interface Stats {
  listasPendentes: number;
  listasAndamento: number;
  listasConcluidasHoje: number;
}

export default function useStats() {
  const [stats, setStats] = useState<Stats>({
    listasPendentes: 0,
    listasAndamento: 0,
    listasConcluidasHoje: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      try {
        const listas = getData<Lista>('listas');
        const hoje = new Date().toDateString();

        setStats({
          listasPendentes: listas.filter(l => l.status === 'pendente').length,
          listasAndamento: listas.filter(l => l.status === 'em_andamento').length,
          listasConcluidasHoje: listas.filter(l => 
            l.status === 'concluida' && 
            new Date(l.updated_at).toDateString() === hoje
          ).length,
        });
      } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
      }
    };

    updateStats();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return stats;
}
