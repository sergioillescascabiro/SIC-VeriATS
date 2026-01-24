/**
 * useAuth Hook
 *
 * React hook for managing authentication with Supabase.
 * Automatically syncs authentication state.
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'
import { useNavigate } from '@tanstack/react-router'

interface LoginCredentials {
    email: string
    password: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isLoggingIn: boolean
    loginError: Error | null
    login: (credentials: LoginCredentials) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [loginError, setLoginError] = useState<Error | null>(null)

    // Initialize session and listen for changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            if (session) {
                const currentUser = await authService.getCurrentUser()
                setUser(currentUser)
            }
            setLoading(false)
        })

        // Listen for authentication state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            if (session) {
                const currentUser = await authService.getCurrentUser()
                setUser(currentUser)
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (credentials: LoginCredentials) => {
        console.log('🎯 [useAuth] Login called with email:', credentials.email)
        setIsLoggingIn(true)
        setLoginError(null)
        try {
            console.log('📞 [useAuth] Calling authService.login...')
            const response = await authService.login(credentials)
            console.log('✅ [useAuth] Login successful, role:', response.user.role)
            setUser(response.user)
            setSession({
                access_token: response.access_token,
                refresh_token: response.refresh_token,
            } as Session)

            // Redirect based on role
            const role = response.user.role
            console.log('🚀 [useAuth] Redirecting based on role:', role)
            if (role === 'super_admin' || role === 'screener') {
                window.location.href = '/admin'
            } else if (role === 'company_user') {
                window.location.href = '/company'
            } else if (role === 'candidate') {
                window.location.href = '/candidate'
            }
        } catch (error) {
            console.error('❌ [useAuth] Login error:', error)
            setLoginError(error as Error)
            console.error('Login error:', error)
        } finally {
            console.log('🏁 [useAuth] Login process finished')
            setIsLoggingIn(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        await login({ email, password })
    }

    const signOut = async () => {
        await authService.logout()
        setUser(null)
        setSession(null)
        window.location.href = '/login'
    }

    const refreshUser = async () => {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
    }

    const value = {
        user,
        session,
        loading,
        isLoggingIn,
        loginError,
        login,
        signIn,
        signOut,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
