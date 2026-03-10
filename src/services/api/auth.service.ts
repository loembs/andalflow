import { apiClient } from './client';
import { LoginForm, RegisterForm, User, ApiResponse, AuthResponse } from '@/types';

// Interface pour le service d'authentification (Principe SOLID - Interface Segregation)
export interface IAuthService {
  login(credentials: LoginForm): Promise<AuthResponse>;
  register(userData: RegisterForm): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<{ token: string }>;
}

// Implémentation du service d'authentification
export class AuthService implements IAuthService {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    apiClient.setToken(response.data.token);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    apiClient.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    // Vérifier d'abord si un utilisateur est stocké localement (connexion par rôle)
    // Cela permet à l'app de fonctionner sans backend pour le moment
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        // Valider que l'utilisateur a la structure attendue
        if (user.id && user.role) {
          return user;
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
        // Continue vers la requête backend
      }
    }

    // Si pas d'utilisateur local, appeler le backend
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    apiClient.setToken(response.data.token);
    return response.data;
  }
}

// Instance singleton
export const authService = new AuthService();
