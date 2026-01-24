import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
    HomeIcon,
    UserGroupIcon,
    DocumentCheckIcon,
    ClipboardDocumentCheckIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    BuildingOfficeIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export default function MainLayout() {
    const { user, signOut } = useAuth()
    const location = useLocation()

    // Define navigation items based on role
    const getNavItems = () => {

        if (user?.role === 'super_admin' || user?.role === 'screener') {
            return [
                { name: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
                { name: 'Companies', to: '/admin/companies', icon: BuildingOfficeIcon },
                { name: 'Jobs', to: '/admin/jobs', icon: BriefcaseIcon },
                { name: 'Candidates', to: '/admin/candidates', icon: UserGroupIcon },
                { name: 'Evaluation', to: '/admin/evaluation', icon: ClipboardDocumentCheckIcon },
            ]
        }

        if (user?.role === 'company_user') {
            return [
                { name: 'Dashboard', to: '/company/dashboard', icon: HomeIcon },
                { name: 'My Jobs', to: '/company/jobs', icon: DocumentCheckIcon },
            ]
        }

        if (user?.role === 'candidate') {
            return [
                { name: 'Fair', to: '/candidate/fair', icon: HomeIcon },
                { name: 'My Apps', to: '/candidate/processes', icon: DocumentCheckIcon },
                { name: 'Profile', to: '/candidate/profile', icon: UserIcon },
            ]
        }

        return []
    }

    const navItems = getNavItems()

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-sic-ice">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-sic-steel">SIC</h1>
                    <p className="text-xs text-gray-500">High-Trust Recruitment</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.to}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                location.pathname === item.to
                                    ? "bg-sic-steel text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center mb-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-sic-steel/10 flex items-center justify-center text-sic-steel font-bold text-xs">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                {user?.email}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-sic-rejected hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-20 md:pb-0">
                <Outlet />
            </main>

            {/* Bottom Tab Bar (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.to}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 w-full h-full",
                                location.pathname === item.to
                                    ? "text-sic-steel"
                                    : "text-gray-400 hover:text-gray-500"
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => signOut()}
                        className="flex flex-col items-center justify-center p-2 w-full h-full text-sic-rejected"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        <span className="text-[10px] mt-1 font-medium">Exit</span>
                    </button>
                </div>
            </nav>
        </div>
    )
}
