import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/textParser";

interface CompletedState {
  totalTime: number;
  totalItems: number;
}

export default function CompletedView() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CompletedState | null;

  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  const handleBackHome = () => {
    // Clear current list from localStorage
    localStorage.removeItem('currentList');
    navigate('/');
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ✅ Lista concluída!
            </h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Tempo total gasto
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {formatTime(state.totalTime)}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Total de itens processados
              </div>
              <div className="text-2xl font-bold text-foreground">
                {state.totalItems}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleBackHome}
            className="w-full"
            size="lg"
          >
            Voltar ao início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}