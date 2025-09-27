import { ArrowLeft, Clock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router-dom";
import { formatTime } from "@/lib/textParser";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressHeaderProps {
  completed: number;
  total: number;
  time: number;
}

export function ProgressHeader({ completed, total, time }: ProgressHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/picking-lists')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              {completed} de {total} itens ({percentage}%)
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {user?.codigo}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(time)}
              </div>
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </div>
    </div>
  );
}