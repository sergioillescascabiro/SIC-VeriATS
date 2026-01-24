export interface Company {
    id: string
    name: string
    logo_url?: string
    vacancy_count: number
    description?: string
}

export interface JobVacancy {
    id: string
    company_id: string
    title: string
    location: string
    type: 'Full-time' | 'Part-time' | 'Contract'
    category: string
    salary_range?: string
    description: string
    requirements: string[]
    status: 'available' | 'applied' | 'closed'
}

export interface Application {
    id: string
    vacancy_id: string
    vacancy_title: string
    company_name: string
    applied_at: string
    status: 'sent' | 'review' | 'selected'
    requirements_met: boolean
    last_update?: string
}

export interface CandidateProfile {
    id: string
    full_name: string
    email: string
    phone: string
    cv_url?: string
    cv_filename?: string
    completed: boolean
    experience: string
}
