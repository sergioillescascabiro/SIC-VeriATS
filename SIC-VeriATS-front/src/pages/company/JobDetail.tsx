import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { companyService } from '@/services/company.service'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function JobDetail() {
    const { id } = useParams({ from: '/company/jobs/$id' })
    const navigate = useNavigate()

    const { data: job, isLoading } = useQuery({
        queryKey: ['company', 'job', id],
        queryFn: () => companyService.getJobDetail(Number(id))
    })

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!job) {
        return <div className="p-8 text-center text-gray-500">Job not found</div>
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {/* Back Button */}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate({ to: '/company/jobs' })}
                className="mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Jobs
            </Button>

            <Card>
                <CardContent className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            <p className="text-sm text-gray-500">
                                Posted on {new Date(job.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant={
                            job.status === 'active' ? 'verified' :
                                job.status === 'closed' ? 'rejected' : 'pending'
                        }>
                            {job.status}
                        </Badge>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Job Description</h2>
                        <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                    </div>

                    {/* Requirements */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                        <div className="space-y-3">
                            {job.requirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CheckCircleIcon className={`w-5 h-5 mt-0.5 ${req.is_required ? 'text-sic-verified' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{req.skill_name}</span>
                                            <Badge variant="pending">{req.proficiency_level}</Badge>
                                            {req.is_required && (
                                                <span className="text-xs text-sic-verified font-medium">Required</span>
                                            )}
                                        </div>
                                        {req.description && (
                                            <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6 border-t border-gray-200">
                        <Button
                            fullWidth
                            onClick={() => navigate({ to: `/company/jobs/${id}/candidates` })}
                        >
                            View Selected Candidates
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
