export interface User {
    id: string // UUID in Supabase
    email: string
    role: 'super_admin' | 'screener' | 'company_user' | 'candidate'
    name?: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    access_token: string
    refresh_token: string
    user: User
    token_type: string
}
