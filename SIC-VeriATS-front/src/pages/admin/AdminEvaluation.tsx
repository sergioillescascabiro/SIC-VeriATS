import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tab } from '@headlessui/react'
import {
    ClipboardDocumentCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    BriefcaseIcon,
    UserCircleIcon,
    ArrowLeftIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AdminTabNavigation from '@/components/admin/AdminTabNavigation'
import type { AdminJob, CandidateApplication, RequirementResponse } from '@/types/admin'
import { cn } from '@/utils/cn'

// Mock data
const mockJobs: AdminJob[] = [
    {
        id: '1',
        company_id: '1',
        company_name: 'Tech Solutions Inc.',
        title: 'Senior Full Stack Developer',
        status: 'published',
        candidate_count: 24,
        requirements: [
            { id: 'r1', job_id: '1', title: '5+ years of experience', description: 'Demonstrable experience in full stack development', is_mandatory: true, order: 1 },
            { id: 'r2', job_id: '1', title: 'React and Node.js', description: 'Advanced knowledge of React and Node.js', is_mandatory: true, order: 2 },
            { id: 'r3', job_id: '1', title: 'Advanced English', description: 'C1 level or higher', is_mandatory: false, order: 3 },
        ],
        created_at: '2024-01-15T10:00:00Z',
        location: 'Remote',
        type: 'Full-time'
    },
    {
        id: '2',
        company_id: '1',
        company_name: 'Tech Solutions Inc.',
        title: 'DevOps Engineer',
        status: 'published',
        candidate_count: 18,
        requirements: [],
        created_at: '2024-01-16T11:00:00Z',
        location: 'Madrid',
        type: 'Full-time'
    },
]

const mockApplications: CandidateApplication[] = [
    {
        id: 'app1',
        job_id: '1',
        job_title: 'Senior Full Stack Developer',
        company_name: 'Tech Solutions Inc.',
        candidate_id: 'c1',
        candidate_identifier: 'SIC-001',
        applied_at: '2024-01-20T10:00:00Z',
        status: 'not_evaluated',
        requirements_responses: [
            {
                requirement_id: 'r1',
                requirement_title: '5+ years of experience',
                requirement_description: 'Demonstrable experience in full stack development',
                is_mandatory: true,
                candidate_justification: 'I have worked 7 years as a full stack developer at various companies since 2016. My CV shows experience on large-scale projects using React, Angular, Node.js, and PostgreSQL.',
            },
            {
                requirement_id: 'r2',
                requirement_title: 'React and Node.js',
                requirement_description: 'Advanced knowledge of React and Node.js',
                is_mandatory: true,
                candidate_justification: 'I have been working professionally with React and Node.js for 5 years. I have built complete applications with these stacks, including RESTful APIs, JWT authentication, and state management with Redux.',
            },
            {
                requirement_id: 'r3',
                requirement_title: 'Advanced English',
                requirement_description: 'C1 level or higher',
                is_mandatory: false,
                candidate_justification: 'I hold a TOEFL certificate with a score of 105/120, equivalent to C1. I have worked on international teams and can communicate fluently in English.',
            },
        ]
    },
    {
        id: 'app2',
        job_id: '1',
        job_title: 'Senior Full Stack Developer',
        company_name: 'Tech Solutions Inc.',
        candidate_id: 'c2',
        candidate_identifier: 'SIC-002',
        applied_at: '2024-01-21T14:30:00Z',
        status: 'not_evaluated',
        requirements_responses: [
            {
                requirement_id: 'r1',
                requirement_title: '5+ years of experience',
                requirement_description: 'Demonstrable experience in full stack development',
                is_mandatory: true,
                candidate_justification: 'I have 3 years of experience as a junior full stack developer, but I have worked on multiple large projects.',
            },
            {
                requirement_id: 'r2',
                requirement_title: 'React and Node.js',
                requirement_description: 'Advanced knowledge of React and Node.js',
                is_mandatory: true,
                candidate_justification: 'I have known React and Node.js for 2 years and use them in my current job.',
            },
            {
                requirement_id: 'r3',
                requirement_title: 'Advanced English',
                requirement_description: 'C1 level or higher',
                is_mandatory: false,
                candidate_justification: 'Intermediate English level, B2.',
            },
        ]
    },
]

interface RequirementEvaluationProps {
    requirement: RequirementResponse
    onValidate: (requirementId: string, complies: boolean, comment?: string) => void
    validation?: { complies: boolean; comment?: string }
}

function RequirementEvaluation({ requirement, onValidate, validation }: RequirementEvaluationProps) {
    const [comment, setComment] = useState(validation?.comment || '')

    return (
        <Card className="p-5 border-l-4 border-gray-300">
            {/* Requirement Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{requirement.requirement_title}</h4>
                        {requirement.is_mandatory && (
                            <Badge variant="warning">Required</Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">{requirement.requirement_description}</p>
                </div>
            </div>

            {/* Candidate Justification */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-900 mb-1">Candidate's justification:</p>
                <p className="text-sm text-gray-800">{requirement.candidate_justification}</p>
            </div>

            {/* Validation Actions */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={validation?.complies === true ? 'primary' : 'ghost'}
                        onClick={() => onValidate(requirement.requirement_id, true, comment)}
                        className={cn(
                            validation?.complies === true && 'bg-green-600 hover:bg-green-700 text-white'
                        )}
                    >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Complies
                    </Button>
                    <Button
                        size="sm"
                        variant={validation?.complies === false ? 'primary' : 'ghost'}
                        onClick={() => onValidate(requirement.requirement_id, false, comment)}
                        className={cn(
                            validation?.complies === false && 'bg-red-600 hover:bg-red-700 text-white'
                        )}
                    >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Does Not Comply
                    </Button>
                </div>

                {/* Optional Comment */}
                <textarea
                    placeholder="Optional comment on this evaluation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sic-steel focus:border-transparent resize-none"
                    rows={2}
                />
            </div>
        </Card>
    )
}

export default function AdminEvaluation() {
    const [selectedJobId, setSelectedJobId] = useState<string>('')
    const [selectedApplicationIndex, setSelectedApplicationIndex] = useState(0)
    const [validations, setValidations] = useState<Record<string, { complies: boolean; comment?: string }>>({})
    const [finalDecision, setFinalDecision] = useState<'selected' | 'rejected' | null>(null)

    const { data: jobs } = useQuery({
        queryKey: ['admin-evaluation-jobs'],
        queryFn: async () => mockJobs
    })

    const { data: applications } = useQuery({
        queryKey: ['admin-job-applications', selectedJobId],
        queryFn: async () => {
            if (!selectedJobId) return []
            return mockApplications.filter(app => app.job_id === selectedJobId)
        },
        enabled: !!selectedJobId
    })

    const currentApplication = applications?.[selectedApplicationIndex]

    const handleValidateRequirement = (requirementId: string, complies: boolean, comment?: string) => {
        setValidations(prev => ({
            ...prev,
            [requirementId]: { complies, comment }
        }))
    }

    const handleFinalDecision = (decision: 'selected' | 'rejected') => {
        setFinalDecision(decision)
        // TODO: Submit evaluation to API
        console.log('Final decision:', {
            applicationId: currentApplication?.id,
            decision,
            validations
        })

        // Move to next candidate
        if (applications && selectedApplicationIndex < applications.length - 1) {
            setSelectedApplicationIndex(prev => prev + 1)
            setValidations({})
            setFinalDecision(null)
        }
    }

    const handleNextCandidate = () => {
        if (applications && selectedApplicationIndex < applications.length - 1) {
            setSelectedApplicationIndex(prev => prev + 1)
            setValidations({})
            setFinalDecision(null)
        }
    }

    const handlePreviousCandidate = () => {
        if (selectedApplicationIndex > 0) {
            setSelectedApplicationIndex(prev => prev - 1)
            setValidations({})
            setFinalDecision(null)
        }
    }

    // Check if all mandatory requirements are validated
    const allMandatoryValidated = currentApplication?.requirements_responses
        .filter(r => r.is_mandatory)
        .every(r => validations[r.requirement_id] !== undefined) || false

    return (
        <div className="flex flex-col h-full">
            <AdminTabNavigation />

            <div className="flex-1 overflow-hidden bg-gray-50">
                {!selectedJobId ? (
                    // Job Selection View
                    <div className="h-full overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Candidate Evaluation</h1>
                                <p className="text-gray-600 mt-1">
                                    Select a job posting to start evaluating candidates
                                </p>
                            </div>

                            <div className="space-y-4">
                                {jobs?.map(job => (
                                    <Card
                                        key={job.id}
                                        className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedJobId(job.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{job.company_name}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">
                                                        {job.candidate_count} candidates
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {job.requirements.length} requirements
                                                    </span>
                                                </div>
                                            </div>
                                            <Button size="sm">
                                                Evaluate
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Evaluation View
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedJobId('')
                                        setSelectedApplicationIndex(0)
                                        setValidations({})
                                    }}
                                >
                                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                    Change Job
                                </Button>
                                <div className="text-sm text-gray-600">
                                    Candidate {selectedApplicationIndex + 1} of {applications?.length || 0}
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {jobs?.find(j => j.id === selectedJobId)?.title}
                            </h1>
                            {currentApplication && (
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="font-mono text-sm font-semibold text-sic-steel">
                                        {currentApplication.candidate_identifier}
                                    </span>
                                    <Badge variant="warning">In Evaluation</Badge>
                                </div>
                            )}
                        </div>

                        {currentApplication ? (
                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Mobile Tabs */}
                                <div className="md:hidden flex-1 flex flex-col">
                                    <Tab.Group>
                                        <Tab.List className="flex border-b border-gray-200 bg-white">
                                            <Tab className={({ selected }) => cn(
                                                'w-1/2 py-3 text-sm font-medium',
                                                selected ? 'text-sic-steel border-b-2 border-sic-steel' : 'text-gray-500'
                                            )}>
                                                CV
                                            </Tab>
                                            <Tab className={({ selected }) => cn(
                                                'w-1/2 py-3 text-sm font-medium',
                                                selected ? 'text-sic-steel border-b-2 border-sic-steel' : 'text-gray-500'
                                            )}>
                                                Requirements ({currentApplication.requirements_responses.length})
                                            </Tab>
                                        </Tab.List>
                                        <Tab.Panels className="flex-1 overflow-y-auto p-4">
                                            <Tab.Panel>
                                                <div className="h-96 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                                    <div className="text-center">
                                                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-gray-500 font-medium">CV Preview</p>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel className="space-y-4">
                                                {currentApplication.requirements_responses.map(req => (
                                                    <RequirementEvaluation
                                                        key={req.requirement_id}
                                                        requirement={req}
                                                        onValidate={handleValidateRequirement}
                                                        validation={validations[req.requirement_id]}
                                                    />
                                                ))}
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>

                                {/* Desktop Split View */}
                                <div className="hidden md:flex flex-1">
                                    {/* Left: CV Viewer */}
                                    <div className="w-1/2 p-6 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                                            Curriculum Vitae
                                        </h2>
                                        <div className="h-[600px] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                            <div className="text-center">
                                                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-500 font-medium">CV Preview</p>
                                                <p className="text-xs text-gray-400 mt-1">PDF rendering will appear here</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Requirements Evaluation */}
                                    <div className="w-1/2 p-6 bg-white overflow-y-auto">
                                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                                            <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                                            Requirements ({currentApplication.requirements_responses.length})
                                        </h2>
                                        <div className="space-y-4">
                                            {currentApplication.requirements_responses.map(req => (
                                                <RequirementEvaluation
                                                    key={req.requirement_id}
                                                    requirement={req}
                                                    onValidate={handleValidateRequirement}
                                                    validation={validations[req.requirement_id]}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No candidates to evaluate</p>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        {currentApplication && (
                            <div className="bg-white border-t border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={handlePreviousCandidate}
                                        disabled={selectedApplicationIndex === 0}
                                    >
                                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleFinalDecision('rejected')}
                                            disabled={!allMandatoryValidated}
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-2" />
                                            Do Not Select
                                        </Button>
                                        <Button
                                            onClick={() => handleFinalDecision('selected')}
                                            disabled={!allMandatoryValidated}
                                        >
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                            Select
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        onClick={handleNextCandidate}
                                        disabled={!applications || selectedApplicationIndex >= applications.length - 1}
                                    >
                                        Next
                                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
