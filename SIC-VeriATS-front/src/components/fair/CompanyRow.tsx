import { BuildingOfficeIcon } from '@heroicons/react/24/solid'
import Badge from '@/components/ui/Badge'
import { Company } from '@/types/fair'

interface CompanyRowProps {
    company: Company
    onClick: () => void
}

export default function CompanyRow({ company, onClick }: CompanyRowProps) {
    return (
        <div
            onClick={onClick}
            className="group flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-sic-steel/20 hover:shadow-sm transition-all cursor-pointer active:scale-[0.98] duration-200"
        >
            {/* Logo / Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-sic-steel group-hover:bg-sic-steel/5 transition-colors">
                {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                ) : (
                    <BuildingOfficeIcon className="w-7 h-7" />
                )}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-sic-steel transition-colors">
                    {company.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                    {company.vacancy_count} {company.vacancy_count === 1 ? 'open position' : 'open positions'}
                </p>
            </div>

            {/* Action */}
            <div className="ml-2 flex-shrink-0">
                <Badge variant="neutral" size="sm" className="group-hover:bg-sic-steel group-hover:text-white transition-colors">
                    View positions
                </Badge>
            </div>
        </div>
    )
}
