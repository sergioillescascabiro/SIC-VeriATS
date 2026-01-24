import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import {
    CheckCircleIcon,
    ClockIcon,
    DocumentArrowUpIcon
} from '@heroicons/react/24/solid'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

// Mock Data for a single process
const MOCK_PROCESS = {
    id: 'a1',
    company: 'TechGlobal Inc.',
    position: 'Senior Backend Engineer',
    applied_at: 'Jan 20, 2026',
    status: 'review',
    requirements: [
        { name: '5+ years Python', checked: true, justification: 'Worked at Google for 6 years' },
        { name: 'AWS Experience', checked: true, justification: '' },
        { name: 'Microservices', checked: true, justification: 'Designed notification service' },
    ],
    history: [
        { id: 1, name: 'Application Sent', date: 'Jan 20, 10:00 AM', status: 'completed', icon: DocumentArrowUpIcon },
        { id: 2, name: 'In Review', date: 'Currently in progress', status: 'current', icon: ClockIcon },
        { id: 3, name: 'Selected', date: 'Pending', status: 'upcoming', icon: CheckCircleIcon },
    ]
}

export default function ProcessDetail() {
    const process = MOCK_PROCESS

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="p-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Applications
                    </button>

                    <h1 className="text-xl font-bold text-gray-900">{process.position}</h1>
                    <p className="text-sic-steel font-medium">{process.company}</p>
                </div>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-6">

                {/* Status History */}
                <Card title="Application History">
                    <div className="relative pl-4 py-2">
                        <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-gray-200 -z-10" />
                        <div className="space-y-8">
                            {process.history.map((step) => (
                                <div key={step.id} className="relative flex items-start group">
                                    <span className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full bg-white ring-4 ring-white",
                                        step.status === 'completed' && "text-sic-verified",
                                        step.status === 'current' && "text-sic-steel animate-pulse",
                                        step.status === 'upcoming' && "text-gray-300"
                                    )}>
                                        <step.icon className="w-6 h-6" />
                                    </span>
                                    <div className="ml-4 min-w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-900">{step.name}</div>
                                        <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Requirements Summary */}
                <Card title="Requirements Submitted">
                    <div className="space-y-4">
                        {process.requirements.map((req, idx) => (
                            <div key={idx} className="flex flex-col">
                                <div className="flex items-center">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <CheckCircleIcon className="w-3.5 h-3.5 text-green-700" />
                                    </div>
                                    <span className="text-sm text-gray-900 font-medium">{req.name}</span>
                                </div>
                                {req.justification && (
                                    <p className="ml-8 mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                        "{req.justification}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Action / Context */}
                <div className="text-center">
                    <Badge variant={process.status === 'review' ? 'pending' : 'neutral'}>
                        Application ID: {process.id.toUpperCase()}
                    </Badge>
                </div>

            </div>
        </div>
    )
}
