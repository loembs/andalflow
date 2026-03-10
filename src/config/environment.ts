// Configuration de l'environnement (Principe SOLID - Single Responsibility)
export const config = {
  // Configuration API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Configuration Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    authProvider: (import.meta.env.VITE_AUTH_PROVIDER || 'auto') as
      | 'supabase'
      | 'backend'
      | 'auto',
  },

  // Configuration de l'application
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Andal Flow',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // Configuration des fonctionnalités
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  },

  // Configuration de développement
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validation de la configuration
export const validateConfig = () => {
  const requiredEnvVars = ['VITE_API_URL'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Variables d'environnement manquantes: ${missingVars.join(', ')}`
    );
  }

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
      '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY non définies. ' +
      'Activez-les pour utiliser Supabase comme backend d’authentification.'
    );
  }

  return missingVars.length === 0;
};
