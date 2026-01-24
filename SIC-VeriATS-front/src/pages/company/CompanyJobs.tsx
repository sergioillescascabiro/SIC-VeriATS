import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/services/company.service'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useNavigate } from '@tanstack/react-router'
import { BriefcaseIcon, UserGroupIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function CompanyJobs() {
    const navigate = useNavigate()
    const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['company', 'jobs'],
        queryFn: companyService.getJobs
    })

    // Fetch job details when expanded
    const { data: jobDetail } = useQuery({
        queryKey: ['company', 'job', expandedJobId],
        queryFn: () => companyService.getJobDetail(expandedJobId!),
        enabled: expandedJobId !== null
    })

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    const toggleJob = (jobId: number) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId)
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-gray-500 text-sm mt-1">
                    View your active job postings and selected candidates
                </p>
            </div>

            {/* Jobs Grid */}
            {!jobs || jobs.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No jobs posted yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:border-sic-steel/30 transition-colors">
                            <CardContent className="p-6">
                                {/* Header - Clickable to expand */}
                                <div
                                    className="flex items-start justify-between mb-4 cursor-pointer"
                                    onClick={() => toggleJob(job.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-sic-steel transition-colors">
                                                {job.title}
                                            </h3>
                                            <Badge variant={
                                                job.status === 'active' ? 'verified' :
                                                    job.status === 'closed' ? 'rejected' : 'pending'
                                            }>
                                                {job.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <div className="ml-4">
                                        {expandedJobId === job.id ? (
                                            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content - Requirements */}
                                {expandedJobId === job.id && jobDetail && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3">Requirements</h4>
                                        <div className="space-y-2">
                                            {jobDetail.requirements.map((req, index) => (
                                                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <CheckCircleIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${req.is_required ? 'text-sic-verified' : 'text-gray-400'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-medium text-gray-900">{req.skill_name}</span>
                                                            <Badge variant="pending" className="text-xs">{req.proficiency_level}</Badge>
                                                            {req.is_required && (
                                                                <span className="text-xs text-sic-verified font-medium">Required</span>
                                                            )}
                                                        </div>
                                                        {req.description && (
                                                            <p className="text-xs text-gray-600 mt-1">{req.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <UserGroupIcon className="w-4 h-4 mr-1" />
                                        <span>{job.candidate_count} selected candidate{job.candidate_count !== 1 ? 's' : ''}</span>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (job.candidate_count > 0) {
                                                navigate({ to: `/company/jobs/${job.id}/candidates` })
                                            }
                                        }}
                                        disabled={job.candidate_count === 0}
                                    >
                                        View Candidates
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
