/**
 * Conversation management utilities for localStorage
 */

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    title: string;
    url?: string | null;
    source_type: "book" | "youtube" | "website" | "unknown";
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface ConversationStore {
  conversations: Conversation[];
  activeConversationId: string | null;
}

const STORE_KEY = "qla_conversations";

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return [];
    const data: ConversationStore = JSON.parse(stored);
    return data.conversations || [];
  } catch (e) {
    console.error("Failed to parse conversations:", e);
    return [];
  }
}

export function getActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return null;
    const data: ConversationStore = JSON.parse(stored);
    return data.activeConversationId || null;
  } catch (e) {
    return null;
  }
}

export function saveConversations(
  conversations: Conversation[],
  activeId: string | null
): void {
  if (typeof window === "undefined") return;

  // Trim to last 50 conversations
  const trimmed = conversations.slice(0, 50);

  const store: ConversationStore = {
    conversations: trimmed,
    activeConversationId: activeId,
  };

  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function createConversation(id: string, title: string): Conversation {
  return {
    id,
    title,
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

export function getConversationTitle(firstMessage: string): string {
  // Take first 40 characters and add ellipsis if longer
  return firstMessage.length > 40 ? firstMessage.slice(0, 40) + "..." : firstMessage;
}

export function clearAllConversations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}
