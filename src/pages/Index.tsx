import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import Development from "./Development";
import Community from "./Community";
import Design from "./Design";
import Writing from "./Writing";

const Index = () => {
  const { user } = useAuth();

  // Fallback pour la période de chargement / absence de profil explicite :
  if (!user) {
    return <AdminDashboard />;
  }

  if (user.role === "ADMIN" || user.role === "ADMIN_ASSISTANT" || user.role === "MANAGER") {
    return <AdminDashboard />;
  }

  if (user.role === "DEVELOPER") {
    return <Development />;
  }

  if (user.role === "COMMUNITY_MANAGER") {
    return <Community />;
  }

  if (user.role === "DESIGNER") {
    return <Design />;
  }

  if (user.role === "CONTENT_MANAGER") {
    return <Writing />;
  }

  // Par défaut, on renvoie la vue globale administrateur
  return <AdminDashboard />;
};

export default Index;
