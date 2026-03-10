import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Plus,
  Filter,
  BarChart3,
  Users,
  Image,
  Video,
  Hash,
  CheckCircle,
  AlertCircle,
  Pause
} from "lucide-react"
import { useState } from "react"

const Community = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const posts = [
    {
      id: 1,
      title: "Lancement nouvelle collection été",
      client: "StyleShop",
      platform: "Instagram",
      type: "Carrousel",
      status: "Publié",
      engagement: { likes: 1240, comments: 89, shares: 23 },
      scheduledFor: "2024-01-15T14:00:00",
      content: "Découvrez notre nouvelle collection été 2024 ☀️ #StyleShop #Mode #Été2024"
    },
    {
      id: 2,
      title: "Story: Behind the scenes",
      client: "Bistro Moderne",
      platform: "Instagram",
      type: "Story",
      status: "En attente",
      scheduledFor: "2024-01-16T09:30:00",
      content: "Coulisses de notre chef préparant le menu du jour 👨‍🍳"
    },
    {
      id: 3,
      title: "Post produit phare",
      client: "FinTech Pro",
      platform: "LinkedIn",
      type: "Image",
      status: "Programmé",
      scheduledFor: "2024-01-16T16:00:00",
      content: "Innovation dans les services bancaires mobiles. L'avenir est déjà là ! 💳"
    },
    {
      id: 4,
      title: "Vidéo testimonial client",
      client: "Luxe Hotel",
      platform: "Facebook",
      type: "Vidéo",
      status: "En révision",
      scheduledFor: "2024-01-17T11:00:00",
      content: "Témoignage d'un client satisfait de son séjour dans notre suite présidentielle"
    }
  ]

  const campaigns = [
    {
      name: "Campagne Été StyleShop",
      client: "StyleShop",
      status: "Active",
      budget: "5 000€",
      reach: "45.2K",
      engagement: "8.4%",
      posts: 12,
      period: "Jan 15 - Feb 15"
    },
    {
      name: "Promotion Bistro",
      client: "Bistro Moderne", 
      status: "Planifiée",
      budget: "2 000€",
      reach: "0",
      engagement: "0%",
      posts: 8,
      period: "Jan 20 - Feb 10"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publié": return "bg-success text-success-foreground"
      case "Programmé": return "bg-info text-info-foreground"
      case "En attente": return "bg-warning text-warning-foreground"
      case "En révision": return "bg-secondary text-secondary-foreground"
      default: return "bg-muted"
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram": return "📷"
      case "Facebook": return "📘" 
      case "LinkedIn": return "💼"
      case "Twitter": return "🐦"
      default: return "📱"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Image": return <Image className="h-4 w-4" />
      case "Vidéo": return <Video className="h-4 w-4" />
      case "Carrousel": return <Hash className="h-4 w-4" />
      case "Story": return <Eye className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Manager</h1>
            <p className="text-muted-foreground">
              Gestion du calendrier éditorial et des réseaux sociaux
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau post
            </Button>
          </div>
        </div>

        {/* Mon travail du jour (vue community manager) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Posts du jour</p>
                <p className="text-2xl font-bold">
                  {posts.filter((p) =>
                    new Date(p.scheduledFor).toDateString() ===
                    (selectedDate ?? new Date()).toDateString()
                  ).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Campagnes actives</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter((c) => c.status === "Active").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Clients en cours</p>
                <p className="text-2xl font-bold">
                  {new Set(posts.map((p) => p.client)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="posts">Publications</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Calendrier éditorial */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Calendrier éditorial</CardTitle>
                  <CardDescription>
                    Planning des publications pour tous les clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Publications du jour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground">{post.client}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.scheduledFor).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stats rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Posts cette semaine</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement moyen</span>
                      <span className="font-medium text-success">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clients actifs</span>
                      <span className="font-medium">4</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Publications */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                          {getTypeIcon(post.type)}
                        </div>
                        
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            <Badge variant="outline" className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{post.client} • {post.platform}</p>
                          
                          <p className="text-sm border-l-2 border-muted pl-3">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(post.scheduledFor).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(post.scheduledFor).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>

                          {post.engagement && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span>{post.engagement.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4 text-blue-500" />
                                <span>{post.engagement.comments}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-4 w-4 text-green-500" />
                                <span>{post.engagement.shares}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Modifier</Button>
                        <Button variant="outline" size="sm">Preview</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campagnes */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription>{campaign.client}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Portée</p>
                        <p className="font-medium">{campaign.reach}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-medium">{campaign.engagement}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Publications</p>
                        <p className="font-medium">{campaign.posts}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Période: {campaign.period}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-info" />
                    <div>
                      <p className="text-2xl font-bold">156.2K</p>
                      <p className="text-sm text-muted-foreground">Impressions totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-2xl font-bold">8.4%</p>
                      <p className="text-sm text-muted-foreground">Taux d'engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">+24%</p>
                      <p className="text-sm text-muted-foreground">Croissance followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance par plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: "Instagram", posts: 45, engagement: "12.3%", reach: "67.2K" },
                    { platform: "Facebook", posts: 32, engagement: "8.7%", reach: "43.1K" },
                    { platform: "LinkedIn", posts: 18, engagement: "6.2%", reach: "28.9K" }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(stat.platform)}</span>
                        <div>
                          <p className="font-medium">{stat.platform}</p>
                          <p className="text-sm text-muted-foreground">{stat.posts} publications</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stat.engagement}</p>
                        <p className="text-sm text-muted-foreground">{stat.reach} portée</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Community