import { useRef, useState } from 'react'
import { UserCircleIcon, DocumentIcon, PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth.tsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { candidateService } from '@/services/candidate.service'
import { API_BASE_URL } from '@/services/api'

export default function Profile() {
    const { signOut } = useAuth()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isEditing, setIsEditing] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        phone: '',
        experience: ''
    })

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['candidate', 'profile'],
        queryFn: candidateService.getProfile,
    })

    // Update form data when profile loads or editing starts
    const startEditing = () => {
        if (profile) {
            setFormData({
                phone: profile.phone || '',
                experience: profile.experience || ''
            })
        }
        setIsEditing(true)
    }

    // Upload CV Mutation
    const uploadCvMutation = useMutation({
        mutationFn: candidateService.uploadCV,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidate', 'profile'] })
            alert('CV Uploaded Successfully!')
        },
        onError: () => alert('Failed to upload CV')
    })

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: candidateService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidate', 'profile'] })
            setIsEditing(false)
        },
        onError: () => alert('Failed to update profile')
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadCvMutation.mutate(file)
        }
    }

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({
            phone: formData.phone,
            experience: formData.experience
        })
    }

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading profile...</div>

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <p className="text-red-500 mb-4">Error loading profile. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
    )

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-4 py-8 border-b border-gray-200 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <UserCircleIcon className="w-16 h-16" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-500 text-sm capitalize">{profile.id.toUpperCase()}</p>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-4">

                {/* CV Section */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Resume / CV</h3>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sic-steel"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadCvMutation.isPending}
                            >
                                {uploadCvMutation.isPending ? 'Uploading...' : 'Update'}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 flex items-center">
                        <DocumentIcon className="w-8 h-8 text-red-500 mr-3" />
                        <div className="flex-1">
                            {profile.cv_url ? (
                                <a
                                    href={profile.cv_url.startsWith('http') ? profile.cv_url : `${API_BASE_URL}${profile.cv_url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                >
                                    {profile.cv_filename || 'View Resume'}
                                </a>
                            ) : (
                                <p className="text-sm font-medium text-gray-900">No CV Uploaded</p>
                            )}
                            <p className="text-xs text-gray-500">
                                {profile.cv_url ? 'Ready for review' : 'Please upload your CV'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Personal Details */}
                <Card className="p-0">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Personal Details</h3>
                        {!isEditing ? (
                            <Button variant="ghost" size="sm" onClick={startEditing}>
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleSaveProfile()} disabled={updateProfileMutation.isPending}>
                                    <CheckIcon className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                    <XMarkIcon className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                            <div className="mt-1 text-sm text-gray-900">{profile.full_name}</div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                            <div className="mt-1 text-sm text-gray-900">{profile.email}</div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 234 567 8900"
                                    className="mt-1 h-8 text-sm"
                                />
                            ) : (
                                <div className="mt-1 text-sm text-gray-900">{profile.phone || '-'}</div>
                            )}
                        </div>

                        {/* Experience Field */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Experience</label>
                            {isEditing ? (
                                <Input
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g. 5 Years (Python)"
                                    className="mt-1 h-8 text-sm"
                                />
                            ) : (
                                <div className="mt-1 text-sm text-gray-900">{profile.experience || '-'}</div>
                            )}
                        </div>
                    </div>
                </Card>

                <Button
                    variant="secondary"
                    fullWidth
                    className="text-red-600 hover:bg-red-50 mt-8"
                    onClick={() => signOut()}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
