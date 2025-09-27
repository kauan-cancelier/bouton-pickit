import { useState, useEffect } from "react";
import { localStorageService, Lista } from "@/lib/localStorageService";

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
      const listas: Lista[] = localStorageService.getAllListas();
      const hoje = new Date().toDateString();

      let pendentes = 0;
      let andamento = 0;
      let concluidasHoje = 0;

      listas.forEach(l => {
        if (!l.concluida) {
          if (l.tempo_total === 0) {
            pendentes += 1;
          } else {
            andamento += 1;
          }
        } else {
          const dataConclusao = new Date(l.updated_at).toDateString();
          if (dataConclusao === hoje) {
            concluidasHoje += 1;
          }
        }
      });
      setStats({ listasPendentes: pendentes, listasAndamento: andamento, listasConcluidasHoje: concluidasHoje });
    };


    // Atualiza imediatamente
    updateStats();

    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
