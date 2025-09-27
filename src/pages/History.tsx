
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/textParser";

interface Lista {
  id: string;
  nome: string;
  data_inicio: string;
  tempo_total: number;
  concluida: boolean;
  created_at: string;
}

export default function History() {
  const navigate = useNavigate();
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const storedListas = localStorage.getItem("listas");
      const parsedListas: Lista[] = storedListas ? JSON.parse(storedListas) : [];

      // pega só as concluídas
      const concluidas = parsedListas.filter((l) => l.concluida);

      // ordena por data de criação decrescente
      concluidas.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setListas(concluidas);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueList = (lista: Lista) => {
    try {
      const storedItens = localStorage.getItem(`itens_${lista.id}`);
      const itens = storedItens ? JSON.parse(storedItens) : [];

      const listData = {
        id: lista.id,
        nome: lista.nome,
        items: itens,
        startTime: new Date(lista.data_inicio).getTime(),
        tempoTotal: lista.tempo_total,
      };

      localStorage.setItem("currentList", JSON.stringify(listData));

      // todas aqui são concluídas → vai sempre pro /completed
      navigate("/completed", {
        state: {
          totalTime: lista.tempo_total,
          totalItems: itens?.length || 0,
          listName: lista.nome,
        },
      });
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Carregando histórico...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Histórico de Listas Concluídas
            </h1>
            <p className="text-sm text-muted-foreground">
              Bouton - Roupas de Cama
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {listas.length === 0 ? (
          <Card className="text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma lista concluída
            </h2>
            <p className="text-muted-foreground mb-4">
              Finalize uma lista para que ela apareça aqui.
            </p>
            <Button onClick={() => navigate("/")}>Criar nova lista</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {listas.map((lista) => (
              <Card
                key={lista.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{lista.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(lista.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluída
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {lista.tempo_total > 0
                        ? formatTime(lista.tempo_total)
                        : "Não iniciada"}
                    </div>
                    <Button size="sm" onClick={() => handleContinueList(lista)}>
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
