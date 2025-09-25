import { Camera, FileText, Loader2, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { processImageAndExtractItems } from "@/lib/ocrService";
import { parseListText } from "@/lib/textParser";
import { saveLista, getListaAtiva } from "@/lib/supabaseService";
import { useEffect, useState } from "react";

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
      const activeList = await getListaAtiva();
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
          
          // Save to Supabase
          const lista = await saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
          
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
            
            // Save to Supabase
            const lista = await saveLista(`Lista Escaneada ${new Date().toLocaleDateString()}`, items);
            
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

        // Save to Supabase
        const lista = await saveLista(file.name, items);

        // Store the parsed items and navigate to list view
        localStorage.setItem('currentList', JSON.stringify({
          id: lista.id,
          nome: file.name,
          items,
          startTime: Date.now(),
          tempoTotal: 0
        }));
        
        navigate('/list');
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
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">B</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Bouton
            </h1>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Roupas de Cama Premium
            </p>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Scanner de Listas
          </h2>
          <p className="text-muted-foreground">
            Escaneie ou importe sua lista para começar
          </p>
        </div>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Button 
                onClick={handleScanList}
                className="w-full h-auto p-6 flex flex-col items-center gap-4"
                variant="outline"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                  <Camera className="h-12 w-12 text-primary" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {isProcessing ? "Processando..." : "Escanear Lista"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {isProcessing ? "Extraindo texto da imagem" : "Abrir câmera para escanear lista impressa"}
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Button 
                onClick={handleImportTxt}
                className="w-full h-auto p-6 flex flex-col items-center gap-4"
                variant="outline"
              >
                <FileText className="h-12 w-12 text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-lg">Importar TXT</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Selecionar arquivo de texto
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button 
                onClick={() => navigate('/history')}
                className="w-full h-auto p-4 flex items-center justify-between"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Histórico de Listas</div>
                    <div className="text-xs text-muted-foreground">
                      Ver listas anteriores
                    </div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button 
                onClick={() => navigate('/settings')}
                className="w-full h-auto p-4 flex items-center justify-between"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Configurações</div>
                    <div className="text-xs text-muted-foreground">
                      Ajustes e preferências
                    </div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}