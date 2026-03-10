import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Settings,
  MarkAsRead
} from "lucide-react"

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Nouveau projet assigné",
      message: "Vous avez été assigné au projet Luxe Hotel",
      type: "info",
      time: "Il y a 5 min",
      read: false
    },
    {
      id: 2,
      title: "Deadline approche",
      message: "Le projet StyleShop doit être livré dans 2 jours",
      type: "warning",
      time: "Il y a 1h",
      read: false
    },
    {
      id: 3,
      title: "Validation client",
      message: "Le client a approuvé les maquettes",
      type: "success",
      time: "Il y a 3h",
      read: true
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Centre de notifications et alertes</p>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id} className={!notif.read ? "border-primary/50" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">{notif.title}</h3>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <Badge variant="destructive">Nouveau</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default Notifications