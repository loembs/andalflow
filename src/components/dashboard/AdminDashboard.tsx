import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import { useFeedback } from "@/hooks/useFeedback";
import { useReminders } from "@/hooks/useReminders";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Plus,
  Bell,
  MessageSquare,
  FolderKanban,
  Contact2,
  FileText,
  AlarmClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    useGetDashboardStats,
    useGetRecentProjects,
  } = useDashboard();

  const { data: dashboardStats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: recentProjects, isLoading: isLoadingProjects } = useGetRecentProjects(4);

  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { feedback } = useFeedback();
  const { reminders } = useReminders();

  const navigate = useNavigate();
  const useSupabase = !!supabase;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          {/* En-tête global admin */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Vue globale Andal Flow
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {user ? `Espace administrateur — ${user.name}` : "Espace administrateur"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-border/80 bg-card/80"
                onClick={() => navigate("/messages")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Planning équipe
              </Button>
              <Button
                size="sm"
                className="rounded-2xl shadow-md"
                onClick={() => navigate("/projects")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Button>
            </div>
          </header>

          {/* Statistiques globales */}
          {dashboardStats && (
            <section>
              <DashboardStats stats={dashboardStats} isLoading={isLoadingStats} />
            </section>
          )}

          {/* Compteurs temps réel (Supabase) */}
          {useSupabase && (
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card
                className="rounded-2xl border-border/70 bg-card/80 backdrop-blur cursor-pointer transition hover:shadow-md hover:border-primary/20"
                onClick={() => navigate("/clients")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Contact2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{clients.length}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="rounded-2xl border-border/70 bg-card/80 backdrop-blur cursor-pointer transition hover:shadow-md hover:border-primary/20"
                onClick={() => navigate("/invoices")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{invoices.length}</p>
                    <p className="text-xs text-muted-foreground">Factures</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="rounded-2xl border-border/70 bg-card/80 backdrop-blur cursor-pointer transition hover:shadow-md hover:border-primary/20"
                onClick={() => navigate("/feedback")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{feedback.length}</p>
                    <p className="text-xs text-muted-foreground">Feedback</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="rounded-2xl border-border/70 bg-card/80 backdrop-blur cursor-pointer transition hover:shadow-md hover:border-primary/20"
                onClick={() => navigate("/reminders")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <AlarmClock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{reminders.length}</p>
                    <p className="text-xs text-muted-foreground">Rappels</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              {recentProjects && (
                <RecentProjects
                  projects={recentProjects}
                  isLoading={isLoadingProjects}
                />
              )}

              <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Modules principaux</CardTitle>
                  <CardDescription className="text-sm">
                    Accès rapide aux boards transverses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 justify-start gap-3 rounded-2xl border-border/70"
                      onClick={() => navigate("/projects")}
                    >
                      <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Projets</p>
                        <p className="text-xs text-muted-foreground">Vue globale</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 justify-start gap-3 rounded-2xl border-border/70"
                      onClick={() => navigate("/invoices")}
                    >
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Factures</p>
                        <p className="text-xs text-muted-foreground">Paiements</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 justify-start gap-3 rounded-2xl border-border/70"
                      onClick={() => navigate("/feedback")}
                    >
                      <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Feedback</p>
                        <p className="text-xs text-muted-foreground">Retours clients</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <QuickActions />

              <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Contact2 className="h-4 w-4" />
                    Clients & rappels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-lg"
                    onClick={() => navigate("/clients")}
                  >
                    <Contact2 className="h-4 w-4 mr-2" />
                    Board Clients
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-lg"
                    onClick={() => navigate("/reminders")}
                  >
                    <AlarmClock className="h-4 w-4 mr-2" />
                    Rappels
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Aucune notification pour le moment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

