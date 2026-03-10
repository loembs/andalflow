import { StatCard } from "@/components/ui/stat-card";
import { DashboardStats as DashboardStatsType } from "@/types";
import { 
  Users, 
  FolderKanban, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isLoading?: boolean;
}

// Composant View pour les statistiques (Principe MVP)
export const DashboardStats = ({ stats, isLoading = false }: DashboardStatsProps) => {
  const getIcon = (title: string) => {
    switch (title) {
      case "Projets actifs":
        return FolderKanban;
      case "Équipe":
        return Users;
      case "Tâches en cours":
        return Clock;
      case "Taux de completion":
        return Target;
      default:
        return Target;
    }
  };

  const getVariant = (title: string) => {
    switch (title) {
      case "Projets actifs":
        return "success" as const;
      case "Taux de completion":
        return "success" as const;
      case "Tâches en cours":
        return "warning" as const;
      default:
        return "default" as const;
    }
  };

  const statsData = [
    {
      title: "Projets actifs",
      value: stats.activeProjects.toString(),
      description: "Projets en cours",
      icon: getIcon("Projets actifs"),
      trend: stats.trends.projects,
      variant: getVariant("Projets actifs")
    },
    {
      title: "Équipe",
      value: stats.teamMembers.toString(),
      description: "Membres actifs",
      icon: getIcon("Équipe"),
      variant: getVariant("Équipe")
    },
    {
      title: "Tâches en cours",
      value: stats.tasksInProgress.toString(),
      description: "Tâches actives",
      icon: getIcon("Tâches en cours"),
      trend: stats.trends.tasks,
      variant: getVariant("Tâches en cours")
    },
    {
      title: "Taux de completion",
      value: `${stats.completionRate}%`,
      description: "Objectif mensuel",
      icon: getIcon("Taux de completion"),
      trend: stats.trends.completion,
      variant: getVariant("Taux de completion")
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
