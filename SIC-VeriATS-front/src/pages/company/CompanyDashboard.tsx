import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/services/company.service'
import Card, { CardContent } from '@/components/ui/Card'
import { useNavigate } from '@tanstack/react-router'
import { BriefcaseIcon, UsersIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CompanyDashboard() {
    const navigate = useNavigate()

    const { data: stats, isLoading } = useQuery({
        queryKey: ['company', 'dashboard'],
        queryFn: companyService.getDashboard
    })

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{stats?.company_name}</h1>
                <p className="text-gray-500 mt-2">Welcome to your company dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="hover:border-sic-steel/30 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Active Jobs</p>
                                <p className="text-4xl font-bold text-sic-steel mt-2">{stats?.active_jobs || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-sic-steel/10 rounded-lg flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-sic-steel" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-sic-steel/30 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Selected Candidates</p>
                                <p className="text-4xl font-bold text-sic-verified mt-2">{stats?.total_candidates || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-sic-verified/10 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-sic-verified" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>

                <Card className="hover:border-sic-steel/30 transition-colors cursor-pointer group"
                    onClick={() => navigate({ to: '/company/jobs' })}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-sic-steel transition-colors">
                                    View My Jobs
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    See all your active and closed job postings
                                </p>
                            </div>
                            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-sic-steel transition-colors" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
