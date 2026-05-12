import { Tables } from "@/supabase/types"

export interface ChatMessage {
  message: Tables<"messages"> & { sources?: { title: string; url?: string; source_type?: string }[] }
  fileItems: string[]
}
