import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { DocumentMagnifyingGlassIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// Placeholder for CV Viewer
const CVViewer = () => (
    <div className="h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
            <DocumentMagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">CV Preview</p>
            <p className="text-xs text-gray-400 mt-1">PDF rendering will appear here</p>
        </div>
    </div>
)

// Placeholder for Claims List
const ClaimsList = () => {
    const claims = [
        { id: 1, skill: 'Python', status: 'pending' },
        { id: 2, skill: 'React', status: 'validated' },
        { id: 3, skill: 'AWS', status: 'pending' },
        { id: 4, skill: 'Docker', status: 'rejected' },
    ]

    return (
        <div className="space-y-4">
            {claims.map((claim) => (
                <Card key={claim.id} className="flex items-center justify-between p-4">
                    <div>
                        <span className="font-semibold text-gray-900">{claim.skill}</span>
                        <span className={cn(
                            "ml-3 text-xs px-2 py-0.5 rounded-full font-medium",
                            claim.status === 'validated' && "bg-green-100 text-green-700",
                            claim.status === 'rejected' && "bg-red-100 text-red-700",
                            claim.status === 'pending' && "bg-gray-100 text-gray-600"
                        )}>
                            {claim.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {claim.status === 'pending' && (
                            <>
                                <Button size="sm" variant="ghost" className="text-sic-verified hover:bg-green-50">
                                    Verify
                                </Button>
                                <Button size="sm" variant="ghost" className="text-sic-rejected hover:bg-red-50">
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default function ValidationDashboard() {
    const [selectedTab, setSelectedTab] = useState(0)

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Validation Gateway</h1>
                    <p className="text-sm text-gray-500">Candidate: SIC-88 (Software Engineer)</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm">Skip</Button>
                    <Button size="sm">Final Decision</Button>
                </div>
            </header>

            {/* Mobile Tabs */}
            <div className="md:hidden flex-1 flex flex-col">
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex border-b border-gray-200 bg-white">
                        <Tab
                            className={({ selected }) =>
                                cn(
                                    'w-1/2 py-3 text-sm font-medium leading-5',
                                    'focus:outline-none focus:ring-0',
                                    selected
                                        ? 'text-sic-steel border-b-2 border-sic-steel'
                                        : 'text-gray-500 hover:text-gray-700'
                                )
                            }
                        >
                            CV Document
                        </Tab>
                        <Tab
                            className={({ selected }) =>
                                cn(
                                    'w-1/2 py-3 text-sm font-medium leading-5',
                                    'focus:outline-none focus:ring-0',
                                    selected
                                        ? 'text-sic-steel border-b-2 border-sic-steel'
                                        : 'text-gray-500 hover:text-gray-700'
                                )
                            }
                        >
                            Claims (4)
                        </Tab>
                    </Tab.List>
                    <Tab.Panels className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                        <Tab.Panel className="h-full"><CVViewer /></Tab.Panel>
                        <Tab.Panel className="h-full"><ClaimsList /></Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>

            {/* Desktop Split View */}
            <div className="hidden md:flex flex-1 overflow-hidden">
                {/* Left: CV */}
                <div className="w-1/2 p-6 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-2" />
                        Source Document
                    </h2>
                    <div className="h-[calc(100%-2rem)]">
                        <CVViewer />
                    </div>
                </div>

                {/* Right: Claims */}
                <div className="w-1/2 p-6 bg-white overflow-y-auto">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                        Claims to Validate
                    </h2>
                    <ClaimsList />
                </div>
            </div>
        </div>
    )
}
