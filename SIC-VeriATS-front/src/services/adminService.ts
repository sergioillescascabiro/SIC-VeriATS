/**
 * Admin API service for company management and statistics
 */
import api from './api'
import type { AdminStats, AdminCompany, AdminJob } from '@/types/admin'

export interface CompanyCreateData {
    company_name: string
    company_description?: string
    company_logo_url?: string
    company_industry?: string
    company_website?: string
    is_sponsor?: boolean
    email: string
    password: string
}

export interface CompanyUpdateData {
    company_name?: string
    company_description?: string
    company_logo_url?: string
    company_industry?: string
    company_website?: string
    is_sponsor?: boolean
    email?: string
}

export const adminService = {
    // Get dashboard statistics
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get('/api/admin/stats')
        return response.data
    },

    // Get all companies with optional status filter
    getCompanies: async (status?: 'draft' | 'published'): Promise<AdminCompany[]> => {
        const params = status ? { status } : {}
        const response = await api.get('/api/admin/companies', { params })
        return response.data
    },

    // Get single company details
    getCompany: async (id: number): Promise<AdminCompany> => {
        const response = await api.get(`/api/admin/companies/${id}`)
        return response.data
    },

    // Create new company
    createCompany: async (data: CompanyCreateData): Promise<AdminCompany> => {
        const response = await api.post('/api/admin/companies', data)
        return response.data
    },

    // Update company
    updateCompany: async (id: number, data: CompanyUpdateData): Promise<AdminCompany> => {
        const response = await api.put(`/api/admin/companies/${id}`, data)
        return response.data
    },

    // Toggle company status (publish/unpublish)
    toggleCompanyStatus: async (id: number): Promise<AdminCompany> => {
        const response = await api.patch(`/api/admin/companies/${id}/status`)
        return response.data
    },

    // Delete company
    deleteCompany: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/companies/${id}`)
    },

    // Get all jobs
    getJobs: async (): Promise<AdminJob[]> => {
        const response = await api.get('/api/admin/jobs')
        return response.data
    }
}
