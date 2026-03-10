import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  FolderKanban,
  Users,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

// Composant View pour les actions rapides (Principe MVP)
export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Actions par défaut
      switch (action) {
        case 'create-project':
          navigate('/projects');
          break;
        case 'schedule-meeting':
          navigate('/messages');
          break;
        case 'team-message':
          navigate('/messages');
          break;
        case 'analytics':
          navigate('/analytics');
          break;
        case 'manage-projects':
          navigate('/projects');
          break;
        case 'manage-team':
          navigate('/team');
          break;
        case 'settings':
          navigate('/settings');
          break;
        default:
          break;
      }
    }
  };

  const actions = [
    {
      id: 'create-project',
      label: 'Créer un projet',
      icon: Plus,
      variant: 'outline' as const,
    },
    {
      id: 'schedule-meeting',
      label: 'Planifier réunion',
      icon: Calendar,
      variant: 'outline' as const,
    },
    {
      id: 'team-message',
      label: 'Message équipe',
      icon: MessageSquare,
      variant: 'outline' as const,
    },
    {
      id: 'analytics',
      label: 'Rapport analytics',
      icon: TrendingUp,
      variant: 'outline' as const,
    },
    {
      id: 'manage-projects',
      label: 'Gérer projets',
      icon: FolderKanban,
      variant: 'outline' as const,
    },
    {
      id: 'manage-team',
      label: 'Gérer équipe',
      icon: Users,
      variant: 'outline' as const,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start"
              onClick={() => handleAction(action.id)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
