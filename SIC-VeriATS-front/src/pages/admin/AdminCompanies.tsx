import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
    BuildingOfficeIcon,
    PlusIcon,
    PencilIcon,
    EyeIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AdminTabNavigation from '@/components/admin/AdminTabNavigation'
import CompanyModal from '@/components/admin/CompanyModal'
import { adminService } from '@/services/adminService'
import type { AdminCompany } from '@/types/admin'
import { StarIcon } from '@heroicons/react/24/solid'

// No more mock data!

interface CompanyCardProps {
    company: AdminCompany
    onEdit: (id: number) => void
    onToggleStatus: (id: number) => void
}

function CompanyCard({ company, onEdit, onToggleStatus }: CompanyCardProps) {
    return (
        <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                    {/* Company Logo/Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-sic-steel to-sic-steel/80 rounded-lg flex items-center justify-center flex-shrink-0">
                        {company.company_logo_url ? (
                            <img
                                src={company.company_logo_url}
                                alt={company.company_name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                        )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.company_name}
                        </h3>
                        {company.company_description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {company.company_description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <BriefcaseIcon className="w-4 h-4" />
                                <span>{company.job_count} jobs</span>
                            </div>
                            <Badge
                                variant={company.company_status === 'published' ? 'success' : 'default'}
                            >
                                {company.company_status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                            {company.is_sponsor && (
                                <Badge variant="sponsor" className="flex items-center gap-1">
                                    <StarIcon className="w-3 h-3 text-yellow-400" />
                                    Sponsor
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(company.id)}
                    className="flex-1"
                >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleStatus(company.id)}
                    className="flex-1"
                >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {company.company_status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Link to="/admin/jobs" search={{ company: company.id.toString() }}>
                    <Button size="sm" variant="ghost" className="whitespace-nowrap">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        View Jobs
                    </Button>
                </Link>
            </div>
        </Card>
    )
}

export default function AdminCompanies() {
    const search = useSearch({ strict: false }) as { status?: 'all' | 'published' | 'draft' }
    const navigate = useNavigate()
    const filter = search.status || 'all'

    const queryClient = useQueryClient()

    // Fetch all companies once and filter in the UI to keep counts correct
    const { data: companies, isLoading } = useQuery<AdminCompany[]>({
        queryKey: ['admin-companies-global'], // Unique key for all companies
        queryFn: () => adminService.getCompanies(),
        staleTime: 10 * 60 * 1000 // 10 minutes
    })

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: adminService.toggleCompanyStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies-global'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        }
    })

    // Memoized counts to ensure they stay stable and correct
    const counts = useMemo(() => {
        const total = companies?.length || 0
        const published = companies?.filter((c: AdminCompany) => c.company_status === 'published').length || 0
        const draft = companies?.filter((c: AdminCompany) => c.company_status === 'draft').length || 0
        return { total, published, draft }
    }, [companies])

    const setFilter = (newFilter: 'all' | 'published' | 'draft') => {
        navigate({
            to: '/admin/companies',
            search: (prev: any) => ({ ...prev, status: newFilter === 'all' ? undefined : newFilter })
        })
    }

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        company?: AdminCompany
    }>({
        isOpen: false
    })

    const handleEdit = (id: number) => {
        const company = companies?.find(c => c.id === id)
        if (company) {
            setModalConfig({
                isOpen: true,
                company
            })
        }
    }

    const handleToggleStatus = (id: number) => {
        toggleStatusMutation.mutate(id)
    }

    const handleCreateCompany = () => {
        setModalConfig({
            isOpen: true
        })
    }

    const filteredCompanies = (companies || []).filter((company: AdminCompany) => {
        if (filter === 'all') return true
        return company.company_status === filter
    })

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading companies...</div>
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
                            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
                            <p className="text-gray-600 mt-1">
                                Manage participating companies
                            </p>
                        </div>
                        <Button onClick={handleCreateCompany}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            New Company
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('all')}
                        >
                            All ({counts.total})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'published' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('published')}
                        >
                            Published ({counts.published})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'draft' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('draft')}
                        >
                            Drafts ({counts.draft})
                        </Button>
                    </div>

                    {/* Companies Grid */}
                    {filteredCompanies.length === 0 ? (
                        <Card className="p-12 text-center">
                            <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No companies found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start by creating your first company
                            </p>
                            <Button onClick={handleCreateCompany}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create Company
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {filteredCompanies.map(company => (
                                <CompanyCard
                                    key={company.id}
                                    company={company}
                                    onEdit={handleEdit}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CompanyModal
                isOpen={modalConfig.isOpen}
                company={modalConfig.company}
                onClose={() => setModalConfig({ isOpen: false })}
            />
        </div>
    )
}
