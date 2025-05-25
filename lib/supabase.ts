import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not set. Using fallback for development.")
}

if (!supabaseAnonKey) {
  console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Using fallback for development.")
}

// Fallback per sviluppo locale
const fallbackUrl = "https://placeholder.supabase.co"
const fallbackKey = "placeholder-anon-key"

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackKey)

// Flag per sapere se stiamo usando valori reali o fallback
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
