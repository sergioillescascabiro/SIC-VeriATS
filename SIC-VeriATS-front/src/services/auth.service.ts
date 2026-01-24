/**
 * Authentication Service
 *
 * Handles user authentication using Supabase Auth directly.
 * Syncs with the `users` table to retrieve additional profile information.
 */

import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { AuthResponse, LoginCredentials, User } from '@/types/auth'

export const authService = {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        console.log('📧 [AuthService] Login attempt with:', credentials.email)

        // 1. Authenticate with Supabase
        console.log('🔑 [AuthService] Calling Supabase signInWithPassword...')
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })

        if (authError) {
            console.error('❌ [AuthService] Auth error:', authError)
        }
        handleSupabaseError(authError, 'login')

        if (!authData.session) {
            console.error('❌ [AuthService] No session returned')
            throw new Error('No session returned after login')
        }

        console.log('✅ [AuthService] Auth successful, user ID:', authData.user.id)

        // 2. Fetch full user profile from the `users` table
        console.log('📊 [AuthService] Fetching user profile from table...')
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authData.user.id)
            .single()

        if (profileError) {
            console.error('❌ [AuthService] Profile fetch error:', profileError)
        }
        handleSupabaseError(profileError, 'getUserProfile')

        // 3. If no profile exists in users, create one
        if (!userProfile) {
            console.log('⚠️ [AuthService] No profile found, creating new one...')
            const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                    auth_id: authData.user.id,
                    email: authData.user.email!,
                    role: 'candidate', // Default role
                })
                .select()
                .single()

            handleSupabaseError(createError, 'createUserProfile')

            console.log('✅ [AuthService] New profile created:', newProfile)
            return {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                token_type: 'bearer',
                user: {
                    id: newProfile.id,
                    email: newProfile.email,
                    role: newProfile.role,
                },
            }
        }

        // 4. Return response with existing profile
        console.log('✅ [AuthService] Profile found:', userProfile.role)
        return {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            token_type: 'bearer',
            user: {
                id: userProfile.id,
                email: userProfile.email,
                role: userProfile.role,
            },
        }
    },

    /**
     * Logout user and clear session
     */
    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        handleSupabaseError(error, 'logout')
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User | null> {
        // 1. Get user from Supabase Auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
            return null
        }

        // 2. Fetch full profile from users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single()

        if (profileError || !userProfile) {
            console.warn('User authenticated but no profile found in users table')
            return null
        }

        return {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
        }
    },

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<string> {
        const { data, error } = await supabase.auth.refreshSession()

        if (error || !data.session) {
            throw new Error('Failed to refresh token')
        }

        return data.session.access_token
    },

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession()
        return !!session
    },

    /**
     * Get current session
     */
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    /**
     * Register new user (Supabase Auth + users table)
     *
     * NOTE: In production, consider using Edge Functions
     * to validate the role and create the initial profile correctly.
     */
    async register(email: string, password: string, role: 'candidate' | 'company_user' = 'candidate') {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        handleSupabaseError(authError, 'register')

        if (!authData.user) {
            throw new Error('Failed to create user')
        }

        // 2. Create profile in users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .insert({
                auth_id: authData.user.id,
                email: authData.user.email!,
                role,
            })
            .select()
            .single()

        handleSupabaseError(profileError, 'createUserProfile')

        return {
            user: authData.user,
            profile: userProfile,
        }
    },
}
