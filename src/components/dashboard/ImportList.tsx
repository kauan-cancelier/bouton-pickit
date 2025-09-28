import { Camera, FileText } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";

interface ImportListProps {
    handleScanList: () => void;
    handleImportTxt: () => void;
    isProcessing?: boolean;
}

export function ImportList({handleScanList, handleImportTxt, isProcessing = false}: ImportListProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Importar Lista</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                    icon={<Camera className="h-8 w-8 text-primary" />}
                    title="Escanear"
                    description="Capturar lista com a câmera (experimental)"
                    onClick={handleScanList}
                    disabled={isProcessing}
                    loading={isProcessing}
                />
                <ActionCard
                    icon={<FileText className="h-8 w-8 text-primary" />}
                    title="Importar TXT"
                    description="Selecionar arquivo de texto"
                    onClick={handleImportTxt}
                />
            </div>
        </div>
    );
}
