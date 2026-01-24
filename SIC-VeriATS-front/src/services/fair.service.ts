import api from './api'
import { Company, JobVacancy, Application } from '@/types/fair'

export const fairService = {
    // Companies
    getCompanies: async (): Promise<Company[]> => {
        const response = await api.get('/companies')
        return response.data
    },

    getCompany: async (id: string): Promise<Company> => {
        const response = await api.get(`/companies/${id}`)
        return response.data
    },

    getCompanyVacancies: async (companyId: string): Promise<JobVacancy[]> => {
        const response = await api.get(`/companies/${companyId}/vacancies`)
        return response.data
    },

    // Vacancies
    getVacancy: async (id: string): Promise<JobVacancy> => {
        const response = await api.get(`/vacancies/${id}`)
        return response.data
    },

    applyToVacancy: async (vacancyId: string, data: { cv_id?: string, justifications: Record<number, string> }): Promise<Application> => {
        const response = await api.post(`/vacancies/${vacancyId}/apply`, data)
        return response.data
    },

    // Applications
    getMyApplications: async (): Promise<Application[]> => {
        const response = await api.get('/applications/me')
        return response.data
    },

    getApplication: async (id: string): Promise<Application> => {
        const response = await api.get(`/applications/${id}`)
        return response.data
    }
}
