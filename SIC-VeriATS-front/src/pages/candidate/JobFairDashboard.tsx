import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import CompanyRow from '@/components/fair/CompanyRow'
import VacancyCard from '@/components/fair/VacancyCard'
import { Company, JobVacancy } from '@/types/fair'
import { useNavigate } from '@tanstack/react-router'

// Mock Data
const MOCK_COMPANIES: Company[] = [
    { id: '1', name: 'TechGlobal Inc.', vacancy_count: 5, description: 'Leading global tech solutions' },
    { id: '2', name: 'FinServe Bank', vacancy_count: 3, description: 'Modern banking for everyone' },
    { id: '3', name: 'GreenEnergy Co.', vacancy_count: 8, description: 'Sustainable energy future' },
    { id: '4', name: 'AutoMotive Group', vacancy_count: 12, description: 'Next-gen electric vehicles' },
]

const MOCK_VACANCIES: Record<string, JobVacancy[]> = {
    '1': [
        { id: 'v1', company_id: '1', title: 'Senior Backend Engineer', location: 'Remote', type: 'Full-time', category: 'Engineering', description: '', requirements: [], status: 'available' },
        { id: 'v2', company_id: '1', title: 'Product Manager', location: 'New York', type: 'Full-time', category: 'Product', description: '', requirements: [], status: 'applied' },
    ],
    '2': [
        { id: 'v3', company_id: '2', title: 'Data Analyst', location: 'London', type: 'Contract', category: 'Data', description: '', requirements: [], status: 'available' },
    ]
}

export default function JobFairDashboard() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

    const filteredCompanies = MOCK_COMPANIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleCompanyClick = (company: Company) => {
        setSelectedCompany(company)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBack = () => {
        setSelectedCompany(null)
    }

    const handleVacancyClick = (vacancyId: string) => {
        navigate({ to: '/candidate/vacancy/$id', params: { id: vacancyId } } as any)
    }

    // View: Company List
    if (!selectedCompany) {
        return (
            <div className="p-4 pb-20 max-w-2xl mx-auto min-h-screen bg-gray-50">
                <div className="mb-6 sticky top-0 bg-gray-50 pt-2 pb-2 z-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Fair 2026</h1>
                    <p className="text-sm text-gray-500 mb-4">Find your next opportunity among top employers.</p>

                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sic-steel focus:border-transparent outline-none transition-shadow"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredCompanies.map(company => (
                        <CompanyRow
                            key={company.id}
                            company={company}
                            onClick={() => handleCompanyClick(company)}
                        />
                    ))}

                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No companies found matching "{search}"</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // View: Company Detail (Vacancies)
    const vacancies = MOCK_VACANCIES[selectedCompany.id] || []

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Heavy Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="p-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Companies
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">{selectedCompany.description}</p>
                        </div>
                        {/* Logo placeholder */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <span className="text-lg font-bold">{selectedCompany.name[0]}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs or Filters could go here */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {vacancies.length} Active Positions
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {vacancies.length > 0 ? (
                    vacancies.map(vacancy => (
                        <VacancyCard
                            key={vacancy.id}
                            vacancy={vacancy}
                            onViewDetail={() => handleVacancyClick(vacancy.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400">No active vacancies for this company.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
