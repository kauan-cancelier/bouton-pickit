// Função para limpar dados antigos e inicializar com o novo formato
export function initializeLocalStorage() {
  // Verifica se já existe dados no formato antigo e limpa
  const oldListas = localStorage.getItem('listas');
  if (oldListas) {
    try {
      const parsed = JSON.parse(oldListas);
      // Se não tem o campo status, é formato antigo
      if (parsed.length > 0 && !parsed[0].hasOwnProperty('status')) {
        console.log('Removendo dados no formato antigo...');
        localStorage.removeItem('listas');
        localStorage.removeItem('itens');
      }
    } catch (error) {
      console.error('Erro ao verificar formato dos dados:', error);
    }
  }
}