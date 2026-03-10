# Architecture Andal Flow - Frontend

## Vue d'ensemble

Cette application frontend est construite avec **React + TypeScript** en suivant les principes **SOLID** et l'architecture **MVP (Model-View-Presenter)**. Elle utilise des technologies modernes comme **TanStack Query**, **React Hook Form**, **Zod** et **shadcn/ui**.

## Principes SOLID appliqués

### 1. Single Responsibility Principle (SRP)
- Chaque service a une responsabilité unique et bien définie
- Les composants sont spécialisés dans leur domaine (affichage, logique métier, etc.)
- Les hooks personnalisés gèrent un aspect spécifique de l'application

### 2. Open/Closed Principle (OCP)
- Les services sont extensibles via des interfaces
- Les composants acceptent des props pour personnalisation
- L'architecture permet d'ajouter de nouvelles fonctionnalités sans modifier le code existant

### 3. Liskov Substitution Principle (LSP)
- Les interfaces définissent des contrats clairs
- Les implémentations peuvent être substituées sans affecter le comportement
- Les hooks acceptent des instances de services injectables

### 4. Interface Segregation Principle (ISP)
- Interfaces spécifiques pour chaque domaine (IAuthService, IProjectService, etc.)
- Les composants ne dépendent que des interfaces dont ils ont besoin
- Séparation claire des responsabilités

### 5. Dependency Inversion Principle (DIP)
- Les hooks dépendent d'abstractions (interfaces) plutôt que de concrets
- Injection de dépendances via les paramètres des hooks
- Couplage faible entre les couches

## Architecture MVP

### Model
- **Types** (`src/types/`) : Définitions TypeScript des entités
- **Services** (`src/services/`) : Logique métier et communication API
- **Hooks** (`src/hooks/`) : Gestion d'état et logique de présentation

### View
- **Composants UI** (`src/components/ui/`) : Composants réutilisables
- **Composants métier** (`src/components/projects/`, etc.) : Composants spécifiques au domaine
- **Pages** (`src/pages/`) : Vues principales de l'application

### Presenter
- **Pages** : Orchestrent les composants et la logique
- **Hooks personnalisés** : Gèrent l'état et les interactions
- **Services** : Encapsulent la logique métier

## Structure des dossiers

```
src/
├── components/           # Composants React
│   ├── ui/              # Composants UI réutilisables (shadcn/ui)
│   ├── auth/            # Composants d'authentification
│   ├── dashboard/       # Composants du dashboard
│   ├── projects/        # Composants de gestion des projets
│   └── layout/          # Composants de mise en page
├── hooks/               # Hooks personnalisés
│   ├── useAuth.ts       # Gestion de l'authentification
│   ├── useProjects.ts   # Gestion des projets
│   ├── useDashboard.ts  # Gestion du dashboard
│   └── usePermissions.ts # Gestion des permissions
├── services/            # Services et logique métier
│   ├── api/             # Services API
│   └── permissions.service.ts # Service de permissions
├── types/               # Types TypeScript
│   ├── index.ts         # Types de base
│   └── permissions.ts   # Types pour les permissions
├── utils/               # Utilitaires
│   └── logger.ts        # Service de logging
├── config/              # Configuration
│   └── environment.ts   # Variables d'environnement
└── pages/               # Pages de l'application
```

## Gestion des permissions

### Système de rôles
- **Admin** : Accès complet à tous les projets et fonctionnalités
- **Manager** : Gestion des projets et équipes
- **Developer** : Création et modification de ses projets
- **Designer** : Création et modification de ses projets

### Permissions par fonctionnalité
- `create_project` : Créer un projet
- `view_project` : Voir un projet
- `edit_project` : Modifier un projet
- `delete_project` : Supprimer un projet (Admin uniquement)
- `view_all_projects` : Voir tous les projets
- `manage_team` : Gérer les équipes
- `view_analytics` : Voir les analytics
- `manage_users` : Gérer les utilisateurs

## Gestion d'état

### TanStack Query
- Cache intelligent des données
- Synchronisation automatique
- Gestion des états de chargement et d'erreur
- Invalidation automatique du cache

### React Hook Form + Zod
- Validation des formulaires
- Gestion des erreurs
- Performance optimisée
- Type safety

## Communication API

### Client API
- Intercepteurs pour l'authentification
- Gestion automatique des tokens
- Retry automatique en cas d'erreur
- Gestion des erreurs centralisée

### Services
- Interface commune pour tous les services
- Méthodes CRUD standardisées
- Gestion des réponses typées
- Séparation des responsabilités

## Sécurité

### Authentification
- JWT tokens
- Refresh automatique
- Protection des routes
- Gestion des sessions

### Autorisation
- Vérification des permissions côté client
- Protection des composants sensibles
- Filtrage des données selon les rôles

## Performance

### Optimisations
- Lazy loading des composants
- Memoization avec React.memo
- Code splitting automatique
- Cache intelligent avec TanStack Query

### Monitoring
- Service de logging configurable
- Gestion des erreurs centralisée
- Métriques de performance

## Tests

### Stratégie de test
- Tests unitaires pour les services
- Tests d'intégration pour les hooks
- Tests de composants avec React Testing Library
- Tests E2E avec Playwright

## Déploiement

### Configuration
- Variables d'environnement
- Build optimisé pour la production
- Service Worker pour le cache
- PWA ready

### CI/CD
- Linting automatique
- Tests automatiques
- Build et déploiement automatisés
- Monitoring des performances

## Extensibilité

### Ajout de nouvelles fonctionnalités
1. Créer les types dans `src/types/`
2. Implémenter le service dans `src/services/`
3. Créer le hook dans `src/hooks/`
4. Développer les composants dans `src/components/`
5. Ajouter la page dans `src/pages/`

### Ajout de nouveaux rôles
1. Étendre les types dans `src/types/permissions.ts`
2. Mettre à jour `ROLE_PERMISSIONS`
3. Ajouter les méthodes dans `PermissionService`
4. Tester les nouvelles permissions

## Bonnes pratiques

### Code
- TypeScript strict
- ESLint + Prettier
- Commits conventionnels
- Documentation des composants

### Architecture
- Séparation des responsabilités
- Injection de dépendances
- Interfaces bien définies
- Tests automatisés

### Performance
- Lazy loading
- Memoization
- Optimisation des re-renders
- Bundle splitting
