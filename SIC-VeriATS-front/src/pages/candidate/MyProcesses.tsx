import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import ApplicationCard from '@/components/fair/ApplicationCard'
import { Application } from '@/types/fair'

const MOCK_APPLICATIONS: Application[] = [
    {
        id: 'a1',
        vacancy_id: 'v1',
        vacancy_title: 'Senior Backend Engineer',
        company_name: 'TechGlobal Inc.',
        applied_at: '2026-01-20T10:00:00Z',
        status: 'review',
        requirements_met: true
    },
    {
        id: 'a2',
        vacancy_id: 'v5',
        vacancy_title: 'DevOps Specialist',
        company_name: 'CloudSys Solutions',
        applied_at: '2026-01-22T14:30:00Z',
        status: 'sent',
        requirements_met: true
    },
    {
        id: 'a3',
        vacancy_id: 'v8',
        vacancy_title: 'Full Stack Developer',
        company_name: 'StartUp Rocket',
        applied_at: '2026-01-18T09:15:00Z',
        status: 'selected',
        requirements_met: true
    }
]

export default function MyProcesses() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<'all' | 'active' | 'selected'>('all')

    const filteredApps = MOCK_APPLICATIONS.filter(app => {
        if (filter === 'selected') return app.status === 'selected'
        if (filter === 'active') return app.status !== 'selected' // 'sent' or 'review'
        return true
    })

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-4 py-6 border-b border-gray-200 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-500 text-sm mt-1">Track your progress in the Job Fair</p>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                    {(['all', 'active', 'selected'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors
                ${filter === f
                                    ? 'bg-sic-steel text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
                        >
                            {f} ({
                                f === 'all' ? MOCK_APPLICATIONS.length :
                                    f === 'selected' ? MOCK_APPLICATIONS.filter(a => a.status === 'selected').length :
                                        MOCK_APPLICATIONS.filter(a => a.status !== 'selected').length
                            })
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {filteredApps.map(app => (
                    <ApplicationCard
                        key={app.id}
                        application={app}
                        onViewDetail={() => navigate({ to: '/candidate/processes/$id', params: { id: app.id } } as any)}
                    />
                ))}

                {filteredApps.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No applications found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
