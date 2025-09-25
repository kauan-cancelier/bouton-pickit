import { createWorker } from 'tesseract.js';
import { parseListText } from './textParser';

export async function extractTextFromImage(imageFile: File | Blob): Promise<string> {
  try {
    const worker = await createWorker('por', 1, {
      logger: m => console.log(m)
    });
    
    const ret = await worker.recognize(imageFile);
    await worker.terminate();
    
    return ret.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Erro ao processar a imagem. Tente novamente.');
  }
}

export async function processImageAndExtractItems(imageFile: File | Blob) {
  try {
    const extractedText = await extractTextFromImage(imageFile);
    console.log('Extracted text:', extractedText);
    
    const items = parseListText(extractedText);
    
    if (items.length === 0) {
      throw new Error('Nenhum item válido encontrado na imagem. Verifique se a lista está legível e tente novamente.');
    }
    
    return items;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}