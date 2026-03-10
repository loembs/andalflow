// Types de base pour l'application - Alignés avec le backend com.andal.flow
export type UserRole =
  | 'ADMIN'
  | 'ADMIN_ASSISTANT'
  | 'MANAGER'
  | 'DEVELOPER'
  | 'DESIGNER'
  | 'COMMUNITY_MANAGER'
  | 'CONTENT_MANAGER';

export type UserRoleLowercase =
  | 'admin'
  | 'admin_assistant'
  | 'manager'
  | 'developer'
  | 'designer'
  | 'community_manager'
  | 'content_manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  enabled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate: string | Date;
  endDate?: string | Date;
  budget?: number;
  userId: string; // Propriétaire du projet
  teamMembers: string[]; // IDs des membres de l'équipe
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type ProjectActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'ASSIGN';

export interface ProjectAction {
  id: string;
  type: ProjectActionType;
  description: string;
  metadata?: string;
  timestamp: string | Date;
  userId: string;
  projectId: string;
}

export interface ProjectTracking {
  id: string;
  title: string;
  description: string;
  progress: number;
  createdAt: string | Date;
  projectId: string;
  userId: string;
}

// Types pour les tâches (peuvent être ajoutés plus tard si nécessaire)
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  userId: string;
  createdAt: Date;
}

// --- Domaines Supabase : clients, factures, feedback, rappels ---

export interface Client {
  id: string;
  name: string;
  company?: string;
  contactEmail?: string;
  phone?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string | Date;
  dueDate?: string | Date;
  totalHt: number;
  totalTtc: number;
  currency: string;
  templateName?: string;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface ClientFeedback {
  id: string;
  clientId?: string;
  projectId?: string;
  authorId?: string;
  channel?: string;
  message: string;
  status: FeedbackStatus;
  sentiment?: string;
  createdAt: string | Date;
  resolvedAt?: string | Date;
}

export type ReminderStatus = 'PENDING' | 'DONE' | 'CANCELLED';

export interface Reminder {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueAt: string | Date;
  status: ReminderStatus;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DashboardStats {
  activeProjects: number;
  teamMembers: number;
  tasksInProgress: number;
  completionRate: number;
  trends: {
    projects: { value: number; type: 'increase' | 'decrease' };
    tasks: { value: number; type: 'increase' | 'decrease' };
    completion: { value: number; type: 'increase' | 'decrease' };
  };
}

// Types pour les réponses API - Alignés avec le backend
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// DTO pour la réponse d'authentification
export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateProjectForm {
  name: string;
  client: string;
  description: string;
  priority: ProjectPriority;
  startDate: Date | string;
  endDate?: Date | string;
  budget?: number;
  teamMembers: string[];
}

export interface CreateTaskForm {
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}
