import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { supabase } from '@/lib/supabase'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

// Request interceptor - Add JWT token to headers
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token via Supabase
                const { data, error } = await supabase.auth.refreshSession()

                if (error || !data.session) {
                    throw error || new Error('No session after refresh')
                }

                const access_token = data.session.access_token
                localStorage.setItem('access_token', access_token)
                if (data.session.refresh_token) {
                    localStorage.setItem('refresh_token', data.session.refresh_token)
                }

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                }
                return apiClient(originalRequest)
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                await supabase.auth.signOut()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
