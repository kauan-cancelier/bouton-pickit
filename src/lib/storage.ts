// Funções utilitárias para trabalhar com localStorage de forma tipada

export function getData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return [];
  }
}

export function setData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
}

export function clearData(key: string): void {
  localStorage.removeItem(key);
}
