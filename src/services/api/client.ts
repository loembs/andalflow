// Client API de base avec intercepteurs
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    // En développement, utilise le proxy Vite (/api) au lieu de l'URL complète
    // Cela évite les problèmes de CORS et nécessite que le backend soit sur localhost:8080
    if (import.meta.env.DEV) {
      this.baseURL = import.meta.env.VITE_API_URL || '/api';
    } else {
      this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    }
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', contentType, text.substring(0, 200));
        throw new Error(`Server returned ${contentType} instead of JSON. Check if backend is running at ${url}`);
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Améliorer le message d'erreur pour "Failed to fetch"
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const errorMessage = `Impossible de se connecter au serveur backend. Vérifiez que:
1. Le serveur backend est démarré sur http://localhost:8080
2. L'URL de l'API est correcte: ${url}
3. Il n'y a pas de problème de réseau ou de firewall`;
        console.error('API request failed:', errorMessage);
        throw new Error(errorMessage);
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Méthodes HTTP de base
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instance singleton
export const apiClient = new ApiClient();
