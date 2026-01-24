import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import {
    BriefcaseIcon,
    PlusIcon,
    PencilIcon,
    UsersIcon,
    MapPinIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AdminTabNavigation from '@/components/admin/AdminTabNavigation'
import { adminService } from '@/services/adminService'
import type { AdminJob } from '@/types/admin'
import { useEffect } from 'react'

// Mock data removed - using real API

interface JobCardProps {
    job: AdminJob
    onEdit: (id: number) => void
    onDefineRequirements: (id: number) => void
}

function JobCard({ job, onEdit, onDefineRequirements }: JobCardProps) {
    const statusConfig = {
        published: { label: 'Published', variant: 'success' as const },
        draft: { label: 'Draft', variant: 'default' as const },
        closed: { label: 'Closed', variant: 'secondary' as const },
        // Fallbacks for alignment
        active: { label: 'Published', variant: 'success' as const },
    }

    const currentStatus = (job.status as string).toLowerCase()
    const config = (statusConfig as any)[currentStatus] || statusConfig.draft

    return (
        <Card className="p-6 hover:shadow-md transition-shadow">
            {/* Company Badge */}
            <div className="flex items-center gap-2 mb-3">
                <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{job.company_name}</span>
            </div>

            {/* Job Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {job.title}
            </h3>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {job.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                    </div>
                )}
                {job.type && (
                    <span className="text-sm text-gray-600">{job.type}</span>
                )}
                <Badge variant={config.variant}>
                    {config.label}
                </Badge>
            </div>

            {/* Candidate Count */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                <UsersIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                    {job.candidate_count} candidates applied
                </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(job.id)}
                >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDefineRequirements(job.id)}
                >
                    Requirements
                </Button>
                <Link to={`/admin/jobs/${job.id}/candidates`} className="col-span-2">
                    <Button size="sm" variant="secondary" className="w-full">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        View Candidates
                    </Button>
                </Link>
            </div>
        </Card>
    )
}

export default function AdminJobs() {
    const search = useSearch({ strict: false }) as any
    const params = useParams({ strict: false }) as any
    const companyIdParam = params.companyId || search.company
    const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all')
    const [companyFilter, setCompanyFilter] = useState<string>('all')

    const { data: jobs, isLoading } = useQuery<AdminJob[]>({
        queryKey: ['admin-jobs'],
        queryFn: () => adminService.getJobs()
    })

    // Set initial company filter from URL
    useEffect(() => {
        if (companyIdParam && jobs) {
            const company = jobs.find(j => j.company_id.toString() === companyIdParam)?.company_name
            if (company) {
                setCompanyFilter(company)
            }
        }
    }, [companyIdParam, jobs])

    const handleEdit = (id: number) => {
        console.log('Edit job:', id)
    }

    const handleDefineRequirements = (id: number) => {
        console.log('Define requirements for job:', id)
    }

    const handleCreateJob = () => {
        console.log('Create new job')
        // TODO: Navigate to create form
    }

    const companies = Array.from(new Set(jobs?.map(j => j.company_name) || []))

    const filteredJobs = jobs?.filter(job => {
        if (filter !== 'all' && job.status !== filter) return false
        if (companyFilter !== 'all' && job.company_name !== companyFilter) return false
        return true
    }) || []

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading jobs...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <AdminTabNavigation />

            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
                            <p className="text-gray-600 mt-1">
                                Manage all job postings in the system
                            </p>
                        </div>
                        <Button onClick={handleCreateJob}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            New Job
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3 mb-6">
                        {/* Status Filter */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={filter === 'all' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('all')}
                            >
                                All ({jobs?.length || 0})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'published' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('published')}
                            >
                                Published ({jobs?.filter(j => j.status === 'published').length || 0})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'draft' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('draft')}
                            >
                                Drafts ({jobs?.filter(j => j.status === 'draft').length || 0})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'closed' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('closed')}
                            >
                                Closed ({jobs?.filter(j => j.status === 'closed').length || 0})
                            </Button>
                        </div>

                        {/* Company Filter */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700 self-center">Company:</span>
                            <Button
                                size="sm"
                                variant={companyFilter === 'all' ? 'primary' : 'ghost'}
                                onClick={() => setCompanyFilter('all')}
                            >
                                All
                            </Button>
                            {companies.map(company => (
                                <Button
                                    key={company}
                                    size="sm"
                                    variant={companyFilter === company ? 'primary' : 'ghost'}
                                    onClick={() => setCompanyFilter(company)}
                                >
                                    {company}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    {filteredJobs.length === 0 ? (
                        <Card className="p-12 text-center">
                            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No jobs found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {filter !== 'all'
                                    ? 'No jobs match the current filters'
                                    : 'Start by creating your first job posting'
                                }
                            </p>
                            {filter === 'all' && (
                                <Button onClick={handleCreateJob}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Create Job
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onEdit={handleEdit}
                                    onDefineRequirements={handleDefineRequirements}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
