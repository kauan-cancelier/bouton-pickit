import { History } from "lucide-react";
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
