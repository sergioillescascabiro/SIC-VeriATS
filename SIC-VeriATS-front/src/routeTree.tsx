import {
    createRootRoute,
    createRoute,
    Outlet
} from '@tanstack/react-router'
import MainLayout from './components/layouts/MainLayout'
import Login from './pages/Login'

// Admin Pages
import ValidationDashboard from './pages/admin/ValidationDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCompanies from './pages/admin/AdminCompanies'
import AdminJobs from './pages/admin/AdminJobs'
import AdminCandidates from './pages/admin/AdminCandidates'
import AdminEvaluation from './pages/admin/AdminEvaluation'

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard'
import CompanyJobs from './pages/company/CompanyJobs'
import JobDetail from './pages/company/JobDetail'
import CandidateList from './pages/company/CandidateList'

// Job Fair Candidate Pages
import JobFairDashboard from './pages/candidate/JobFairDashboard'
import VacancyDetail from './pages/candidate/VacancyDetail'
import MyProcesses from './pages/candidate/MyProcesses'
import ProcessDetail from './pages/candidate/ProcessDetail'
import Profile from './pages/candidate/Profile'
import StatusTracker from './pages/candidate/StatusTracker'

// Root route (handles layout)
const rootRoute = createRootRoute({
    component: () => <Outlet />,
})

// Public routes
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
})

// Protected parent route (MainLayout)
const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'app',
    component: MainLayout,
})

// Admin routes
const adminDashboardRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/dashboard',
    component: AdminDashboard,
})

const adminCompaniesRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/companies',
    validateSearch: (search: Record<string, unknown>) => {
        return {
            status: (search.status as string) || undefined,
        }
    },
    component: AdminCompanies,
})

const adminJobsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/jobs',
    validateSearch: (search: Record<string, unknown>) => {
        return {
            company: (search.company as string) || undefined,
        }
    },
    component: AdminJobs,
})

const adminCompanyJobsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/companies/$companyId/jobs',
    component: AdminJobs, // Reuse AdminJobs, we will handle the param in the component
})

const adminCandidatesRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/candidates',
    component: AdminCandidates,
})

const adminEvaluationRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/evaluation',
    component: AdminEvaluation,
})

// Legacy admin validation route
const adminValidationRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/admin/validation',
    component: ValidationDashboard,
})

// Company routes
const companyDashboardRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/company/dashboard',
    component: CompanyDashboard,
})

const companyJobsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/company/jobs',
    component: CompanyJobs,
})

const companyJobDetailRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/company/jobs/$id',
    component: JobDetail,
})

const companyJobCandidatesRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/company/jobs/$jobId/candidates',
    component: CandidateList,
})

// Candidate routes (Job Fair)
const jobFairRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/fair',
    component: JobFairDashboard,
})

const vacancyDetailRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/vacancy/$id',
    component: VacancyDetail,
})

const myProcessesRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/processes',
    component: MyProcesses,
})

const processDetailRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/processes/$id',
    component: ProcessDetail,
})

const candidateProfileRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/profile',
    component: Profile,
})

const candidateStatusRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/candidate/status',
    component: StatusTracker,
})

// Default route (redirects to login for now)
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Login,
})

// Create route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    appRoute.addChildren([
        // Admin routes
        adminDashboardRoute,
        adminCompaniesRoute,
        adminJobsRoute,
        adminCompanyJobsRoute,
        adminCandidatesRoute,
        adminEvaluationRoute,
        adminValidationRoute,
        // Company routes
        companyDashboardRoute,
        companyJobsRoute,
        companyJobDetailRoute,
        companyJobCandidatesRoute,
        // Candidate routes
        jobFairRoute,
        vacancyDetailRoute,
        myProcessesRoute,
        processDetailRoute,
        candidateProfileRoute,
        candidateStatusRoute,
    ]),
])

export { routeTree }
