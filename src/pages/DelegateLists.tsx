import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Check, Filter, Users, Package, AlertTriangle, Search, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getData, setData } from "@/lib/storage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { localStorageService } from "@/lib/localStorageService";

interface Lista {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  user_codigo?: string;
  total_items?: number;
  prioridade?: 'normal' | 'emergencial';
  delegated_by?: string;
  delegated_at?: string;
  updated_at: string;
}

interface Item {
  id: string;
  lista_id: string;
}

const USUARIOS = [
  { codigo: "admin", nome: "Administrador" },
  { codigo: "picker1", nome: "Picker 1" },
  { codigo: "picker2", nome: "Picker 2" },
  { codigo: "picker3", nome: "Picker 3" },
];

export default function DelegateLists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listas, setListas] = useState<Lista[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const listasData = getData<Lista>("listas")
      .filter(l => l.status === "pendente" || l.status === "em_andamento")
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    const listasWithItems = listasData.map(lista => {
      const itens = getData<Item>("itens").filter(i => i.lista_id === lista.id);
      return {
        ...lista,
        total_items: itens.length
      };
    });

    setListas(listasWithItems);
  };

  const filteredListas = listas.filter(lista => {
    // Filtro de status
    if (filterStatus === "assigned" && !lista.user_codigo) return false;
    if (filterStatus === "unassigned" && lista.user_codigo) return false;
    
    // Busca avançada
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        lista.nome.toLowerCase().includes(search) ||
        lista.id.toLowerCase().includes(search) ||
        lista.user_codigo?.toLowerCase().includes(search) ||
        getUserName(lista.user_codigo)?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const stats = {
    total: listas.length,
    assigned: listas.filter(l => l.user_codigo).length,
    unassigned: listas.filter(l => !l.user_codigo).length,
    totalItems: listas.reduce((sum, l) => sum + (l.total_items || 0), 0)
  };

  const getUserName = (codigo?: string) => {
    if (!codigo) return null;
    return USUARIOS.find(u => u.codigo === codigo)?.nome || codigo;
  };

  const handleToggleList = (listaId: string) => {
    setSelectedLists(prev => 
      prev.includes(listaId) 
        ? prev.filter(id => id !== listaId)
        : [...prev, listaId]
    );
  };

  const handleDelegate = () => {
    if (selectedLists.length === 0) {
      toast({
        title: "Nenhuma lista selecionada",
        description: "Selecione ao menos uma lista para delegar",
        variant: "destructive"
      });
      return;
    }

    if (!selectedUser) {
      toast({
        title: "Nenhum usuário selecionado",
        description: "Selecione um usuário para delegar as listas",
        variant: "destructive"
      });
      return;
    }

    const userName = USUARIOS.find(u => u.codigo === selectedUser)?.nome || selectedUser;
    const delegatedBy = user?.nome || user?.codigo || "admin";
    
    // Delegar usando o serviço
    selectedLists.forEach(listaId => {
      localStorageService.delegateLista(listaId, selectedUser, delegatedBy);
    });
    
    toast({
      title: "Listas delegadas!",
      description: `${selectedLists.length} lista(s) atribuída(s) a ${userName}`,
      duration: 5000
    });

    // Notificação adicional com detalhes
    setTimeout(() => {
      toast({
        title: `📋 Delegação registrada`,
        description: `Por ${delegatedBy} para ${userName} às ${new Date().toLocaleTimeString('pt-BR')}`,
        duration: 4000
      });
    }, 1000);

    setSelectedLists([]);
    setSelectedUser("");
    loadLists();
  };

  const handleTogglePriority = (listaId: string) => {
    const lista = listas.find(l => l.id === listaId);
    if (!lista) return;

    const novaPrioridade = lista.prioridade === 'emergencial' ? 'normal' : 'emergencial';
    localStorageService.updateListaPrioridade(listaId, novaPrioridade);
    
    toast({
      title: novaPrioridade === 'emergencial' ? "🚨 Prioridade emergencial!" : "Prioridade normal",
      description: `Lista "${lista.nome}" ${novaPrioridade === 'emergencial' ? 'marcada como emergencial' : 'voltou à prioridade normal'}`,
      variant: novaPrioridade === 'emergencial' ? "destructive" : "default",
      duration: 3000
    });
    
    loadLists();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Delegar Listas
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecione listas e atribua a um usuário
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Busca Avançada */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, ID ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Delegações */}
        {showHistory && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {listas
                  .filter(l => l.delegated_at)
                  .sort((a, b) => new Date(b.delegated_at!).getTime() - new Date(a.delegated_at!).getTime())
                  .slice(0, 5)
                  .map(lista => (
                    <div key={lista.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{lista.nome}</span>
                        <p className="text-xs text-muted-foreground">
                          Delegada por {lista.delegated_by} para {getUserName(lista.user_codigo)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lista.delegated_at!).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                {listas.filter(l => l.delegated_at).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma delegação registrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total de Listas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.assigned}</div>
                <p className="text-xs text-muted-foreground">Atribuídas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Filter className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{stats.unassigned}</div>
                <p className="text-xs text-muted-foreground">Não Atribuídas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">Total de Itens</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Delegação */}
        {selectedLists.length > 0 && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {selectedLists.length} lista(s) selecionada(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Atribuir para:
                </label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {USUARIOS.map(user => (
                      <SelectItem key={user.codigo} value={user.codigo}>
                        {user.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleDelegate}
                disabled={!selectedUser}
              >
                <Check className="h-4 w-4 mr-2" />
                Delegar Listas
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de Listas */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Listas ({filteredListas.length})
            </h2>
            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unassigned">Não Atribuídas</TabsTrigger>
                <TabsTrigger value="assigned">Atribuídas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {filteredListas.length === 0 ? (
            <Card className="text-center p-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma lista encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {filterStatus === "assigned" && "Não há listas atribuídas no momento."}
                {filterStatus === "unassigned" && "Todas as listas já foram atribuídas."}
                {filterStatus === "all" && "Não há listas disponíveis."}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredListas.map((lista) => {
                const userName = getUserName(lista.user_codigo);
                 const isAssigned = !!lista.user_codigo;
                const isPriority = lista.prioridade === 'emergencial';
                
                return (
                  <Card 
                    key={lista.id} 
                    className={`transition-all ${
                      selectedLists.includes(lista.id) ? 'border-primary bg-primary/5' : ''
                    } ${isPriority ? 'border-red-500 bg-red-50/50' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedLists.includes(lista.id)}
                          onCheckedChange={() => handleToggleList(lista.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              {isPriority && <AlertTriangle className="h-5 w-5 text-red-600" />}
                              <CardTitle className="text-base">{lista.nome}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              {isPriority && (
                                <Badge variant="destructive" className="bg-red-600">
                                  EMERGENCIAL
                                </Badge>
                              )}
                              <Badge 
                                variant={isAssigned ? "default" : "secondary"}
                                className={isAssigned ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                              >
                                {lista.status === "em_andamento" ? "Em Andamento" : "Pendente"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="h-4 w-4" />
                              <span>{lista.total_items} itens</span>
                            </div>
                            
                            {isAssigned ? (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  Atribuída para: {userName}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-700">
                                  Não atribuída
                                </span>
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              Criado: {new Date(lista.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            {lista.delegated_at && (
                              <p className="text-xs text-blue-600 font-medium">
                                Delegada por {lista.delegated_by} em {new Date(lista.delegated_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            <Button
                              variant={isPriority ? "destructive" : "outline"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePriority(lista.id);
                              }}
                              className="w-full"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {isPriority ? "Remover Emergência" : "Marcar como Emergencial"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
