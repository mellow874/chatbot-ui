/**
 * useChat.ts
 *
 * Core chat hook. Wires together:
 *   api.ts           → backend calls (streaming)
 *   conversations.ts → localStorage persistence
 *
 * Place at: hooks/useChat.ts
 */

import { useState, useCallback, useEffect } from "react"
import { v4 as uuid } from "uuid"
import { sendChatMessage, Source } from "@/lib/api"
import {
  Message,
  Conversation,
  getConversations,
  getActiveConversationId,
  saveConversations,
  createConversation,
  getConversationTitle,
  clearAllConversations,
} from "@/lib/conversations"

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId,      setActiveId]      = useState<string | null>(null)
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [backendError,  setBackendError]  = useState<string | null>(null)

  // ── Load from localStorage on mount ────────────────────────────────────────
  useEffect(() => {
    const stored   = getConversations()
    const savedId  = getActiveConversationId()

    if (stored.length === 0) {
      const first = createConversation(uuid(), "New conversation")
      setConversations([first])
      setActiveId(first.id)
      saveConversations([first], first.id)
    } else {
      setConversations(stored)
      setActiveId(savedId ?? stored[0].id)
    }
  }, [])

  // ── Derived state ───────────────────────────────────────────────────────────
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null
  const messages           = activeConversation?.messages ?? []

  // ── Persist to localStorage ─────────────────────────────────────────────────
  const persist = useCallback(
    (convos: Conversation[], currentActiveId: string | null) => {
      setConversations(convos)
      saveConversations(convos, currentActiveId)
    },
    []
  )

  // ── Send a message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || isStreaming || !activeId) return

      setBackendError(null)

      const userMessage: Message = {
        role:    "user",
        content: input.trim(),
      }

      // Snapshot of history BEFORE the new message — sent to backend as context
      const historySnapshot = [...messages]

      // Add user message to the conversation
      let updatedConvos = conversations.map((c) => {
        if (c.id !== activeId) return c
        const isFirst = c.messages.length === 0
        return {
          ...c,
          title:    isFirst ? getConversationTitle(input.trim()) : c.title,
          messages: [...c.messages, userMessage],
        }
      })
      persist(updatedConvos, activeId)

      // Add empty assistant placeholder for streaming
      const assistantPlaceholder: Message = {
        role:    "assistant",
        content: "",
      }

      updatedConvos = updatedConvos.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, assistantPlaceholder] }
          : c
      )
      persist(updatedConvos, activeId)
      setIsStreaming(true)

      let accumulated = ""
      const capturedActiveId = activeId

      await sendChatMessage(
        input.trim(),
        historySnapshot,
        capturedActiveId,

        // onToken: append each text token to the last assistant message
        (token: string) => {
          accumulated += token

          setConversations((prev) => {
            const next = prev.map((c) => {
              if (c.id !== capturedActiveId) return c
              const msgs = [...c.messages]
              const last = msgs.length - 1
              if (msgs[last]?.role === "assistant") {
                msgs[last] = { ...msgs[last], content: accumulated }
              }
              return { ...c, messages: msgs }
            })
            saveConversations(next, capturedActiveId)
            return next
          })
        },

        // onDone: sources arrive — attach them and end stream
        (sources: Source[]) => {
          setConversations((prev) => {
            const next = prev.map((c) => {
              if (c.id !== capturedActiveId) return c
              const msgs = [...c.messages]
              const last = msgs.length - 1
              if (msgs[last]?.role === "assistant") {
                msgs[last] = { ...msgs[last], content: accumulated, sources }
              }
              return { ...c, messages: msgs }
            })
            saveConversations(next, capturedActiveId)
            return next
          })
          setIsStreaming(false)
        },

        // onError: show error in the placeholder message
        (error: string) => {
          setBackendError(error)
          setConversations((prev) => {
            const next = prev.map((c) => {
              if (c.id !== capturedActiveId) return c
              const msgs = [...c.messages]
              const last = msgs.length - 1
              if (msgs[last]?.role === "assistant") {
                msgs[last] = {
                  ...msgs[last],
                  content: "Something went wrong. Please try again.",
                }
              }
              return { ...c, messages: msgs }
            })
            saveConversations(next, capturedActiveId)
            return next
          })
          setIsStreaming(false)
        }
      )
    },
    [activeId, conversations, isStreaming, messages, persist]
  )

  // ── New conversation ────────────────────────────────────────────────────────
  const newConversation = useCallback(() => {
    const fresh   = createConversation(uuid(), "New conversation")
    const updated = [fresh, ...conversations]
    setActiveId(fresh.id)
    persist(updated, fresh.id)
  }, [conversations, persist])

  // ── Switch conversation ─────────────────────────────────────────────────────
  const switchConversation = useCallback(
    (id: string) => {
      if (isStreaming) return
      setActiveId(id)
      saveConversations(conversations, id)
    },
    [conversations, isStreaming]
  )

  // ── Delete conversation ─────────────────────────────────────────────────────
  const deleteConversation = useCallback(
    (id: string) => {
      const filtered = conversations.filter((c) => c.id !== id)
      if (filtered.length === 0) {
        const fresh = createConversation(uuid(), "New conversation")
        setActiveId(fresh.id)
        persist([fresh], fresh.id)
        return
      }
      const newActive = id === activeId ? filtered[0].id : activeId
      setActiveId(newActive)
      persist(filtered, newActive)
    },
    [activeId, conversations, persist]
  )

  // ── Clear all conversations ─────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    const fresh = createConversation(uuid(), "New conversation")
    clearAllConversations()
    setConversations([fresh])
    setActiveId(fresh.id)
    saveConversations([fresh], fresh.id)
  }, [])

  return {
    conversations,
    activeConversation,
    activeId,
    messages,
    isStreaming,
    backendError,
    sendMessage,
    newConversation,
    switchConversation,
    deleteConversation,
    clearAll,
  }
}
