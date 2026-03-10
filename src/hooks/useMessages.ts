import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

export interface Conversation {
  id: string
  name: string | null
  type: 'direct' | 'channel'
  created_by: string | null
  created_at: string
  updated_at: string
  participants: ConversationParticipant[]
  lastMessage?: Message | null
}

export interface ConversationParticipant {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string
  created_at: string
  sender?: {
    full_name: string | null
    avatar_url: string | null
    role: string
  }
}

const ensureSb = () => {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

const ensureSession = async () => {
  if (!supabase) throw new Error('Supabase non configuré')

  // getUser() valide le JWT avec le serveur Supabase (vrai appel réseau)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!userError && user) return user.id

  // Token expiré → tenter un refresh
  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError || !refreshed.session) {
    throw new Error('Session expirée. Veuillez vous reconnecter.')
  }
  return refreshed.session.user.id
}

export const useMessages = (currentUserId?: string) => {
  const qc = useQueryClient()
  const { toast } = useToast()
  const enabled = !!supabase && !!currentUserId

  // ─── Liste des conversations ──────────────────────────────────────────────
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations', currentUserId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const sb = ensureSb()

      // Récupérer les conversations où l'utilisateur est participant
      const { data: participations, error: pErr } = await sb
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId!)
      if (pErr) throw new Error(pErr.message)

      const convIds = (participations ?? []).map((p: any) => p.conversation_id)
      if (convIds.length === 0) return []

      const { data: convs, error: cErr } = await sb
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('updated_at', { ascending: false })
      if (cErr) throw new Error(cErr.message)

      // Charger les participants + dernier message pour chaque conv
      const result: Conversation[] = await Promise.all(
        (convs ?? []).map(async (conv: any) => {
          const { data: parts } = await sb
            .from('conversation_participants')
            .select('user_id, profiles(full_name, avatar_url, role)')
            .eq('conversation_id', conv.id)

          const { data: lastMsgs } = await sb
            .from('messages')
            .select('id, content, created_at, sender_id, profiles(full_name, avatar_url, role)')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const participants: ConversationParticipant[] = (parts ?? []).map((p: any) => ({
            user_id: p.user_id,
            full_name: p.profiles?.full_name ?? null,
            avatar_url: p.profiles?.avatar_url ?? null,
            role: p.profiles?.role ?? '',
          }))

          const lastMsg = lastMsgs?.[0]
            ? {
                id: lastMsgs[0].id,
                conversation_id: conv.id,
                sender_id: lastMsgs[0].sender_id,
                content: lastMsgs[0].content,
                created_at: lastMsgs[0].created_at,
                sender: lastMsgs[0].profiles
                  ? {
                      full_name: (lastMsgs[0].profiles as any).full_name,
                      avatar_url: (lastMsgs[0].profiles as any).avatar_url,
                      role: (lastMsgs[0].profiles as any).role,
                    }
                  : undefined,
              }
            : null

          return { ...conv, participants, lastMessage: lastMsg }
        })
      )

      return result
    },
  })

  // ─── Messages d'une conversation ─────────────────────────────────────────
  const useGetMessages = (conversationId: string | null) =>
    useQuery<Message[]>({
      queryKey: ['messages', conversationId],
      enabled: !!conversationId && enabled,
      staleTime: 10_000,
      queryFn: async () => {
        const sb = ensureSb()
        const { data, error } = await sb
          .from('messages')
          .select('id, conversation_id, sender_id, content, created_at, profiles(full_name, avatar_url, role)')
          .eq('conversation_id', conversationId!)
          .order('created_at', { ascending: true })
          .limit(100)
        if (error) throw new Error(error.message)
        return (data ?? []).map((m: any) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          content: m.content,
          created_at: m.created_at,
          sender: m.profiles
            ? { full_name: m.profiles.full_name, avatar_url: m.profiles.avatar_url, role: m.profiles.role }
            : undefined,
        }))
      },
    })

  // ─── Realtime : écouter les nouveaux messages ─────────────────────────────
  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      if (!supabase) return () => {}
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
          () => {
            qc.invalidateQueries({ queryKey: ['messages', conversationId] })
            qc.invalidateQueries({ queryKey: ['conversations', currentUserId] })
          }
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    },
    [qc, currentUserId]
  )

  // ─── Envoyer un message ───────────────────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const userId = await ensureSession()
      const sb = ensureSb()
      const { error } = await sb.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
      })
      if (error) throw new Error(error.message)

      await sb.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
    },
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations', currentUserId] })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })

  // ─── Créer une conversation ───────────────────────────────────────────────
  const createConversationMutation = useMutation({
    mutationFn: async ({
      name,
      type,
      participantIds,
    }: {
      name: string | null
      type: 'direct' | 'channel'
      participantIds: string[]
    }) => {
      const myId = await ensureSession()
      const sb = ensureSb()

      // Vérifier si une conv directe existe déjà entre ces deux utilisateurs
      if (type === 'direct' && participantIds.length === 1) {
        const otherId = participantIds[0]
        const { data: myConvs } = await sb
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', myId)
        const myConvIds = (myConvs ?? []).map((c: any) => c.conversation_id)
        if (myConvIds.length > 0) {
          const { data: shared } = await sb
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherId)
            .in('conversation_id', myConvIds)
          if (shared && shared.length > 0) return shared[0].conversation_id
        }
      }

      const { data: conv, error: cErr } = await sb
        .from('conversations')
        .insert({ name, type, created_by: myId })
        .select('id')
        .single()
      if (cErr) throw new Error(cErr.message)

      const allParticipants = [...new Set([myId, ...participantIds])]
      const { error: pErr } = await sb.from('conversation_participants').insert(
        allParticipants.map((uid) => ({ conversation_id: conv.id, user_id: uid }))
      )
      if (pErr) throw new Error(pErr.message)

      return conv.id as string
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', currentUserId] })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })

  return {
    conversations,
    isLoadingConversations,
    useGetMessages,
    subscribeToConversation,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
  }
}
