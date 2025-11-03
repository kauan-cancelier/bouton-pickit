import { History, UserPlus, BarChart3 } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { NavigateFunction } from "react-router-dom";

interface QuickNavigationProps {
    navigate: NavigateFunction;
}

export function QuickNavigation({ navigate }: QuickNavigationProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Navegação</h2>
            <div className="grid grid-cols-1 gap-4">
                <ActionCard
                    icon={<UserPlus className="h-6 w-6 text-muted-foreground" />}
                    title="Delegar Listas"
                    description="Atribuir listas para usuários"
                    onClick={() => navigate("/delegate-lists")}
                    variant="secondary"
                />
                <ActionCard
                    icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
                    title="Relatórios"
                    description="Estatísticas por usuário"
                    onClick={() => navigate("/reports")}
                    variant="secondary"
                />
                <ActionCard
                    icon={<History className="h-6 w-6 text-muted-foreground" />}
                    title="Histórico"
                    description="Listas já concluídas"
                    onClick={() => navigate("/history")}
                    variant="secondary"
                />
            </div>
        </div>
    );
}
