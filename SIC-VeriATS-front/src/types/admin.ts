// Admin types for the multi-company ATS

export interface AdminStats {
    total_companies: number
    published_companies: number
    total_jobs: number
    active_jobs: number
    total_candidates: number
    pending_evaluation: number
    selected_candidates: number
}

export interface AdminCompany {
    id: number
    email: string
    company_name: string
    company_description?: string
    company_logo_url?: string
    company_status: 'draft' | 'published'
    company_industry?: string
    company_website?: string
    is_sponsor: boolean
    job_count: number
    created_at: string
}

export interface AdminJob {
    id: number
    company_id: number
    company_name: string
    company_logo?: string
    title: string
    status: 'draft' | 'published' | 'closed'
    candidate_count: number
    requirements: AdminRequirement[]
    created_at: string
    location?: string
    type?: 'Full-time' | 'Part-time' | 'Contract'
}

export interface AdminRequirement {
    id: string
    job_id: string
    title: string
    description: string
    is_mandatory: boolean
    order: number
}

export interface AdminCandidate {
    id: string
    identifier: string  // Anonymized ID like "SIC-123"
    full_name: string   // Only visible to admin
    email: string
    application_count: number
    evaluation_status: 'not_evaluated' | 'in_evaluation' | 'selected' | 'rejected'
    created_at: string
    cv_url?: string
}

export interface CandidateApplication {
    id: string
    job_id: string
    job_title: string
    company_name: string
    candidate_id: string
    candidate_identifier: string
    applied_at: string
    status: 'not_evaluated' | 'in_evaluation' | 'selected' | 'rejected'
    requirements_responses: RequirementResponse[]
}

export interface RequirementResponse {
    requirement_id: string
    requirement_title: string
    requirement_description: string
    is_mandatory: boolean
    candidate_justification: string
    admin_validation?: 'complies' | 'not_complies'
    admin_comment?: string
}

export interface EvaluationDecision {
    application_id: string
    status: 'selected' | 'rejected'
    comment?: string
    validated_requirements: {
        requirement_id: string
        complies: boolean
        comment?: string
    }[]
}
