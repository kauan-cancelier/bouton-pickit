import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getData } from "@/lib/storage";

interface Lista {
  id: string;
  status: string;
  user_codigo?: string;
  tempo_total: number;
  updated_at: string;
}

interface UserStats {
  usuario: string;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  tempoMedio: number;
}

const USUARIOS = [
  { codigo: "admin", nome: "Administrador" },
  { codigo: "picker1", nome: "Picker 1" },
  { codigo: "picker2", nome: "Picker 2" },
  { codigo: "picker3", nome: "Picker 3" },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [totalLists, setTotalLists] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const listas = getData<Lista>("listas");
    const hoje = new Date().toDateString();

    // Calcula estatísticas gerais
    setTotalLists(listas.length);
    setCompletedToday(
      listas.filter(l => 
        l.status === 'concluida' && 
        new Date(l.updated_at).toDateString() === hoje
      ).length
    );

    // Calcula estatísticas por usuário
    const stats: { [key: string]: UserStats } = {};

    USUARIOS.forEach(user => {
      const userLists = listas.filter(l => l.user_codigo === user.codigo);
      const concluidas = userLists.filter(l => l.status === 'concluida');
      
      stats[user.codigo] = {
        usuario: user.nome,
        concluidas: concluidas.length,
        pendentes: userLists.filter(l => l.status === 'pendente').length,
        emAndamento: userLists.filter(l => l.status === 'em_andamento').length,
        tempoMedio: concluidas.length > 0
          ? Math.floor(concluidas.reduce((acc, l) => acc + l.tempo_total, 0) / concluidas.length / 60)
          : 0
      };
    });

    setUserStats(Object.values(stats));
  };

  const chartConfig = {
    concluidas: {
      label: "Concluídas",
      color: "#22c55e",
    },
    emAndamento: {
      label: "Em Andamento",
      color: "#3b82f6",
    },
    pendentes: {
      label: "Pendentes",
      color: "#facc15",
    },
  } satisfies ChartConfig;

  const pieData = userStats.map((stat, index) => ({
    name: stat.usuario,
    value: stat.concluidas,
    fill: COLORS[index % COLORS.length]
  }));

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
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Relatórios
            </h1>
            <p className="text-sm text-muted-foreground">
              Estatísticas de desempenho por usuário
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Listas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {totalLists}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Concluídas Hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {completedToday}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Listas por Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Listas por Usuário
            </CardTitle>
            <CardDescription>
              Comparativo de status das listas por usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="usuario" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="concluidas" fill="var(--color-concluidas)" name="Concluídas" />
                  <Bar dataKey="emAndamento" fill="var(--color-emAndamento)" name="Em Andamento" />
                  <Bar dataKey="pendentes" fill="var(--color-pendentes)" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Listas Concluídas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuição de Listas Concluídas
            </CardTitle>
            <CardDescription>
              Percentual de listas concluídas por usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Tempo Médio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tempo Médio por Lista
            </CardTitle>
            <CardDescription>
              Tempo médio de conclusão por usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStats.map((stat) => (
                <div 
                  key={stat.usuario}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{stat.usuario}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.concluidas} lista(s) concluída(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {stat.tempoMedio}min
                    </div>
                    <div className="text-xs text-muted-foreground">
                      média
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
