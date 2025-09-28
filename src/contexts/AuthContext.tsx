import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: string;
  codigo: string;
  nome: string;
}

interface AuthContextType {
  user: Usuario | null;
  login: (codigo: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (codigo: string, senha: string): Promise<boolean> => {
    try {
      // Usuários hardcoded no localStorage para simplicidade
      const usuarios = [
        { id: '1', codigo: 'admin', senha: '123', nome: 'Administrador' },
        { id: '2', codigo: 'picker1', senha: '123', nome: 'Picker 1' },
        { id: '3', codigo: 'picker2', senha: '123', nome: 'Picker 2' },
        { id: '4', codigo: 'picker3', senha: '123', nome: 'Picker 3' }
      ];

      const usuario = usuarios.find(u => u.codigo === codigo && u.senha === senha);
      
      if (!usuario) {
        return false;
      }

      const userData = {
        id: usuario.id,
        codigo: usuario.codigo,
        nome: usuario.nome
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentList');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}