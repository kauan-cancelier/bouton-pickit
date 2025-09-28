import { ArrowLeft, User, Bell, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClearData = async () => {
    const confirm = window.confirm(
      'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.'
    );
    
    if (confirm) {
      try {
        // Clear localStorage data
        localStorage.removeItem('currentList');
        localStorage.removeItem('listas');
        localStorage.removeItem('itens');

        toast({
          title: "Dados limpos",
          description: "Todos os dados foram removidos com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível limpar os dados",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground">
              Bouton - Roupas de Cama
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Versão do aplicativo: 1.0.0
            </div>
            <div className="text-sm text-muted-foreground">
              Desenvolvido para Bouton - Roupas de Cama Premium
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Alertas de conclusão</div>
                <div className="text-sm text-muted-foreground">
                  Notificar quando uma lista for concluída
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Sons do sistema</div>
                <div className="text-sm text-muted-foreground">
                  Reproduzir sons de feedback
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Gerencie seus dados salvos no aplicativo
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todos os dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Scanner de Listas Bouton é um aplicativo desenvolvido para otimizar 
              o processo de conferência de produtos e listas de itens.
            </div>
            <div className="text-sm text-muted-foreground">
              Recursos principais:
              • Escaneamento de listas impressas com OCR
              • Importação de arquivos TXT
              • Cronômetro integrado
              • Persistência de dados
              • Sincronização em nuvem
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}