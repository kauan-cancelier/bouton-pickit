import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Camera, FileText, CheckCircle, Package, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { processImageAndExtractItems } from "@/lib/ocrService";
import { parseListText } from "@/lib/textParser";
import { localStorageService } from "@/lib/localStorageService";
import { ActionCard } from "@/components/ActionCard";
import useStats from "@/hooks/useStats";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const stats = useStats();
  const [isProcessing, setIsProcessing] = useState(false);

  const [chartData, setChartData] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // --- Funções de importação ---
  const handleScanList = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);

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
  };

  const handleImportTxt = async () => {
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
  };

  // --- Dados para gráfico ---
  useEffect(() => {
    const loadChart = () => {
      const hoje = new Date(filterDate).toDateString();
      const pendentes = stats.listasPendentes;
      const andamento = stats.listasAndamento || 0;
      const concluidasHoje = stats.listasConcluidasHoje?.[hoje] || 0;

      setChartData([
        { name: "Pendentes", quantidade: stats.listasPendentes, fill: "#facc15" },       // amarelo
        { name: "Em Andamento", quantidade:  stats.listasAndamento , fill: "#3b82f6" },    // azul
        { name: "Concluídas Hoje", quantidade: stats.listasConcluidasHoje, fill: "#22c55e" } // verde
      ]);
    };
    loadChart();
  }, [stats, filterDate]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-lg p-6 flex justify-between items-center mb-6">
  <div>
    <h1 className="text-3xl font-extrabold tracking-wide">PickIt Dashboard</h1>
    <p className="text-sm opacity-90 mt-1">
      Bem-vindo, {user?.nome} ({user?.codigo})
    </p>
  </div>
  <Button variant="outline" onClick={logout} size="sm" className="text-black border-white hover:bg-white hover:text-blue-700">
    <LogOut className="h-4 w-4 mr-2" /> Sair
  </Button>
</div>


      {/* Importar Lista */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Importar Lista</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon={<Camera className="h-8 w-8 text-primary" />}
            title="Escanear"
            description="Capturar lista com a câmera (experimental)"
            onClick={handleScanList}
            disabled={isProcessing}
            loading={isProcessing}
          />
          <ActionCard
            icon={<FileText className="h-8 w-8 text-primary" />}
            title="Importar TXT"
            description="Selecionar arquivo de texto"
            onClick={handleImportTxt}
          />
        </div>
      </div>

      {/* Resumo Rápido */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Package className="h-8 w-8 text-yellow-500" />}
            title={`${stats.listasPendentes} Pendentes`}
            description="Listas aguardando início"
            onClick={() => navigate("/picking-lists")}
          />

          <ActionCard
            icon={<Package className="h-8 w-8 text-blue-500" />}
            title={`${stats.listasAndamento} Em Andamento`}
            description="Listas em processamento"
            onClick={() => navigate("/picking-lists")}
          />

          <ActionCard
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title={`${stats.listasConcluidasHoje} Concluídas Hoje`}
            description="Listas finalizadas hoje"
            onClick={() => navigate("/history")}
          />

        </div>
      </div>

      {/* Gráfico com filtro */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Resumo Visual</h2>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Navegação Rápida */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Navegação</h2>
        <div className="grid grid-cols-1 gap-4">
          <ActionCard
            icon={<History className="h-6 w-6 text-muted-foreground" />}
            title="Histórico"
            description="Listas já concluídas"
            onClick={() => navigate("/history")}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
