import { Package, CheckCircle } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { NavigateFunction } from "react-router-dom";

interface Stats {
    listasPendentes: number;
    listasAndamento: number;
    listasConcluidasHoje: number;
}

interface SummaryProps {
    stats: Stats;
    navigate: NavigateFunction;
}

export function Summary({ stats, navigate }: SummaryProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Resumo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                    icon={<Package className="h-8 w-8 text-yellow-500" />}
                    title={`${stats.listasPendentes} Pendentes`}
                    description="Listas aguardando início"
                    onClick={() => navigate("/picking-lists")}
                />

                <ActionCard
                    icon={<Package className="h-8 w-8 text-blue-500" />}
                    title={`${stats.listasAndamento} Em Andamento`}
                    description="Listas em processamento"
                    onClick={() => navigate("/picking-lists")}
                />

                <ActionCard
                    icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                    title={`${stats.listasConcluidasHoje} Concluídas Hoje`}
                    description="Listas finalizadas hoje"
                    onClick={() => navigate("/history")}
                />
            </div>
        </div>
    );
}
