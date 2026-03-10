import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();

  // For now we don't fetch from the backend. This is a simple static view based on the id.
  // Later we can call the API (e.g. /api/users/:id) to load real data.

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profil utilisateur</h1>
          <p className="text-muted-foreground">Détails du membre — id: {id}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{id?.toString().slice(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Membre #{id}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Information basique — nom, rôle, contact, etc.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">Aucune donnée réelle chargée pour le moment. Implémenter un appel API pour récupérer les informations du profil si nécessaire.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
