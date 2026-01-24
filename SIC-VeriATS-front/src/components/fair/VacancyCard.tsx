import { BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { JobVacancy } from '@/types/fair'

interface VacancyCardProps {
    vacancy: JobVacancy
    onViewDetail: () => void
}

export default function VacancyCard({ vacancy, onViewDetail }: VacancyCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-sic-steel/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{vacancy.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <BriefcaseIcon className="w-3 h-3 mr-1" />
                        {vacancy.category}
                    </p>
                </div>
                {vacancy.status === 'applied' && (
                    <Badge variant="verified" size="sm">Applied</Badge>
                )}
            </div>

            <div className="flex items-center text-xs text-gray-400 mb-4">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {vacancy.location} • {vacancy.type}
            </div>

            <Button
                variant={vacancy.status === 'applied' ? 'ghost' : 'secondary'}
                size="sm"
                fullWidth
                onClick={onViewDetail}
            >
                {vacancy.status === 'applied' ? 'View Application' : 'View Details'}
            </Button>
        </div>
    )
}
