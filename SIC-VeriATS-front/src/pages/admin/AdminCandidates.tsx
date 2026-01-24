import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import AdminTabNavigation from '@/components/admin/AdminTabNavigation'
import type { AdminCandidate } from '@/types/admin'

// Mock data
const mockCandidates: AdminCandidate[] = [
    {
        id: '1',
        identifier: 'SIC-001',
        full_name: 'Juan Pérez García',
        email: 'juan.perez@example.com',
        application_count: 3,
        evaluation_status: 'in_evaluation',
        created_at: '2024-01-15T10:00:00Z',
        cv_url: '/cvs/candidate-1.pdf'
    },
    {
        id: '2',
        identifier: 'SIC-002',
        full_name: 'María López Martínez',
        email: 'maria.lopez@example.com',
        application_count: 5,
        evaluation_status: 'selected',
        created_at: '2024-01-16T11:00:00Z',
        cv_url: '/cvs/candidate-2.pdf'
    },
    {
        id: '3',
        identifier: 'SIC-003',
        full_name: 'Carlos Rodríguez Sánchez',
        email: 'carlos.rodriguez@example.com',
        application_count: 2,
        evaluation_status: 'not_evaluated',
        created_at: '2024-01-17T14:30:00Z'
    },
    {
        id: '4',
        identifier: 'SIC-004',
        full_name: 'Ana González Torres',
        email: 'ana.gonzalez@example.com',
        application_count: 4,
        evaluation_status: 'selected',
        created_at: '2024-01-18T09:15:00Z',
        cv_url: '/cvs/candidate-4.pdf'
    },
    {
        id: '5',
        identifier: 'SIC-005',
        full_name: 'Pedro Martín Ruiz',
        email: 'pedro.martin@example.com',
        application_count: 1,
        evaluation_status: 'rejected',
        created_at: '2024-01-19T16:45:00Z'
    },
]

interface CandidateRowProps {
    candidate: AdminCandidate
    onViewProfile: (id: string) => void
}

function CandidateRow({ candidate, onViewProfile }: CandidateRowProps) {
    const statusConfig = {
        not_evaluated: { label: 'Not Evaluated', variant: 'default' as const, color: 'text-gray-600' },
        in_evaluation: { label: 'In Evaluation', variant: 'warning' as const, color: 'text-orange-600' },
        selected: { label: 'Selected', variant: 'success' as const, color: 'text-green-600' },
        rejected: { label: 'Rejected', variant: 'secondary' as const, color: 'text-red-600' },
    }

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-sic-steel">
                            {candidate.identifier}
                        </span>
                        <Badge variant={statusConfig[candidate.evaluation_status].variant}>
                            {statusConfig[candidate.evaluation_status].label}
                        </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {candidate.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                        {candidate.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                            {candidate.application_count} applications
                        </span>
                        {candidate.cv_url && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <DocumentTextIcon className="w-4 h-4" />
                                CV available
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewProfile(candidate.id)}
                    >
                        View Profile
                    </Button>
                    <Link to={`/admin/evaluation?candidate=${candidate.id}`}>
                        <Button size="sm" variant="secondary">
                            <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                            Evaluate
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}

export default function AdminCandidates() {
    const [statusFilter, setStatusFilter] = useState<AdminCandidate['evaluation_status'] | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['admin-candidates'],
        queryFn: async () => {
            // TODO: Replace with actual API call
            return mockCandidates
        }
    })

    const handleViewProfile = (id: string) => {
        console.log('View candidate profile:', id)
        // TODO: Navigate to candidate profile or open modal
    }

    const filteredCandidates = candidates?.filter(candidate => {
        // Filter by status
        if (statusFilter !== 'all' && candidate.evaluation_status !== statusFilter) {
            return false
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                candidate.identifier.toLowerCase().includes(query) ||
                candidate.full_name.toLowerCase().includes(query) ||
                candidate.email.toLowerCase().includes(query)
            )
        }

        return true
    }) || []

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading candidates...</div>
            </div>
        )
    }

    const stats = {
        total: candidates?.length || 0,
        not_evaluated: candidates?.filter(c => c.evaluation_status === 'not_evaluated').length || 0,
        in_evaluation: candidates?.filter(c => c.evaluation_status === 'in_evaluation').length || 0,
        selected: candidates?.filter(c => c.evaluation_status === 'selected').length || 0,
        rejected: candidates?.filter(c => c.evaluation_status === 'rejected').length || 0,
    }

    return (
        <div className="flex flex-col h-full">
            <AdminTabNavigation />

            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
                        <p className="text-gray-600 mt-1">
                            Global view of all candidates in the fair
                        </p>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-gray-600 mb-1">Not Evaluated</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.not_evaluated}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-orange-600 mb-1">In Evaluation</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.in_evaluation}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-green-600 mb-1">Selected</p>
                            <p className="text-2xl font-bold text-green-600">{stats.selected}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-red-600 mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </Card>
                    </div>

                    {/* Search and Filters */}
                    <Card className="p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by ID, name, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sic-steel focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'not_evaluated' ? 'primary' : 'secondary'}
                                    onClick={() => setStatusFilter('not_evaluated')}
                                >
                                    Not Evaluated
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'in_evaluation' ? 'primary' : 'secondary'}
                                    onClick={() => setStatusFilter('in_evaluation')}
                                >
                                    In Evaluation
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'selected' ? 'primary' : 'secondary'}
                                    onClick={() => setStatusFilter('selected')}
                                >
                                    Selected
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Candidates List */}
                    {filteredCandidates.length === 0 ? (
                        <Card className="p-12 text-center">
                            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No candidates found
                            </h3>
                            <p className="text-gray-600">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'No candidates match the current filters'
                                    : 'No candidates are registered in the system yet'
                                }
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredCandidates.map(candidate => (
                                <CandidateRow
                                    key={candidate.id}
                                    candidate={candidate}
                                    onViewProfile={handleViewProfile}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
