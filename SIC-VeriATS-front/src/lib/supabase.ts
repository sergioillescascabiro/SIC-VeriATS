/**
 * Supabase Client Configuration
 *
 * This file configures the Supabase client to connect with the database.
 * Works both locally (http://localhost:54321) and in production (Supabase Cloud).
 */

import { createClient } from '@supabase/supabase-js'

// Validate that environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
    )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Keep session in localStorage
        autoRefreshToken: true, // Automatically refresh token
        detectSessionInUrl: true, // Detect session in URL (for magic links, etc.)
    },
    db: {
        schema: 'public', // Default schema
    },
    global: {
        headers: {
            'x-client-info': 'sic-veriats-front',
        },
    },
})

// Export for TypeScript (DB types are auto-generated with Supabase CLI)
export type Database = any // TODO: Generate types with: supabase gen types typescript --project-id <project-id>

/**
 * Helper to check for errors in Supabase responses
 */
export function handleSupabaseError(error: any, context: string) {
    if (error) {
        console.error(`[Supabase Error - ${context}]:`, error)
        throw new Error(error.message || 'An error occurred while communicating with the database')
    }
}

/**
 * Helper to extract the user_id of the current user
 */
export async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
}

/**
 * Helper to get the full profile of the current user.
 * Includes data from the users table.
 */
export async function getCurrentUserProfile() {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single()

    handleSupabaseError(error, 'getCurrentUserProfile')
    return data
}

/**
 * Helper to get the role of the current user
 */
export async function getCurrentUserRole(): Promise<string | null> {
    const profile = await getCurrentUserProfile()
    return profile?.role || null
}
