import { Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { parseListText } from "@/lib/textParser";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanList = async () => {
    try {
      // Request camera permission and take photo
      const photo = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      // For now, show a message that OCR functionality needs to be implemented
      // In a real mobile app, you would use ML Kit or similar for OCR
      toast({
        title: "Foto capturada",
        description: "Funcionalidade de OCR será implementada para dispositivos móveis",
      });

    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive"
      });
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

        // Store the parsed items and navigate to list view
        localStorage.setItem('currentList', JSON.stringify({
          nome: file.name,
          items,
          startTime: Date.now()
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
          <h1 className="text-2xl font-bold text-foreground mb-2">
            List Scanner Buddy
          </h1>
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
              >
                <Camera className="h-12 w-12 text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-lg">Escanear Lista</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Abrir câmera para capturar foto
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
      </div>
    </div>
  );
}