import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Package, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatTime } from "@/lib/textParser";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lista {
  id: string;
  nome: string;
  data_inicio: string;
  tempo_total: number;
  status: string;
  user_codigo: string | null;
  created_at: string;
  total_items?: number;
  prioridade?: 'normal' | 'emergencial';
}

interface Item {
  id: string;
  lista_id: string;
  pos: number;
  codigo: string;
  descricao: string;
  quantidade: number;
  concluido: boolean;
  foraDeEstoque?: boolean;
}

import { getData, setData } from "@/lib/storage";

export default function PickingLists() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"normal" | "emergencial">("normal");

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const listasData = getData<Lista>("listas")
        .filter(l => ["pendente", "em_andamento"].includes(l.status))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));

      const listasWithItems = listasData.map(lista => {
        const itens = getData<Item>("itens").filter(i => i.lista_id === lista.id);
        return {
          ...lista,
          total_items: itens.length
        };
      });

      setListas(listasWithItems);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPicking = async (lista: Lista) => {
    try {
      const listasData = getData<Lista>("listas");
      const idx = listasData.findIndex(l => l.id === lista.id);
      if (idx !== -1) {
        listasData[idx] = {
          ...listasData[idx],
          status: "em_andamento",
          user_codigo: user?.codigo || null,
          data_inicio: new Date().toISOString(),
        };
        setData("listas", listasData);
      }

      const itens = getData<Item>("itens").filter(i => i.lista_id === lista.id);

      const listData = {
        id: lista.id,
        nome: lista.nome,
        items: itens.map(item => ({
          pos: item.pos,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: item.quantidade,
          concluido: item.concluido,
          foraDeEstoque: item.foraDeEstoque || false
        })),
        startTime: Date.now(),
        tempoTotal: lista.tempo_total || 0
      };

      localStorage.setItem("currentList", JSON.stringify(listData));
      navigate("/list");
    } catch (error) {
      console.error("Erro ao iniciar picking:", error);
    }
  };

  const handleContinuePicking = async (lista: Lista) => {
    try {
      const itens = getData<Item>("itens").filter(i => i.lista_id === lista.id);

      const listData = {
        id: lista.id,
        nome: lista.nome,
        items: itens.map(item => ({
          pos: item.pos,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: item.quantidade,
          concluido: item.concluido,
          foraDeEstoque: item.foraDeEstoque || false
        })),
        startTime: new Date(lista.data_inicio).getTime(),
        tempoTotal: lista.tempo_total || 0
      };

      localStorage.setItem("currentList", JSON.stringify(listData));
      navigate("/list");
    } catch (error) {
      console.error("Erro ao continuar picking:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Carregando listas...</div>
        </div>
      </div>
    );
  }

  const listasEmergenciais = listas.filter(l => l.prioridade === 'emergencial');
  const listasNormais = listas.filter(l => l.prioridade !== 'emergencial');
  
  const listasFiltradas = activeTab === "emergencial" ? listasEmergenciais : listasNormais;
  const listasPendentes = listasFiltradas.filter(l => l.status === "pendente");
  const listasAndamento = listasFiltradas.filter(l => l.status === "em_andamento");

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Listas para Picking
            </h1>
            <p className="text-sm text-muted-foreground">
              Escolha uma lista para iniciar o picking
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "normal" | "emergencial")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="normal" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Normal ({listasNormais.length})
            </TabsTrigger>
            <TabsTrigger value="emergencial" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergencial ({listasEmergenciais.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-6">
        {/* Listas em Andamento */}
        {listasAndamento.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Em Andamento ({listasAndamento.length})
            </h2>
            <div className="space-y-3">
              {listasAndamento.map((lista) => {
                const isPriority = lista.prioridade === 'emergencial';
                return (
                <Card key={lista.id} className={`${isPriority ? 'border-red-500 bg-red-50/30' : 'border-orange-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {isPriority && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <CardTitle className="text-base">{lista.nome}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lista.total_items} itens • Usuário: {lista.user_codigo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Iniciado: {new Date(lista.data_inicio).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isPriority && (
                          <Badge variant="destructive" className="bg-red-600">
                            EMERGENCIAL
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Em Andamento
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {lista.tempo_total > 0 ? formatTime(lista.tempo_total) : "Não iniciado"}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleContinuePicking(lista)}
                        disabled={lista.user_codigo !== user?.codigo}
                      >
                        {lista.user_codigo === user?.codigo ? "Continuar" : "Em uso"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          </div>
        )}

        {/* Listas Pendentes */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Pendentes ({listasPendentes.length})
          </h2>
          {listasPendentes.length === 0 ? (
            <Card className="text-center p-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma lista pendente
              </h3>
              <p className="text-muted-foreground mb-4">
                Todas as listas disponíveis estão sendo processadas ou foram concluídas.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {listasPendentes.map((lista) => {
                const isPriority = lista.prioridade === 'emergencial';
                return (
                <Card key={lista.id} className={`hover:shadow-md transition-shadow ${isPriority ? 'border-red-500 bg-red-50/30' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {isPriority && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <CardTitle className="text-base">{lista.nome}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lista.total_items} itens
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado: {new Date(lista.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isPriority && (
                          <Badge variant="destructive" className="bg-red-600">
                            EMERGENCIAL
                          </Badge>
                        )}
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Pendente
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleStartPicking(lista)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Picking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

