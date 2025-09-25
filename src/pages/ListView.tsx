import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListItem } from "@/components/ListItem";
import { ProgressHeader } from "@/components/ProgressHeader";
import { ParsedItem } from "@/lib/textParser";
import { useTimer } from "@/hooks/useTimer";
import { useToast } from "@/hooks/use-toast";
import { updateItemStatus, updateListaTempoTotal, completeLista } from "@/lib/supabaseService";

interface ListData {
  id?: string;
  nome: string;
  items: ParsedItem[];
  startTime: number;
  tempoTotal?: number;
}

export default function ListView() {
  const [listData, setListData] = useState<ListData | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { time, start } = useTimer(0);

  useEffect(() => {
    // Load list data from localStorage
    const stored = localStorage.getItem('currentList');
    if (!stored) {
      navigate('/');
      return;
    }

    const data: ListData = JSON.parse(stored);
    setListData(data);
    setItems(data.items);
    
    // Start the timer from stored time
    start();
  }, [navigate, start]);

  // Auto-save timer every 10 seconds
  useEffect(() => {
    if (!listData?.id) return;

    const interval = setInterval(() => {
      updateListaTempoTotal(listData.id!, time).catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [listData?.id, time]);

  const completedCount = items.filter(item => item.concluido).length;
  const totalCount = items.length;

  const handleToggleItem = async (pos: number) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.pos === pos ? { ...item, concluido: !item.concluido } : item
      );
      
      // Update localStorage
      if (listData) {
        const updatedData = { ...listData, items: newItems };
        localStorage.setItem('currentList', JSON.stringify(updatedData));
      }

      // Update Supabase
      if (listData?.id) {
        const toggledItem = newItems.find(item => item.pos === pos);
        if (toggledItem) {
          updateItemStatus(listData.id, pos, toggledItem.concluido).catch(console.error);
        }
      }
      
      // Check if all items are completed
      const newCompletedCount = newItems.filter(item => item.concluido).length;
      if (newCompletedCount === newItems.length && newItems.length > 0) {
        // Save final time and mark as completed
        if (listData?.id) {
          Promise.all([
            updateListaTempoTotal(listData.id, time),
            completeLista(listData.id)
          ]).catch(console.error);
        }

        // All items completed, navigate to completion screen
        setTimeout(() => {
          navigate('/completed', { 
            state: { 
              totalTime: time,
              totalItems: newItems.length,
              listName: listData?.nome
            } 
          });
        }, 500);
      }
      
      return newItems;
    });
  };

  if (!listData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">Carregando lista...</div>
      </div>
    </div>;
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