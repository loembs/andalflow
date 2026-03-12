import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  User,
  Calendar
} from "lucide-react";
import { ProjectAction } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectActivityProps {
  actions: ProjectAction[];
  isLoading?: boolean;
  onAddAction?: () => void;
}

// Composant d'activité de projet (Principe MVP - View)
export const ProjectActivity = ({ 
  actions, 
  isLoading = false,
  onAddAction 
}: ProjectActivityProps) => {
  const getActionIcon = (type: ProjectAction['type']) => {
    switch (type) {
      case 'CREATE':
        return Plus;
      case 'UPDATE':
        return Edit;
      case 'DELETE':
        return Trash2;
      case 'STATUS_CHANGE':
        return CheckCircle;
      case 'ASSIGN':
        return User;
      default:
        return Activity;
    }
  };

  const getActionColor = (type: ProjectAction['type']) => {
    switch (type) {
      case 'CREATE':
        return 'text-green-600 bg-green-100';
      case 'UPDATE':
        return 'text-blue-600 bg-blue-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      case 'STATUS_CHANGE':
        return 'text-purple-600 bg-purple-100';
      case 'ASSIGN':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionLabel = (type: ProjectAction['type']) => {
    switch (type) {
      case 'CREATE':
        return 'Création';
      case 'UPDATE':
        return 'Modification';
      case 'DELETE':
        return 'Suppression';
      case 'STATUS_CHANGE':
        return 'Changement de statut';
      case 'ASSIGN':
        return 'Assignation';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité du projet
            </CardTitle>
            <CardDescription>
              Historique des actions et modifications récentes
            </CardDescription>
          </div>
          {onAddAction && (
            <Button size="sm" onClick={onAddAction}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une action
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
            <p className="text-muted-foreground">
              Aucune action n'a encore été effectuée sur ce projet.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {actions.map((action) => {
                const IconComponent = getActionIcon(action.type);
                return (
                  <div key={action.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getActionColor(action.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getActionLabel(action.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(action.timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm">{action.description}</p>
                      {action.metadata && Object.keys(action.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(action.metadata).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
