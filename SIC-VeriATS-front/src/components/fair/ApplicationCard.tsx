import { CalendarIcon, CheckCircleIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { Application } from '@/types/fair'
import { cn } from '@/utils/cn'

interface ApplicationCardProps {
    application: Application
    onViewDetail: () => void
}

export default function ApplicationCard({ application, onViewDetail }: ApplicationCardProps) {
    const getStatusConfig = (status: Application['status']) => {
        switch (status) {
            case 'selected':
                return { icon: CheckCircleIcon, text: 'Selected', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
            case 'review':
                return { icon: ClockIcon, text: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
            case 'sent':
            default:
                return { icon: PaperAirplaneIcon, text: 'Sent', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
        }
    }

    const config = getStatusConfig(application.status)
    const StatusIcon = config.icon

    return (
        <div className={cn("bg-white border rounded-xl p-0 overflow-hidden hover:shadow-sm transition-shadow", config.border)}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900">{application.vacancy_title}</h3>
                    <p className="text-sm text-gray-600">{application.company_name}</p>
                </div>
                <div className={cn("flex items-center px-2.5 py-1 rounded-full text-xs font-medium", config.bg, config.color)}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {config.text}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-gray-50/50">
                <div className="flex items-center text-xs text-gray-500 mb-4">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    Applied on {new Date(application.applied_at).toLocaleDateString()}
                </div>

                {application.status === 'selected' && (
                    <div className="mb-4 text-xs bg-green-50 text-green-700 p-3 rounded-lg border border-green-100">
                        <strong>Congratulations!</strong> You have been selected for this position. The company will contact you shortly details.
                    </div>
                )}

                <Button variant="secondary" size="sm" fullWidth onClick={onViewDetail}>
                    View Application Info
                </Button>
            </div>
        </div>
    )
}
