import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Check if user is logged in on mount
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/users/me');
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/users/login', credentials);
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/users/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
  });

  const login = async (credentials: { email: string; password: string }) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: isLoading || loginMutation.isPending, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}