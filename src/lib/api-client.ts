import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // 401 sur une tentative de login/MFA = mauvais identifiants : on laisse
        // la page afficher l'erreur (pas de redirection qui masquerait le message).
        const url: string = error.config?.url || '';
        const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/mfa');

        if (error.response?.status === 401 && !isAuthAttempt) {
          Cookies.remove('authToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
