import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Supabase client (London project). Only the public URL and publishable key reach the browser;
 * Row Level Security decides what each parent can read and write.
 * Without the two variables the app runs in demo mode only.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase = url && key
  ? createClient<Database>(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
    })
  : null

export const AVATAR_BUCKET = 'avatars'
