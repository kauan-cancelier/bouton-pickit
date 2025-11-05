import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Check, Filter, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getData, setData } from "@/lib/storage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lista {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  user_codigo?: string;
  total_items?: number;
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
  const [listas, setListas] = useState<Lista[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");

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
    if (filterStatus === "assigned") return !!lista.user_codigo;
    if (filterStatus === "unassigned") return !lista.user_codigo;
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

    const listasData = getData<Lista>("listas");
    const updated = listasData.map(lista => {
      if (selectedLists.includes(lista.id)) {
        return {
          ...lista,
          user_codigo: selectedUser,
          updated_at: new Date().toISOString()
        };
      }
      return lista;
    });

    setData("listas", updated);
    
    const userName = USUARIOS.find(u => u.codigo === selectedUser)?.nome || selectedUser;
    toast({
      title: "Listas delegadas!",
      description: `${selectedLists.length} lista(s) atribuída(s) a ${userName}`
    });

    setSelectedLists([]);
    setSelectedUser("");
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
                
                return (
                  <Card 
                    key={lista.id} 
                    className={`cursor-pointer transition-all ${
                      selectedLists.includes(lista.id) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleToggleList(lista.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedLists.includes(lista.id)}
                          onCheckedChange={() => handleToggleList(lista.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-base">{lista.nome}</CardTitle>
                            <Badge 
                              variant={isAssigned ? "default" : "secondary"}
                              className={isAssigned ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                            >
                              {lista.status === "em_andamento" ? "Em Andamento" : "Pendente"}
                            </Badge>
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
