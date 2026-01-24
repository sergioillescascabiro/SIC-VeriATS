
import {
    CheckCircleIcon,
    ClockIcon,
    DocumentArrowUpIcon,
    EyeIcon
} from '@heroicons/react/24/solid'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const steps = [
    {
        id: 1,
        name: 'CV Uploaded',
        desc: 'You uploaded your CV on Jan 20',
        status: 'completed',
        icon: DocumentArrowUpIcon
    },
    {
        id: 2,
        name: 'In Review',
        desc: 'Admin is validating your claims',
        status: 'current',
        icon: ClockIcon
    },
    {
        id: 3,
        name: 'Verified',
        desc: 'Skills confirmed based on evidence',
        status: 'upcoming',
        icon: CheckCircleIcon
    },
    {
        id: 4,
        name: 'Visible',
        desc: 'Companies can see your blind profile',
        status: 'upcoming',
        icon: EyeIcon
    },
]

export default function StatusTracker() {
    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Application Status</h1>

            <Card>
                <div className="relative pl-4 py-2">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-gray-200 -z-10" />

                    <div className="space-y-8">
                        {steps.map((step) => (
                            <div key={step.id} className="relative flex items-start group">
                                {/* Icon */}
                                <span className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full bg-white ring-4 ring-white",
                                    step.status === 'completed' && "text-sic-verified",
                                    step.status === 'current' && "text-sic-steel animate-pulse",
                                    step.status === 'upcoming' && "text-gray-300"
                                )}>
                                    <step.icon className="w-6 h-6" />
                                </span>

                                {/* Content */}
                                <div className="ml-4 min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                        {step.name}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Button fullWidth>
                        Update Evidence
                    </Button>
                </div>
            </Card>
        </div>
    )
}
