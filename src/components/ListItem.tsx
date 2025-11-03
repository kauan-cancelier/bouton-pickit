import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { ParsedItem } from "@/lib/textParser";

interface ListItemProps {
  item: ParsedItem;
  onToggle: (pos: number) => void;
  onOutOfStock: (pos: number) => void;
}

export function ListItem({ item, onToggle, onOutOfStock }: ListItemProps) {
  const isOutOfStock = item.foraDeEstoque || false;

  return (
    <Card className={`p-4 mb-3 shadow-sm border ${isOutOfStock ? 'border-orange-300 bg-orange-50' : 'border-border bg-card'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`item-${item.pos}`}
          checked={item.concluido}
          onCheckedChange={() => onToggle(item.pos)}
          className="mt-1 h-6 w-6"
          disabled={isOutOfStock}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-foreground">
              POS {item.pos}
            </div>
            {isOutOfStock && (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Fora de Estoque
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Código:</span> {item.codigo}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Descrição:</span> {item.descricao}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Quantidade:</span> {item.quantidade}
          </div>
          {!isOutOfStock && !item.concluido && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOutOfStock(item.pos);
              }}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Marcar Fora de Estoque
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}