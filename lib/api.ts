/**
 * api.ts — QLA Chatbot frontend API client
 *
 * Connects to the FastAPI backend deployed on Railway.
 *
 * BACKEND CONTRACT (from main.py):
 *   Auth:    x-password header  (NOT Authorization: Bearer)
 *   POST /chat
 *     body:  { question: string, history: [{role, content}] }
 *     SSE:   data: {"type": "text",    "content": "<token>"}
 *            data: {"type": "sources", "content": [{title, source_type, url}]}
 *            data: [DONE]
 *   GET  /profile  → { id, profile_text, ... }
 *   PUT  /profile  body: { profile_text: string } → { status, message }
 *   GET  /health   → { status: "ok", service: "..." }
 */

import { Message } from "./conversations"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")
const PASSWORD    = process.env.NEXT_PUBLIC_APP_PASSWORD

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Source {
  title:       string
  url?:        string | null
  source_type: "book" | "youtube" | "website" | "unknown"
}

// ─── Auth header ──────────────────────────────────────────────────────────────
// Backend checks for x-password header, NOT Authorization: Bearer

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-password":   PASSWORD ?? "",
  }
}

// ─── Chat (streaming) ─────────────────────────────────────────────────────────

/**
 * POST /chat
 *
 * Sends the user's question + last 10 messages of history.
 * Reads the SSE stream and calls:
 *   onToken(text)   — for every {"type":"text"} chunk as it streams
 *   onDone(sources) — when {"type":"sources"} arrives (stream is finished)
 *   onError(msg)    — on any network or backend error
 */
export async function sendChatMessage(
  message:    string,
  history:    Message[],
  _sessionId: string,
  onToken:    (token: string)    => void,
  onDone:     (sources: Source[]) => void,
  onError:    (error: string)    => void
): Promise<void> {
  if (!BACKEND_URL) {
    onError("NEXT_PUBLIC_BACKEND_URL is not set. Add it to .env.local")
    return
  }

  // Backend uses "question" and "history" — not "message" / "conversation_history"
  const trimmedHistory = history.slice(-10).map((m) => ({
    role:    m.role,
    content: m.content,
  }))

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method:  "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        question: message,
        history:  trimmedHistory,
      }),
    })

    if (response.status === 401) {
      onError("Incorrect password. Check NEXT_PUBLIC_APP_PASSWORD in .env.local")
      return
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      onError(`Backend error ${response.status}: ${body}`)
      return
    }

    if (!response.body) {
      onError("No response stream received from the backend.")
      return
    }

    // ── Read SSE stream ──────────────────────────────────────────────────────
    const reader  = response.body.getReader()
    const decoder = new TextDecoder()
    let   buffer  = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE events are separated by \n\n
      const events = buffer.split("\n\n")
      buffer = events.pop() ?? ""   // keep the incomplete trailing event

      for (const event of events) {
        for (const line of event.split("\n")) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith(":")) continue
          if (!trimmed.startsWith("data: "))       continue

          const payload = trimmed.slice(6).trim()
          if (payload === "[DONE]") continue

          try {
            const data = JSON.parse(payload)

            // Streaming text token
            if (data.type === "text" && typeof data.content === "string") {
              onToken(data.content)
            }

            // Sources — signals end of stream
            if (data.type === "sources" && Array.isArray(data.content)) {
              onDone(data.content as Source[])
            }

            // Error sent inside the stream
            if (data.type === "error") {
              onError(data.content ?? "Unknown error from backend")
            }
          } catch {
            // Malformed JSON in a chunk — skip silently
          }
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    onError(`Could not reach the backend. Is Railway running? (${msg})`)
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /profile
 * Backend returns the full Supabase row: { id, profile_text, ... }
 * We extract and return just the profile_text string.
 */
export async function getProfile(): Promise<string> {
  if (!BACKEND_URL) return ""

  try {
    const response = await fetch(`${BACKEND_URL}/profile`, {
      method:  "GET",
      headers: authHeaders(),
    })

    if (!response.ok) {
      console.error("getProfile failed:", response.status)
      return ""
    }

    const data = await response.json()
    return data.profile_text ?? ""
  } catch (err) {
    console.error("getProfile error:", err)
    return ""
  }
}

/**
 * PUT /profile
 * body: { profile_text }
 * Returns true on success, false on failure.
 */
export async function updateProfile(profileText: string): Promise<boolean> {
  if (!BACKEND_URL) return false

  try {
    const response = await fetch(`${BACKEND_URL}/profile`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify({ profile_text: profileText }),
    })
    return response.ok
  } catch (err) {
    console.error("updateProfile error:", err)
    return false
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────

/**
 * GET /health — no auth required
 * Call on app mount to detect backend issues early.
 */
export async function checkBackendHealth(): Promise<boolean> {
  if (!BACKEND_URL) return false

  try {
    const response = await fetch(`${BACKEND_URL}/health`, { method: "GET" })
    return response.ok
  } catch {
    return false
  }
}
