import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
    BuildingOfficeIcon,
    BriefcaseIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import AdminTabNavigation from '@/components/admin/AdminTabNavigation'
import { adminService } from '@/services/adminService'
import type { AdminStats } from '@/types/admin'

// No more mock data!

interface StatCardProps {
    title: string
    value: number
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    color: 'blue' | 'green' | 'purple' | 'orange' | 'teal'
}

const colorVariants = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    teal: 'bg-teal-50 text-teal-600',
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
    return (
        <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorVariants[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    )
}

export default function AdminDashboard() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats
    })

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading statistics...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <AdminTabNavigation />

            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                        <p className="text-gray-600 mt-1">
                            Global summary of the job fair
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Companies Stats */}
                        <StatCard
                            title="Published Companies"
                            value={stats?.published_companies || 0}
                            subtitle={`${stats?.total_companies || 0} total`}
                            icon={BuildingOfficeIcon}
                            color="blue"
                        />

                        {/* Jobs Stats */}
                        <StatCard
                            title="Active Jobs"
                            value={stats?.active_jobs || 0}
                            subtitle={`${stats?.total_jobs || 0} total`}
                            icon={BriefcaseIcon}
                            color="purple"
                        />

                        {/* Candidates Stats */}
                        <StatCard
                            title="Registered Candidates"
                            value={stats?.total_candidates || 0}
                            icon={UsersIcon}
                            color="green"
                        />

                        {/* Pending Evaluation */}
                        <StatCard
                            title="Pending Evaluation"
                            value={stats?.pending_evaluation || 0}
                            icon={ClipboardDocumentListIcon}
                            color="orange"
                        />

                        {/* Selected Candidates */}
                        <StatCard
                            title="Selected Candidates"
                            value={stats?.selected_candidates || 0}
                            icon={CheckCircleIcon}
                            color="teal"
                        />

                        {/* Progress Summary */}
                        <Card className="p-6 bg-gradient-to-br from-sic-steel to-sic-steel/80 text-white">
                            <h3 className="text-sm font-medium opacity-90">Evaluation Progress</h3>
                            <div className="mt-4">
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold">
                                        {stats ? Math.round(
                                            ((stats.total_candidates - stats.pending_evaluation) / stats.total_candidates) * 100
                                        ) : 0}%
                                    </span>
                                    <span className="text-sm opacity-75 mb-1">completed</span>
                                </div>
                                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-white h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${stats ? Math.round(
                                                ((stats.total_candidates - stats.pending_evaluation) / stats.total_candidates) * 100
                                            ) : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/admin/evaluation">
                                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group h-full">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                                            <ClipboardDocumentListIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Go to Evaluation</p>
                                            <p className="text-sm text-gray-500">
                                                {stats?.pending_evaluation || 0} pending
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link to="/admin/jobs">
                                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group h-full">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                            <BriefcaseIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Manage Jobs</p>
                                            <p className="text-sm text-gray-500">
                                                {stats?.active_jobs || 0} active
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link to="/admin/companies">
                                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group h-full">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <BuildingOfficeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">View Companies</p>
                                            <p className="text-sm text-gray-500">
                                                {stats?.published_companies || 0} published
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
