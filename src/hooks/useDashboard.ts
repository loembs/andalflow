import { useQuery } from '@tanstack/react-query';
import { getDashboardService, IDashboardService } from '@/services/api';

export const useDashboard = (dashboardServiceInstance?: IDashboardService) => {
  const svc = dashboardServiceInstance ?? getDashboardService();

  const useGetDashboardStats = () => {
    return useQuery({
      queryKey: ['dashboard', 'stats'],
      queryFn: () => svc.getDashboardStats(),
      staleTime: 1 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    });
  };

  const useGetRecentProjects = (limit: number = 5) => {
    return useQuery({
      queryKey: ['dashboard', 'recent-projects', limit],
      queryFn: () => svc.getRecentProjects(limit),
      staleTime: 2 * 60 * 1000,
    });
  };

  const useGetUpcomingTasks = (limit: number = 10) => {
    return useQuery({
      queryKey: ['dashboard', 'upcoming-tasks', limit],
      queryFn: () => svc.getUpcomingTasks(limit),
      staleTime: 2 * 60 * 1000,
    });
  };

  const useGetProjectProgress = () => {
    return useQuery({
      queryKey: ['dashboard', 'project-progress'],
      queryFn: () => svc.getProjectProgress(),
      staleTime: 2 * 60 * 1000,
    });
  };

  const useGetTeamPerformance = () => {
    return useQuery({
      queryKey: ['dashboard', 'team-performance'],
      queryFn: () => svc.getTeamPerformance(),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    useGetDashboardStats,
    useGetRecentProjects,
    useGetUpcomingTasks,
    useGetProjectProgress,
    useGetTeamPerformance,
  };
};
