export interface Skill {
    id: number
    name: string
}

export interface Claim {
    id: number
    skill_name: string
    skill_id: number
    status: 'pending' | 'validated' | 'rejected'
    verified_by?: number
    verified_at?: string
}

export interface Candidate {
    id: number
    name: string
    email: string
    phone?: string
    photo_url?: string
    verification_score: number
    status: 'pending' | 'verified' | 'revealed'
    skills: Skill[]
    claims: Claim[]
    years_experience?: number
    created_at: string
    updated_at: string
}

export interface BlindCandidate {
    id: number
    code: string // SIC-XX
    verification_score: number
    status: 'pending' | 'verified' | 'revealed'
    skills: Skill[]
    years_experience?: number
    created_at: string
}

export interface ApplicationStatus {
    stage: 'uploaded' | 'in_review' | 'verified' | 'visible_to_companies'
    cv_uploaded: boolean
    claims_total: number
    claims_validated: number
    claims_rejected: number
    updated_at: string
}
