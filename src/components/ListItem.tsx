import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ParsedItem } from "@/lib/textParser";

interface ListItemProps {
  item: ParsedItem;
  onToggle: (pos: number) => void;
}

export function ListItem({ item, onToggle }: ListItemProps) {
  return (
    <Card className="p-4 mb-3 shadow-sm border border-border bg-card">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`item-${item.pos}`}
          checked={item.concluido}
          onCheckedChange={() => onToggle(item.pos)}
          className="mt-1 h-6 w-6"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground mb-1">
            POS {item.pos}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Código:</span> {item.codigo}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Descrição:</span> {item.descricao}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Quantidade:</span> {item.quantidade}
          </div>
        </div>
      </div>
    </Card>
  );
}