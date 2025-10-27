import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseKey) // For localstorage

export const supabase = createClient(supabaseUrl, supabaseKey, {
    // For session storage from backend
    auth: {
        persistSession: false, // Do not store tokens in localStorage
        autoRefreshToken: false, // Let backend handle token refresh
    },
})
