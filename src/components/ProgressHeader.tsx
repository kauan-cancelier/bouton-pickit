import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/textParser";

interface ProgressHeaderProps {
  completed: number;
  total: number;
  time: number;
}

export function ProgressHeader({ completed, total, time }: ProgressHeaderProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-background border-b border-border p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-foreground">
          {completed} de {total} concluídos – {percentage}%
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {formatTime(time)}
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}