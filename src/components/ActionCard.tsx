import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function ActionCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = "primary"
}: ActionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <Button 
          onClick={onClick}
          className={`w-full h-auto p-6 flex flex-col items-center gap-4 ${
            variant === "primary" ? "" : "text-left justify-start flex-row"
          }`}
          variant="outline"
          disabled={disabled || loading}
        >
          {loading ? (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          ) : (
            icon
          )}
          <div className={`text-center ${variant === "secondary" ? "text-left flex-1" : ""}`}>
            <div className={`font-semibold ${variant === "primary" ? "text-lg" : "text-sm"}`}>
              {loading ? "Processando..." : title}
            </div>
            <div className={`text-muted-foreground mt-1 ${variant === "primary" ? "text-sm" : "text-xs"}`}>
              {loading ? "Extraindo texto da imagem" : description}
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}