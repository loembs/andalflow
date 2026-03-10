import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  PenTool, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Download,
  Star,
  AlertCircle,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Linkedin
} from "lucide-react"

const Writing = () => {
  const briefs = [
    {
      id: 1,
      title: "Articles blog Luxe Hotel",
      client: "Luxe Hotel",
      type: "Blog",
      status: "En cours",
      priority: "Haute",
      deadline: "2024-01-20",
      writer: "RW",
      wordCount: 1200,
      articles: [
        { title: "10 services de luxe uniques", status: "Brouillon", words: 800 },
        { title: "Art de vivre à l'hôtel", status: "En relecture", words: 1200 },
        { title: "Gastronomie et terroir", status: "Publié", words: 950 }
      ]
    },
    {
      id: 2,
      title: "Copy site FinTech",
      client: "FinTech Pro",
      type: "Site Web",
      status: "Révision",
      priority: "Haute",
      deadline: "2024-01-18",
      writer: "SM",
      wordCount: 2500,
      articles: [
        { title: "Page d'accueil", status: "En relecture", words: 400 },
        { title: "À propos", status: "Validé", words: 600 },
        { title: "Services", status: "Brouillon", words: 800 }
      ]
    },
    {
      id: 3,
      title: "Newsletters StyleShop",
      client: "StyleShop",
      type: "Email",
      status: "Planifié",
      priority: "Moyenne",
      deadline: "2024-01-25",
      writer: "RW",
      wordCount: 800,
      articles: [
        { title: "Newsletter janvier", status: "Validé", words: 300 },
        { title: "Promo collection été", status: "Brouillon", words: 250 }
      ]
    }
  ]

  const contents = [
    {
      id: 1,
      title: "10 services de luxe uniques pour une expérience inoubliable",
      client: "Luxe Hotel",
      type: "Article",
      platform: "Blog",
      status: "Publié",
      words: 950,
      readingTime: "4 min",
      author: "RW",
      publishDate: "2024-01-15",
      views: 2340,
      engagement: "8.5%"
    },
    {
      id: 2,
      title: "L'avenir des services bancaires mobiles",
      client: "FinTech Pro",
      type: "Page",
      platform: "Site Web",
      status: "En relecture",
      words: 1200,
      readingTime: "5 min",
      author: "SM",
      publishDate: null,
      views: 0,
      engagement: "0%"
    },
    {
      id: 3,
      title: "Post Instagram - Collection Été 2024",
      client: "StyleShop",
      type: "Post",
      platform: "Instagram",
      status: "Validé",
      words: 150,
      readingTime: "1 min",
      author: "RW",
      publishDate: "2024-01-16",
      views: 4580,
      engagement: "12.3%"
    },
    {
      id: 4,
      title: "Newsletter - Tendances mode printemps",
      client: "StyleShop",
      type: "Newsletter",
      platform: "Email",
      status: "Brouillon",
      words: 600,
      readingTime: "3 min",
      author: "RW",
      publishDate: null,
      views: 0,
      engagement: "0%"
    }
  ]

  const guidelines = [
    {
      client: "Luxe Hotel",
      tone: "Élégant, raffiné, exclusif",
      keywords: ["luxe", "excellence", "service", "prestige"],
      style: "Français soutenu, éviter le tutoiement"
    },
    {
      client: "FinTech Pro",
      tone: "Professionnel, accessible, innovant",
      keywords: ["innovation", "sécurité", "simplicité", "avenir"],
      style: "Clair et pédagogique, exemples concrets"
    },
    {
      client: "StyleShop",
      tone: "Moderne, décontracté, inspirant",
      keywords: ["style", "tendance", "mode", "lifestyle"],
      style: "Tutoiement, émojis autorisés sur réseaux"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours": return "bg-primary text-primary-foreground"
      case "Révision": return "bg-warning text-warning-foreground"
      case "Planifié": return "bg-info text-info-foreground"
      case "Publié": return "bg-success text-success-foreground"
      case "En relecture": return "bg-warning text-warning-foreground"
      case "Validé": return "bg-success text-success-foreground"
      case "Brouillon": return "bg-muted text-muted-foreground"
      default: return "bg-muted"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "destructive"
      case "Moyenne": return "secondary"
      case "Basse": return "outline"
      default: return "secondary"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Blog": return <BookOpen className="h-4 w-4" />
      case "Site Web": return <Globe className="h-4 w-4" />
      case "Email": return <Mail className="h-4 w-4" />
      case "Article": return <FileText className="h-4 w-4" />
      case "Page": return <Globe className="h-4 w-4" />
      case "Post": return <MessageSquare className="h-4 w-4" />
      case "Newsletter": return <Mail className="h-4 w-4" />
      default: return <PenTool className="h-4 w-4" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram": return <Instagram className="h-4 w-4" />
      case "Facebook": return <Facebook className="h-4 w-4" />
      case "LinkedIn": return <Linkedin className="h-4 w-4" />
      case "Blog": return <BookOpen className="h-4 w-4" />
      case "Site Web": return <Globe className="h-4 w-4" />
      case "Email": return <Mail className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Manager / Vidéaste</h1>
            <p className="text-muted-foreground">
              Gestion des contenus, scripts et validations pour tous les formats (articles, posts, vidéos)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contenu
            </Button>
          </div>
        </div>

        {/* Mon travail du jour (vue Content Manager / Vidéaste) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Briefs actifs</p>
                <p className="text-2xl font-bold">
                  {briefs.filter((b) => b.status !== "Planifié").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <PenTool className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Contenus à écrire</p>
                <p className="text-2xl font-bold">
                  {contents.filter((c) => c.status !== "Publié").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Échéances à venir</p>
                <p className="text-2xl font-bold">
                  {briefs.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="briefs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="briefs">Briefs</TabsTrigger>
            <TabsTrigger value="contents">Contenus</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Briefs */}
          <TabsContent value="briefs" className="space-y-6">
            <div className="grid gap-6">
              {briefs.map((brief) => (
                <Card key={brief.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(brief.type)}
                        <div>
                          <CardTitle className="text-lg">{brief.title}</CardTitle>
                          <CardDescription>{brief.client} • {brief.type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(brief.priority)}>
                          {brief.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(brief.status)}>
                          {brief.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Articles/Contenus */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Contenus</span>
                      <div className="space-y-2">
                        {brief.articles.map((article, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{article.title}</p>
                              <p className="text-xs text-muted-foreground">{article.words} mots</p>
                            </div>
                            <Badge variant="outline" className={`${getStatusColor(article.status)} text-xs`}>
                              {article.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Team */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{brief.wordCount} mots total</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Échéance: {new Date(brief.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{brief.writer}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{brief.writer}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contenus */}
          <TabsContent value="contents" className="space-y-6">
            <div className="grid gap-4">
              {contents.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(content.type)}
                            {getPlatformIcon(content.platform)}
                          </div>
                          
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold line-clamp-1">{content.title}</h3>
                              <Badge variant="outline" className={getStatusColor(content.status)}>
                                {content.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {content.client} • {content.platform}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{content.words} mots</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{content.readingTime} lecture</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-xs">{content.author}</AvatarFallback>
                                </Avatar>
                                <span>{content.author}</span>
                              </div>
                            </div>

                            {content.status === "Publié" && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-info" />
                                  <span>{content.views} vues</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-warning" />
                                  <span>{content.engagement} engagement</span>
                                </div>
                                {content.publishDate && (
                                  <span className="text-muted-foreground">
                                    Publié le {new Date(content.publishDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guidelines.map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{guide.client}</CardTitle>
                    <CardDescription>Guide éditorial et ton de voix</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Ton de voix</h4>
                      <p className="text-sm text-muted-foreground">{guide.tone}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Mots-clés</h4>
                      <div className="flex flex-wrap gap-1">
                        {guide.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Style</h4>
                      <p className="text-sm text-muted-foreground">{guide.style}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Éditeur rapide</CardTitle>
                <CardDescription>Rédigez et sauvegardez vos contenus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Commencez à rédiger votre contenu ici..."
                  className="min-h-[200px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>0 mots</span>
                    <span>0 min de lecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Sauvegarder</Button>
                    <Button size="sm">Publier</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-muted-foreground">Contenus créés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-info" />
                    <div>
                      <p className="text-2xl font-bold">24.5K</p>
                      <p className="text-sm text-muted-foreground">Vues totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">9.2%</p>
                      <p className="text-sm text-muted-foreground">Engagement moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance par type de contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Articles blog", count: 45, engagement: "12.3%", views: "15.2K" },
                    { type: "Posts réseaux", count: 78, engagement: "8.7%", views: "8.1K" },
                    { type: "Pages web", count: 23, engagement: "6.2%", views: "1.2K" },
                    { type: "Newsletters", count: 12, engagement: "15.8%", views: "3.4K" }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(stat.type)}
                        <div>
                          <p className="font-medium">{stat.type}</p>
                          <p className="text-sm text-muted-foreground">{stat.count} contenus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stat.engagement}</p>
                        <p className="text-sm text-muted-foreground">{stat.views} vues</p>
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

export default Writing