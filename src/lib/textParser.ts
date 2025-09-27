export interface ParsedItem {
  pos: number;
  codigo: string;
  descricao: string;
  quantidade: number;
  concluido: boolean;
}

export function parseListText(text: string): ParsedItem[] {
  const lines = text.split('\n');
  const items: ParsedItem[] = [];
  
  let startParsing = false;
  
  for (const line of lines) {
    // Start parsing after finding the header
    if (line.includes('POS. LOCALIZ. LOTE')) {
      startParsing = true;
      continue;
    }
    
    // Stop parsing when reaching TOTAL
    if (line.includes('TOTAL') && startParsing) {
      break;
    }
    
    // Skip empty lines, separators, and headers
    if (!startParsing || line.trim() === '' || line.includes('---')) {
      continue;
    }
    
    // Parse the line - updated regex for the new format
    // Looking for: POS CODE QUANTITY ITEM_NUMBER DESCRIPTION
    const regex = /^\s*(\d+)\s+([A-Z0-9]+)\s+(\d+,\d+)\s+(\d+)\s+(.+?)\s+PC\s+/i;
    const match = line.match(regex);
    
    if (match) {
      const [, posStr, codigo, quantidadeStr, itemNumber, descricaoRaw] = match;
      const pos = parseInt(posStr);
      const quantidade = parseFloat(quantidadeStr.replace(',', '.'));
      
      // Clean description - remove extra trailing info after the main description
      const descricao = descricaoRaw
        .replace(/\s+/g, ' ')
        .trim();
      
      items.push({
        pos,
        codigo,
        descricao,
        quantidade,
        concluido: false
      });
    }
  }
  
  return items;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}