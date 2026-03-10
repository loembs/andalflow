import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Palette, 
  Image, 
  FileImage, 
  Layers, 
  Eye, 
  Download, 
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Filter,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Figma,
  Monitor,
  Smartphone,
  Printer
} from "lucide-react"

const Design = () => {
  const projects: Array<{
    id: number;
    name: string;
    client: string;
    type: string;
    status: string;
    progress: number;
    designer: string;
    files: number;
    versions: number;
    lastUpdate: string;
    deliverables: string[];
  }> = []

  const assets: Array<{
    id: number;
    name: string;
    type: string;
    format: string;
    size: string;
    tags: string[];
    likes: number;
    downloads: number;
    comments: number;
    preview: string;
  }> = []

  const feedback: Array<{
    id: number;
    project: string;
    author: string;
    message: string;
    status: string;
    date: string;
    priority: string;
  }> = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours": return "bg-primary text-primary-foreground"
      case "Révision": return "bg-warning text-warning-foreground"
      case "Validé": return "bg-success text-success-foreground"
      case "Brief": return "bg-muted text-muted-foreground"
      case "En attente": return "bg-warning text-warning-foreground"
      case "Répondu": return "bg-info text-info-foreground"
      default: return "bg-muted"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Branding": return <Palette className="h-4 w-4" />
      case "Mobile App": return <Smartphone className="h-4 w-4" />
      case "Web Design": return <Monitor className="h-4 w-4" />
      case "Packaging": return <Printer className="h-4 w-4" />
      case "Logo": return <Star className="h-4 w-4" />
      case "Palette": return <Palette className="h-4 w-4" />
      case "Mockup": return <Layers className="h-4 w-4" />
      case "Icons": return <FileImage className="h-4 w-4" />
      default: return <Image className="h-4 w-4" />
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design</h1>
            <p className="text-muted-foreground">
              Galerie créative, gestion des assets et feedback projets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau design
            </Button>
          </div>
        </div>

        {/* Mon travail du jour (vue designer) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Projets en cours</p>
                <p className="text-2xl font-bold">
                  {projects.filter((p) => p.status === "En cours" || p.status === "Révision").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileImage className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Assets à livrer</p>
                <p className="text-2xl font-bold">
                  {assets.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Feedback en attente</p>
                <p className="text-2xl font-bold">
                  {feedback.filter((f) => f.status !== "Validé").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
          </TabsList>

          {/* Projets */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucun projet design pour le moment.</p>
                    <p className="text-sm text-muted-foreground mt-1">Les projets auxquels vous êtes assigné apparaîtront ici.</p>
                  </CardContent>
                </Card>
              ) : projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(project.type)}
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.client} • {project.type}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progression</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Livrables</span>
                      <div className="flex flex-wrap gap-1">
                        {project.deliverables.map((deliverable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Designer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileImage className="h-4 w-4 text-muted-foreground" />
                          <span>{project.files} fichiers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span>v{project.versions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(project.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{project.designer}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{project.designer}</span>
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assets */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucun asset pour le moment.</p>
                  </CardContent>
                </Card>
              ) : assets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="aspect-square bg-gradient-soft rounded-lg flex items-center justify-center text-4xl">
                        {asset.preview}
                      </div>
                      
                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <h3 className="font-semibold text-sm line-clamp-1">{asset.name}</h3>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{asset.format}</span>
                          <span>{asset.size}</span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span>{asset.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4 text-blue-500" />
                              <span>{asset.downloads}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4 text-green-500" />
                              <span>{asset.comments}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid gap-4">
              {feedback.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucun feedback pour le moment.</p>
                  </CardContent>
                </Card>
              ) : feedback.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-4 w-4" />
                          <div>
                            <h3 className="font-semibold">{item.project}</h3>
                            <p className="text-sm text-muted-foreground">par {item.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm border-l-2 border-muted pl-3">
                        {item.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Répondre</Button>
                          <Button variant="outline" size="sm">Marquer comme lu</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ressources */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Outils Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Figma className="h-4 w-4 mr-2" />
                    Figma Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Image className="h-4 w-4 mr-2" />
                    Adobe Creative Cloud
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileImage className="h-4 w-4 mr-2" />
                    Bibliothèque d'assets
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileImage className="h-4 w-4 mr-2" />
                    Guide de style
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    Chartes graphiques
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Layers className="h-4 w-4 mr-2" />
                    Templates & Composants
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Projets design</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-info" />
                    <div>
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-muted-foreground">Assets créés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Feedback en attente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Taux validation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Design