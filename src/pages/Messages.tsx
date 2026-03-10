import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Hash,
  Users,
  X,
} from "lucide-react"
import { useMessages } from "@/hooks/useMessages"
import { useProfiles } from "@/hooks/useProfiles"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { fr } from "date-fns/locale"

const getInitials = (name: string | null) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (isToday(d)) return format(d, "HH:mm")
  if (isYesterday(d)) return "Hier"
  return format(d, "dd/MM", { locale: fr })
}

const Messages = () => {
  const { user } = useAuth()
  const { profiles } = useProfiles()
  const {
    conversations,
    isLoadingConversations,
    useGetMessages,
    subscribeToConversation,
    sendMessage,
    isSending,
    createConversation,
    isCreating,
  } = useMessages(user?.id)

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [search, setSearch] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newConvType, setNewConvType] = useState<"direct" | "channel">("direct")
  const [newConvName, setNewConvName] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sélectionner la première conversation au chargement
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id)
    }
  }, [conversations, selectedConvId])

  // Abonnement temps réel à la conversation active
  useEffect(() => {
    if (!selectedConvId) return
    return subscribeToConversation(selectedConvId)
  }, [selectedConvId, subscribeToConversation])

  const { data: messages = [], isLoading: isLoadingMessages } = useGetMessages(selectedConvId)

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const selectedConv = conversations.find((c) => c.id === selectedConvId)

  const filteredConvs = conversations.filter((c) => {
    const label =
      c.name ??
      (c.participants.filter((p) => p.user_id !== user?.id).map((p) => p.full_name).join(", ") || "")
    return label.toLowerCase().includes(search.toLowerCase())
  })

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return
    await sendMessage({ conversationId: selectedConvId, content: newMessage })
    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCreateConversation = async () => {
    if (selectedParticipants.length === 0) return
    const convId = await createConversation({
      name: newConvType === "channel" ? newConvName || null : null,
      type: newConvType,
      participantIds: selectedParticipants,
    })
    setShowNewDialog(false)
    setSelectedParticipants([])
    setNewConvName("")
    if (typeof convId === "string") setSelectedConvId(convId)
  }

  const convLabel = (conv: typeof conversations[0]) => {
    if (conv.name) return conv.name
    const names = conv.participants
      .filter((p) => p.user_id !== user?.id)
      .map((p) => p.full_name ?? "Utilisateur")
      .join(", ")
    return names || "Conversation"
  }

  const otherParticipants = profiles.filter((p) => p.id !== user?.id && !selectedParticipants.includes(p.id))

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* ─── Sidebar gauche ─── */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button size="sm" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nouveau
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {isLoadingConversations ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : filteredConvs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune conversation</p>
                </CardContent>
              </Card>
            ) : (
              filteredConvs.map((conv) => {
                const label = convLabel(conv)
                const others = conv.participants.filter((p) => p.user_id !== user?.id)
                const isSelected = conv.id === selectedConvId

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {conv.type === "channel" ? (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Hash className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <Avatar className="h-8 w-8">
                            {others[0]?.avatar_url && (
                              <img src={others[0].avatar_url} alt="" />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(others[0]?.full_name ?? null)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-medium truncate">{label}</p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatTime(conv.lastMessage.created_at)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage ? (
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage.sender?.full_name?.split(" ")[0] ?? ""}:{" "}
                            {conv.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Aucun message</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ─── Zone de chat ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            {!selectedConv ? (
              <CardContent className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
                <p className="text-muted-foreground max-w-xs">
                  Choisissez une conversation ou créez-en une nouvelle.
                </p>
              </CardContent>
            ) : (
              <>
                {/* Header */}
                <CardHeader className="border-b py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedConv.type === "channel" ? (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hash className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(
                              selectedConv.participants.find((p) => p.user_id !== user?.id)
                                ?.full_name ?? null
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <CardTitle className="text-base">{convLabel(selectedConv)}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {selectedConv.participants.length} participant
                          {selectedConv.participants.length > 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Avatars participants */}
                    <div className="flex -space-x-2">
                      {selectedConv.participants.slice(0, 4).map((p) => (
                        <Avatar key={p.user_id} className="h-7 w-7 border-2 border-background" title={p.full_name ?? ""}>
                          {p.avatar_url && <img src={p.avatar_url} alt="" />}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(p.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Aucun message. Soyez le premier à écrire !
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}
                        >
                          {!isOwn && (
                            <Avatar className="h-7 w-7 shrink-0 mb-1">
                              {msg.sender?.avatar_url && (
                                <img src={msg.sender.avatar_url} alt="" />
                              )}
                              <AvatarFallback className="text-[10px]">
                                {getInitials(msg.sender?.full_name ?? null)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn("max-w-[70%] space-y-0.5", isOwn && "items-end flex flex-col")}>
                            {!isOwn && (
                              <p className="text-xs font-medium text-muted-foreground px-1">
                                {msg.sender?.full_name ?? "Utilisateur"}
                              </p>
                            )}
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 text-sm",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              )}
                            >
                              {msg.content}
                            </div>
                            <p className="text-[10px] text-muted-foreground px-1">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </CardContent>

                {/* Zone de saisie */}
                <div className="border-t p-3">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Écrivez un message… (Entrée pour envoyer)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="min-h-[44px] max-h-32 resize-none flex-1"
                      rows={1}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || isSending}
                      size="icon"
                      className="shrink-0 h-10 w-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrée pour envoyer · Shift+Entrée pour saut de ligne
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ─── Dialog : Nouvelle conversation ─── */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Créez un message direct ou un canal de groupe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={newConvType} onValueChange={(v) => setNewConvType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message direct
                    </div>
                  </SelectItem>
                  <SelectItem value="channel">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Canal de groupe
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newConvType === "channel" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du canal</label>
                <Input
                  placeholder="Ex : Équipe Design"
                  value={newConvName}
                  onChange={(e) => setNewConvName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Participants
                {newConvType === "direct" ? " (1 seul)" : ""}
              </label>

              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedParticipants.map((pid) => {
                    const p = profiles.find((x) => x.id === pid)
                    return (
                      <Badge key={pid} variant="secondary" className="flex items-center gap-1 pr-1">
                        {p?.full_name ?? "Utilisateur"}
                        <button onClick={() => setSelectedParticipants((prev) => prev.filter((id) => id !== pid))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {(newConvType === "channel" || selectedParticipants.length === 0) && (
                <Select
                  value=""
                  onValueChange={(pid) =>
                    setSelectedParticipants((prev) =>
                      newConvType === "direct" ? [pid] : [...prev, pid]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un membre…" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherParticipants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {p.full_name ?? "Utilisateur"}
                          <span className="text-muted-foreground text-xs">· {p.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={selectedParticipants.length === 0 || isCreating}
              >
                {isCreating ? "Création…" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

export default Messages
