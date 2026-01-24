import { useState } from 'react'
import { CheckCircleIcon, ArrowLeftIcon, DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// Mock Data
const MOCK_VACANCY_DETAIL = {
    id: 'v1',
    company_id: '1',
    company_name: 'TechGlobal Inc.',
    title: 'Senior Backend Engineer',
    description: 'We are looking for a Python expert to lead our backend modernization efforts.',
    requirements: [
        '5+ years of experience with Python/Django',
        'Experience with AWS or Azure',
        'Knowledge of Microservices architecture',
        'English proficiency (B2+)',
    ]
}

export default function VacancyDetail() {

    // In a real app, use useParams() to fetch data
    const vacancy = MOCK_VACANCY_DETAIL

    const [checkedReqs, setCheckedReqs] = useState<Record<number, boolean>>({})
    const [justifications, setJustifications] = useState<Record<number, string>>({})
    const [selectedCV, setSelectedCV] = useState('cv1') // 'cv1' or 'upload'
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleToggleReq = (idx: number) => {
        setCheckedReqs(prev => ({ ...prev, [idx]: !prev[idx] }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))
        setIsSubmitting(false)
        setIsSuccess(true)
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    You have successfully applied to <strong>{vacancy.title}</strong> at {vacancy.company_name}.
                </p>
                <Button onClick={() => window.history.back()} fullWidth>
                    Return to Fair
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-3"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back
                </button>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{vacancy.title}</h1>
                <p className="text-sic-steel font-medium text-sm mt-1">{vacancy.company_name}</p>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6">

                {/* Description */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About the Role</h3>
                    <p className="text-gray-600 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                        {vacancy.description}
                    </p>
                </section>

                {/* Requirements Checklist */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Requirements</h3>
                    <p className="text-xs text-gray-500 mb-3">Please confirm you meet the requirements.</p>

                    <div className="space-y-3">
                        {vacancy.requirements.map((req, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "bg-white border rounded-xl p-4 transition-all",
                                    checkedReqs[idx] ? "border-sic-verified ring-1 ring-sic-verified" : "border-gray-200"
                                )}
                            >
                                <label className="flex items-start cursor-pointer">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={!!checkedReqs[idx]}
                                            onChange={() => handleToggleReq(idx)}
                                            className="w-5 h-5 text-sic-verified border-gray-300 rounded focus:ring-sic-verified"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <span className={cn("text-gray-900 font-medium", checkedReqs[idx] && "text-sic-verified")}>
                                            {req}
                                        </span>
                                    </div>
                                </label>

                                {checkedReqs[idx] && (
                                    <div className="mt-3 ml-8 animate-in slide-in-from-top-2 duration-200">
                                        <textarea
                                            placeholder="Optional: Add a brief justification (e.g., '5 years working with Django at XYZ Corp')"
                                            className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sic-steel/20 focus:border-sic-steel outline-none min-h-[80px]"
                                            value={justifications[idx] || ''}
                                            onChange={(e) => setJustifications(prev => ({ ...prev, [idx]: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* CV Selection */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Resume / CV</h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                        <label className="flex items-center p-4 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="cv_option"
                                value="cv1"
                                checked={selectedCV === 'cv1'}
                                onChange={() => setSelectedCV('cv1')}
                                className="w-4 h-4 text-sic-steel"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center text-sm font-medium text-gray-900">
                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
                                    My_Resume_2025.pdf
                                </div>
                                <p className="text-xs text-gray-500 ml-7">Uploaded on Jan 15, 2026</p>
                            </div>
                        </label>

                        <label className="flex items-center p-4 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="cv_option"
                                value="upload"
                                checked={selectedCV === 'upload'}
                                onChange={() => setSelectedCV('upload')}
                                className="w-4 h-4 text-sic-steel"
                            />
                            <div className="ml-3 flex-1 flex items-center text-sm text-gray-600">
                                <CloudArrowUpIcon className="w-5 h-5 mr-2 text-gray-400" />
                                Upload a new CV
                            </div>
                        </label>
                    </div>
                </section>

            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:pl-64 z-20">
                <div className="max-w-2xl mx-auto">
                    <Button
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        onClick={handleSubmit}
                        disabled={Object.keys(checkedReqs).length < vacancy.requirements.length}
                    >
                        Submit Application
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-2">
                        By applying, you agree to share your profile with {vacancy.company_name}.
                    </p>
                </div>
            </div>
        </div>
    )
}
