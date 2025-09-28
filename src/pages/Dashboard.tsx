import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { processImageAndExtractItems } from "@/lib/ocrService";
import { parseListText } from "@/lib/textParser";
import { localStorageService } from "@/lib/localStorageService";
import { initializeLocalStorage } from "@/lib/initializeData";
import useStats from "@/hooks/useStats";

import { Header } from "@/components/dashboard/Header";
import { ImportList } from "@/components/dashboard/ImportList";
import { Summary } from "@/components/dashboard/Summary";
import { VisualSummary } from "@/components/dashboard/VisualSummary";
import { QuickNavigation } from "@/components/dashboard/QuickNavigation";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const stats = useStats();

  const [isProcessing, setIsProcessing] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState<{ name: string; quantidade: number; fill: string }[]>([]);

  // Inicializa localStorage
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  // --- Funções de importação ---
  const handleScanList = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (window.Capacitor?.isNativePlatform()) {
        const photo = await window.Capacitor.Plugins.Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 0, // DataUrl
          source: 1, // Camera
        });
        if (photo.dataUrl) {
          const blob = await (await fetch(photo.dataUrl)).blob();
          toast({ title: "Processando imagem...", description: "Extraindo texto" });
          const items = await processImageAndExtractItems(blob);
          localStorageService.saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
          toast({ title: "Lista criada!", description: `${items.length} itens encontrados` });
        }
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "camera";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          toast({ title: "Processando imagem...", description: "Extraindo texto" });
          const items = await processImageAndExtractItems(file);
          localStorageService.saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
          toast({ title: "Lista criada!", description: `${items.length} itens encontrados` });
        };
        input.click();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível processar a imagem", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast]);

  const handleImportTxt = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const items = parseListText(text);

      if (items.length === 0) {
        toast({ title: "Erro", description: "Nenhum item válido encontrado", variant: "destructive" });
        return;
      }

      localStorageService.saveLista(file.name, items);
      toast({ title: "Lista importada!", description: `${items.length} itens encontrados` });
    };
    input.click();
  }, [toast]);

  // Atualiza gráfico quando stats ou filtro mudam
  useEffect(() => {
    setChartData([
      { name: "Pendentes", quantidade: stats.listasPendentes, fill: "#facc15" },
      { name: "Em Andamento", quantidade: stats.listasAndamento, fill: "#3b82f6" },
      { name: "Concluídas Hoje", quantidade: stats.listasConcluidasHoje, fill: "#22c55e" },
    ]);
  }, [stats, filterDate]);

  const handleDateChange = (date: string) => {
    setFilterDate(date);
    // Futuro: filtrar dados do gráfico de acordo com a data
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <Header user={user} logout={logout} />
      <ImportList handleScanList={handleScanList} handleImportTxt={handleImportTxt} isProcessing={isProcessing} />
      <Summary stats={stats} navigate={navigate} />
      <VisualSummary data={chartData} onDateChange={handleDateChange} />
      <QuickNavigation navigate={navigate} />
    </div>
  );
}
