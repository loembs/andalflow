import type { LoginForm, RegisterForm, User, AuthResponse } from '@/types';
import type { IAuthService } from './auth.service';
import { supabase } from '@/lib/supabaseClient';
import { config } from '@/config/environment';

// Service d'authentification basé sur Supabase
export class SupabaseAuthService implements IAuthService {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    if (!supabase) {
      throw new Error(
        'Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user || !data.session) {
      throw new Error(error?.message ?? 'Échec de la connexion Supabase');
    }

    const user = await this.buildUserFromSupabase(data.user.id);

    // Stocker l’utilisateur au même endroit que l’auth backend
    window.localStorage.setItem('user', JSON.stringify(user));

    return {
      user,
      token: data.session.access_token,
    };
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    if (!supabase) {
      throw new Error(
        'Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Échec de la création de compte Supabase');
    }

    // Optionnel : créer/mettre à jour un profil dans une table "profiles"
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: userData.name,
          role: 'DEVELOPER', // rôle par défaut, à ajuster dans l’UI d’admin
        });
    } catch (e) {
      if (config.isDevelopment) {
        console.warn('[Supabase] Impossible de mettre à jour la table profiles:', e);
      }
    }

    const user = await this.buildUserFromSupabase(data.user.id);

    window.localStorage.setItem('user', JSON.stringify(user));

    return {
      user,
      token: data.session?.access_token ?? '',
    };
  }

  async logout(): Promise<void> {
    if (!supabase) {
      window.localStorage.removeItem('user');
      return;
    }

    await supabase.auth.signOut();
    window.localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    // 1. Essayer d’abord depuis localStorage pour rester compatible avec le reste de l’app
    const stored = window.localStorage.getItem('user');
    if (stored) {
      try {
        const localUser = JSON.parse(stored) as User;
        if (localUser.id && localUser.role) {
          return localUser;
        }
      } catch {
        window.localStorage.removeItem('user');
      }
    }

    if (!supabase) {
      throw new Error(
        'Supabase n’est pas configuré. Impossible de récupérer l’utilisateur courant.'
      );
    }

    // 2. Utiliser la session Supabase
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error(error?.message ?? 'Utilisateur Supabase non authentifié');
    }

    const user = await this.buildUserFromSupabase(data.user.id);
    window.localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  // Supabase gère la rotation de token, on renvoie simplement l’access_token courant
  async refreshToken(): Promise<{ token: string }> {
    if (!supabase) {
      throw new Error(
        'Supabase n’est pas configuré. Impossible de rafraîchir le token.'
      );
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      throw new Error(error?.message ?? 'Session Supabase introuvable');
    }

    return { token: data.session.access_token };
  }

  private async buildUserFromSupabase(userId: string): Promise<User> {
    if (!supabase) {
      throw new Error('Supabase non initialisé');
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Utilisateur Supabase non trouvé');
    }

    const { user } = authData;

    // Récupérer le profil étendu dans la table "profiles"
    let fullName = (user.user_metadata as any)?.name ?? user.email ?? 'Utilisateur';
    let role = (user.user_metadata as any)?.role ?? 'DEVELOPER';
    let avatar: string | undefined;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[Auth] Erreur lecture profil Supabase:', profileError.message);
    } else if (profile) {
      fullName = profile.full_name ?? fullName;
      role = profile.role ?? role;
      avatar = profile.avatar_url ?? avatar;
    } else {
      // Aucune ligne dans profiles → créer automatiquement avec rôle DEVELOPER
      console.warn('[Auth] Aucun profil trouvé pour', user.id, '— création automatique');
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        role: 'DEVELOPER',
      });
    }

    const mappedUser: User = {
      id: user.id,
      email: user.email ?? '',
      name: fullName,
      role: role as User['role'],
      avatar,
      enabled: !user.banned_until,
      createdAt: user.created_at ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mappedUser;
  }
}

export const supabaseAuthService = new SupabaseAuthService();

