import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    user: {
        nome?: string;
        codigo?: string | number;
    } | null;
    logout: () => void;
}

export function Header({ user, logout }: HeaderProps) {
    return (
        <div className="bg-gradient-to-r from-black to-gray-900 text-white shadow-lg rounded-lg p-6 flex justify-between items-center mb-6">
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
    );
}