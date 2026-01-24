import { Link, useLocation } from '@tanstack/react-router'
import {
    ChartBarIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface AdminTab {
    name: string
    path: string
    icon: React.ComponentType<{ className?: string }>
}

const adminTabs: AdminTab[] = [
    { name: 'Overview', path: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Companies', path: '/admin/companies', icon: BuildingOfficeIcon },
    { name: 'Jobs', path: '/admin/jobs', icon: BriefcaseIcon },
    { name: 'Candidates', path: '/admin/candidates', icon: UsersIcon },
    { name: 'Evaluation', path: '/admin/evaluation', icon: ClipboardDocumentCheckIcon },
]

export default function AdminTabNavigation() {
    const location = useLocation()

    return (
        <nav className="bg-white border-b border-gray-200">
            {/* Desktop tabs */}
            <div className="hidden md:flex">
                {adminTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = location.pathname === tab.path ||
                        (tab.path !== '/admin/dashboard' && location.pathname.startsWith(tab.path))

                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                                isActive
                                    ? 'border-sic-steel text-sic-steel'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Mobile tabs - horizontal scroll */}
            <div className="md:hidden flex overflow-x-auto">
                {adminTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = location.pathname === tab.path ||
                        (tab.path !== '/admin/dashboard' && location.pathname.startsWith(tab.path))

                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                                'flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                                isActive
                                    ? 'border-sic-steel text-sic-steel'
                                    : 'border-transparent text-gray-500'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
