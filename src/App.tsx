import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEdit from "./pages/ProjectEdit";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import FeedbackPage from "./pages/Feedback";
import RemindersPage from "./pages/Reminders";
import Community from "./pages/Community";
import Development from "./pages/Development";
import Design from "./pages/Design";
import Writing from "./pages/Writing";
import Messages from "./pages/Messages";
import Team from "./pages/Team";
import UserProfile from "./pages/UserProfile";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Configuration du QueryClient avec des options optimisées
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Composant App principal avec architecture MVP (Principe MVP - Presenter)
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />

          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />

          <Route path="/projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          } />
          
          <Route path="/clients" element={
            <ProtectedRoute requiredRole={["ADMIN", "ADMIN_ASSISTANT", "MANAGER"]}>
              <Clients />
            </ProtectedRoute>
          } />
          
          <Route path="/invoices" element={
            <ProtectedRoute requiredRole={["ADMIN", "ADMIN_ASSISTANT", "MANAGER"]}>
              <Invoices />
            </ProtectedRoute>
          } />
          
          <Route path="/feedback" element={
            <ProtectedRoute requiredRole={["ADMIN", "ADMIN_ASSISTANT", "MANAGER", "COMMUNITY_MANAGER", "CONTENT_MANAGER", "DESIGNER"]}>
              <FeedbackPage />
            </ProtectedRoute>
          } />
          
          <Route path="/reminders" element={
            <ProtectedRoute requiredRole={["ADMIN", "ADMIN_ASSISTANT", "MANAGER"]}>
              <RemindersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/community" element={
            <ProtectedRoute requiredRole={["COMMUNITY_MANAGER", "ADMIN", "ADMIN_ASSISTANT"]}>
              <Community />
            </ProtectedRoute>
          } />
          
          <Route path="/development" element={
            <ProtectedRoute requiredRole={["DEVELOPER", "ADMIN", "ADMIN_ASSISTANT"]}>
              <Development />
            </ProtectedRoute>
          } />
          
          <Route path="/design" element={
            <ProtectedRoute requiredRole={["DESIGNER", "ADMIN", "ADMIN_ASSISTANT"]}>
              <Design />
            </ProtectedRoute>
          } />
          
          <Route path="/writing" element={
            <ProtectedRoute requiredRole={["CONTENT_MANAGER", "ADMIN", "ADMIN_ASSISTANT"]}>
              <Writing />
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } />

          {/* Simple user profile page (no complex auth required for now) */}
          <Route path="/users/:id" element={<UserProfile />} />
          
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Route catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
