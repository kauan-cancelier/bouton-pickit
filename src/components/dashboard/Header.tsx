import { LogOut, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    user: {
        nome?: string;
        codigo?: string | number;
    } | null;
    logout: () => void;
    onPopulateMockData?: () => void;
}

export function Header({ user, logout, onPopulateMockData }: HeaderProps) {
    return (
        <div className="bg-gradient-to-r from-black to-gray-900 text-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-wide">Tick-It</h1>
                    <p className="text-sm opacity-90 mt-1">
                        Bem-vindo, {user?.nome} ({user?.codigo})
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={logout}
                    size="sm"
                    className="text-black border-white hover:bg-white hover:text-blue-700"
                >
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
            </div>
            {onPopulateMockData && (
                <Button
                    variant="secondary"
                    onClick={onPopulateMockData}
                    size="sm"
                    className="w-full"
                >
                    <Database className="h-4 w-4 mr-2" /> Popular com Dados de Exemplo
                </Button>
            )}
        </div>
    );
}