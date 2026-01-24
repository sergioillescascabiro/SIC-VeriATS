import api from './api'

export interface DashboardStats {
    active_jobs: number
    total_candidates: number
    company_name: string
}

export interface JobSummary {
    id: number
    title: string
    description: string
    status: string
    created_at: string
    candidate_count: number
}

export interface JobDetail {
    id: number
    title: string
    description: string
    status: string
    created_at: string
    requirements: Array<{
        skill_name: string
        proficiency_level: string
        description?: string
        is_required: boolean
    }>
}

export interface AnonymousCandidate {
    blind_code: string
    score: number
    years_of_experience: number
    skills?: string
    bio?: string
    application_status: string
}

export const companyService = {
    getDashboard: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/company/dashboard')
        return response.data
    },

    getJobs: async (): Promise<JobSummary[]> => {
        const response = await api.get<JobSummary[]>('/company/jobs')
        return response.data
    },

    getJobDetail: async (jobId: number): Promise<JobDetail> => {
        const response = await api.get<JobDetail>(`/company/jobs/${jobId}`)
        return response.data
    },

    getJobCandidates: async (jobId: number): Promise<AnonymousCandidate[]> => {
        const response = await api.get<AnonymousCandidate[]>(`/company/jobs/${jobId}/candidates`)
        return response.data
    },

    getCandidateDetail: async (blindCode: string): Promise<AnonymousCandidate> => {
        const response = await api.get<AnonymousCandidate>(`/company/candidates/${blindCode}`)
        return response.data
    },

    downloadCV: async (blindCode: string): Promise<Blob> => {
        const response = await api.get(`/company/candidates/${blindCode}/cv`, {
            responseType: 'blob'
        })
        return response.data
    }
}
