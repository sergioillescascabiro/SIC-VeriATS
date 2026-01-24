import api from './api'
import { CandidateProfile } from '@/types/fair'

export const candidateService = {
    getProfile: async (): Promise<CandidateProfile> => {
        const response = await api.get('/candidates/me')
        return response.data
    },

    updateProfile: async (data: Partial<CandidateProfile>): Promise<CandidateProfile> => {
        const response = await api.patch('/candidates/me', data)
        return response.data
    },

    uploadCV: async (file: File): Promise<{ url: string, filename: string }> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/candidates/me/cv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getCVs: async (): Promise<{ id: string, filename: string, uploaded_at: string }[]> => {
        const response = await api.get('/candidates/me/cvs')
        return response.data
    }
}
