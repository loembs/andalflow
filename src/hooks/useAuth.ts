import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthService, type IAuthService } from '@/services/api';
import { User, LoginForm, RegisterForm } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Hook personnalisé pour l'authentification (Principe SOLID - Dependency Inversion)
export const useAuth = (authServiceInstance: IAuthService = getAuthService()) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginForm) => authServiceInstance.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${data.user.name}!`,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      });
    },
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterForm) => authServiceInstance.register(userData),
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      toast({
        title: "Inscription réussie",
        description: `Compte créé avec succès pour ${data.user.name}!`,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
    },
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: () => authServiceInstance.logout(),
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      localStorage.removeItem('user');
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/login');
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      // Même en cas d'erreur, on déconnecte localement
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      localStorage.removeItem('user');
      navigate('/login');
    },
  });

  // Effet pour initialiser l'authentification au démarrage
  useEffect(() => {
    setIsLoadingInitial(true);

    if (!supabase) {
      // Mode sans Supabase (démo) : charger depuis localStorage directement
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const localUser = JSON.parse(stored) as User;
          if (localUser.id && localUser.role) {
            setUser(localUser);
            setIsAuthenticated(true);
          }
        } catch {
          localStorage.removeItem('user');
        }
      }
      setIsLoadingInitial(false);
      return;
    }

    // Mode Supabase : vérifier la session JWT réelle avant tout
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Session Supabase valide → charger le profil depuis localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const localUser = JSON.parse(stored) as User;
            if (localUser.id && localUser.role) {
              setUser(localUser);
              setIsAuthenticated(true);
              setIsLoadingInitial(false);
              return;
            }
          } catch {
            localStorage.removeItem('user');
          }
        }
        // Session valide mais profil absent → forcer reconnexion
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Pas de session Supabase valide → nettoyer localStorage et forcer reconnexion
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingInitial(false);
    });

    // Écouter les changements de session (expiration, refresh, déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return {
    user,
    isAuthenticated,
    isLoadingUser: isLoadingInitial,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
