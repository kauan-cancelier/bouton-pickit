import { Camera, FileText, Loader2, History, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { processImageAndExtractItems } from "@/lib/ocrService";
import { parseListText } from "@/lib/textParser";
import { localStorageService } from "@/lib/localStorageService";
import { useEffect, useState } from "react";
import { ActionCard } from "@/components/ActionCard";
import { BrandHeader } from "@/components/BrandHeader";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Verificar se há uma lista ativa ao carregar
    checkActiveList();
  }, []);

  const checkActiveList = async () => {
    try {
      const activeList = localStorageService.getListaAtiva();
      if (activeList) {
        // Há uma lista ativa, perguntar se quer continuar
        const continueList = confirm(`Você tem uma lista em andamento: "${activeList.lista.nome}". Deseja continuar?`);
        if (continueList) {
          // Carregar lista no localStorage e navegar
          const listData = {
            id: activeList.lista.id,
            nome: activeList.lista.nome,
            items: activeList.itens.map(item => ({
              pos: item.pos,
              codigo: item.codigo,
              descricao: item.descricao,
              quantidade: item.quantidade,
              concluido: item.concluido
            })),
            startTime: new Date(activeList.lista.data_inicio).getTime(),
            tempoTotal: activeList.lista.tempo_total
          };
          
          localStorage.setItem('currentList', JSON.stringify(listData));
          navigate('/list');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lista ativa:', error);
    }
  };

  const handleScanList = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // For mobile: use native camera
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const photo = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });

        if (photo.dataUrl) {
          // Convert data URL to blob for OCR processing
          const response = await fetch(photo.dataUrl);
          const blob = await response.blob();
          
          toast({
            title: "Processando imagem...",
            description: "Extraindo texto da foto capturada",
          });

          const items = await processImageAndExtractItems(blob);
          
            // Save to localStorage
            const lista = localStorageService.saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
          
          // Store locally and navigate
          localStorage.setItem('currentList', JSON.stringify({
            id: lista.id,
            nome: lista.nome,
            items,
            startTime: Date.now(),
            tempoTotal: 0
          }));
          
          navigate('/list');
        }
      } else {
        // For web: use file input to simulate camera
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
            
            // Save to localStorage
            const lista = localStorageService.saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
            
            // Store locally and navigate
            localStorage.setItem('currentList', JSON.stringify({
              id: lista.id,
              nome: lista.nome,
              items,
              startTime: Date.now(),
              tempoTotal: 0
            }));
            
            navigate('/list');
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
      // Create a file input element for web environment
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

        // Save to localStorage
        const lista = localStorageService.saveLista(file.name, items);

        // Store the parsed items and navigate to list view
        localStorage.setItem('currentList', JSON.stringify({
          id: lista.id,
          nome: file.name,
          items,
          startTime: Date.now(),
          tempoTotal: 0
        }));
        
        navigate('/list');
        
        toast({
          title: "Lista importada!",
          description: `${items.length} itens encontrados`,
        });
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <BrandHeader />

        <div className="space-y-4">
          <ActionCard
            icon={<Camera className="h-12 w-12 text-primary" />}
            title="Escanear Lista"
            description="Abrir câmera para escanear lista impressa"
            onClick={handleScanList}
            disabled={isProcessing}
            loading={isProcessing}
          />

          <ActionCard
            icon={<FileText className="h-12 w-12 text-primary" />}
            title="Importar TXT"
            description="Selecionar arquivo de texto"
            onClick={handleImportTxt}
          />
        </div>

        <div className="mt-8 space-y-3">
          <ActionCard
            icon={<History className="h-5 w-5 text-muted-foreground" />}
            title="Histórico de Listas"
            description="Ver listas anteriores"
            onClick={() => navigate('/history')}
            variant="secondary"
          />

          <ActionCard
            icon={<Settings className="h-5 w-5 text-muted-foreground" />}
            title="Configurações"
            description="Ajustes e preferências"
            onClick={() => navigate('/settings')}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}