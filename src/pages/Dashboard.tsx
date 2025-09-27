import { Camera, FileText, Clock, CheckCircle, Package, History, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { processImageAndExtractItems } from "@/lib/ocrService";
import { parseListText } from "@/lib/textParser";
import { saveLista } from "@/lib/supabaseService";
import { useState, useEffect } from "react";
import { ActionCard } from "@/components/ActionCard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    listasAndamento: 0,
    listasPendentes: 0,
    listasCompletas: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: listas } = await supabase
        .from('listas')
        .select('status');

      if (listas) {
        setStats({
          listasAndamento: listas.filter(l => l.status === 'em_andamento').length,
          listasPendentes: listas.filter(l => l.status === 'pendente').length,
          listasCompletas: listas.filter(l => l.status === 'concluida').length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleScanList = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const photo = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });

        if (photo.dataUrl) {
          const response = await fetch(photo.dataUrl);
          const blob = await response.blob();
          
          toast({
            title: "Processando imagem...",
            description: "Extraindo texto da foto capturada",
          });

          const items = await processImageAndExtractItems(blob);
          const lista = await saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
          
          toast({
            title: "Lista criada!",
            description: `${items.length} itens encontrados`,
          });
          
          loadStats();
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera';
        
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            setIsProcessing(false);
            return;
          }

          try {
            toast({
              title: "Processando imagem...",
              description: "Extraindo texto da imagem selecionada",
            });

            const items = await processImageAndExtractItems(file);
            const lista = await saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
            
            toast({
              title: "Lista criada!",
              description: `${items.length} itens encontrados`,
            });
            
            loadStats();
          } catch (error) {
            console.error('Error processing image:', error);
            toast({
              title: "Erro no OCR",
              description: error instanceof Error ? error.message : "Não foi possível processar a imagem",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        };
        
        input.click();
      }
    } catch (error) {
      console.error('Error with camera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive"
      });
    } finally {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        setIsProcessing(false);
      }
    }
  };

  const handleImportTxt = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const items = parseListText(text);
        
        if (items.length === 0) {
          toast({
            title: "Erro",
            description: "Nenhum item válido encontrado no arquivo",
            variant: "destructive"
          });
          return;
        }

        const lista = await saveLista(file.name, items);
        
        toast({
          title: "Lista importada!",
          description: `${items.length} itens encontrados`,
        });
        
        loadStats();
      };
      
      input.click();
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o arquivo",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Sistema de Picking</h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo, {user?.nome} ({user?.codigo})
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Importar Listas */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Importar Nova Lista</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              icon={<Camera className="h-8 w-8 text-primary" />}
              title="Escanear Lista"
              description="Capturar foto de lista impressa"
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

        {/* Status das Listas */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Status das Listas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={<Clock className="h-8 w-8 text-orange-500" />}
              title={`${stats.listasAndamento} Em Andamento`}
              description="Listas sendo processadas"
              onClick={() => navigate('/picking-lists')}
              variant="secondary"
            />
            <ActionCard
              icon={<Package className="h-8 w-8 text-blue-500" />}
              title={`${stats.listasPendentes} Para Picking`}
              description="Listas aguardando processamento"
              onClick={() => navigate('/picking-lists')}
            />
            <ActionCard
              icon={<CheckCircle className="h-8 w-8 text-green-500" />}
              title={`${stats.listasCompletas} Concluídas`}
              description="Listas finalizadas"
              onClick={() => navigate('/history')}
              variant="secondary"
            />
          </div>
        </div>

        {/* Navegação Rápida */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Navegação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              icon={<Package className="h-6 w-6 text-primary" />}
              title="Listas para Picking"
              description="Ver todas as listas disponíveis"
              onClick={() => navigate('/picking-lists')}
              variant="secondary"
            />
            <ActionCard
              icon={<History className="h-6 w-6 text-muted-foreground" />}
              title="Histórico"
              description="Ver listas concluídas"
              onClick={() => navigate('/history')}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}