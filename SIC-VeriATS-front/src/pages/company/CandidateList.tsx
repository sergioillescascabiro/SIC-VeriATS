import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { companyService } from '@/services/company.service'
import Card, { CardContent } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ArrowDownTrayIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function SelectedCandidates() {
    const params = useParams({ strict: false })
    const jobId = (params as any).jobId

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['company', 'job', jobId, 'candidates'],
        queryFn: () => companyService.getJobCandidates(Number(jobId)),
        enabled: !!jobId
    })

    const handleDownloadCV = async (blindCode: string) => {
        try {
            const blob = await companyService.downloadCV(blindCode)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${blindCode}_resume.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Failed to download CV:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Selected Candidates</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Anonymized profiles of candidates who have been verified for this position
                </p>
            </div>

            {/* Candidates Grid */}
            {!candidates || candidates.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No candidates selected yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <Card key={candidate.blind_code} className="hover:border-sic-steel/30 transition-colors group">
                            <CardContent className="p-0">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <Avatar sicCode={candidate.blind_code} score={candidate.score} />
                                    <Badge variant={
                                        candidate.score > 80 ? 'verified' :
                                            candidate.score > 50 ? 'pending' : 'rejected'
                                    }>
                                        {candidate.score}% Match
                                    </Badge>
                                </div>

                                {/* Blind Code */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Candidate ID</p>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-sic-steel transition-colors">
                                        {candidate.blind_code}
                                    </h3>
                                </div>

                                {/* Experience */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{candidate.years_of_experience}</span> years of experience
                                    </p>
                                </div>

                                {/* Skills */}
                                {candidate.skills && (
                                    <div className="mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.split(',').slice(0, 5).map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="mb-4">
                                    <Badge variant="verified">{candidate.application_status}</Badge>
                                </div>

                                {/* Actions */}
                                <Button
                                    fullWidth
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleDownloadCV(candidate.blind_code)}
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                    Download CV
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
