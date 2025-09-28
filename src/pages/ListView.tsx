import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListItem } from "@/components/ListItem";
import { ProgressHeader } from "@/components/ProgressHeader";
import { ParsedItem } from "@/lib/textParser";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorageService";

interface ListData {
  id?: string;
  nome: string;
  items: ParsedItem[];
  tempoTotal?: number;
}

export default function ListView() {
  const [listData, setListData] = useState<ListData | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carrega lista e inicializa timer com persistência
  useEffect(() => {
    const stored = localStorage.getItem('currentList');
    if (!stored) {
      navigate('/');
      return;
    }

    const data: ListData = JSON.parse(stored);
    setListData(data);
    setItems(data.items);
  }, [navigate]);

  const { time, start } = useTimer(
    listData?.tempoTotal || 0,
    listData ? `timer-${listData.id}` : undefined
  );

  // Inicia o timer quando listData estiver disponível
  useEffect(() => {
    if (listData) start();
  }, [listData, start]);

  const completedCount = items.filter(item => item.concluido).length;
  const totalCount = items.length;

  const handleToggleItem = (pos: number) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.pos === pos ? { ...item, concluido: !item.concluido } : item
      );

      // Atualiza localStorage
      if (listData) {
        const updatedData = { ...listData, items: newItems, tempoTotal: time };
        localStorage.setItem('currentList', JSON.stringify(updatedData));

        // Atualiza lista completa no storageService E cada item individualmente
        localStorageService.updateListaTempoTotal(listData.id!, time);
        localStorageService.updateItemStatus(listData.id!, pos, !prevItems.find(item => item.pos === pos)?.concluido);
      }

      // Verifica conclusão
      const newCompletedCount = newItems.filter(item => item.concluido).length;
      if (newCompletedCount === newItems.length && newItems.length > 0 && listData) {
        const updatedData = { ...listData, items: newItems, tempoTotal: time, concluida: true };
        localStorage.setItem('currentList', JSON.stringify(updatedData));
        localStorageService.completeLista(listData.id!);

        // Redireciona para tela de conclusão
        toast({
          title: "Lista concluída!",
          description: `${newItems.length} itens processados em ${Math.floor(time/60)}min`,
        });
        
        setTimeout(() => {
          navigate('/completed', { 
            state: { 
              totalTime: time,
              totalItems: newItems.length,
              listName: listData.nome
            } 
          });
        }, 1000);
      }

      return newItems;
    });
  };

  if (!listData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-lg">Carregando lista...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader 
        completed={completedCount}
        total={totalCount}
        time={time}
      />
      <div className="p-4">
        {items.map(item => (
          <ListItem
            key={item.pos}
            item={item}
            onToggle={handleToggleItem}
          />
        ))}
      </div>
    </div>
  );
}
