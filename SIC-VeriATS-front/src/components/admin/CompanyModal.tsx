import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { adminService, type CompanyCreateData, type CompanyUpdateData } from '@/services/adminService'
import type { AdminCompany } from '@/types/admin'

interface CompanyModalProps {
    isOpen: boolean
    onClose: () => void
    company?: AdminCompany // If provided, we are in EDIT mode
}

export default function CompanyModal({ isOpen, onClose, company }: CompanyModalProps) {
    const queryClient = useQueryClient()
    const isEdit = !!company

    const [formData, setFormData] = useState<Partial<CompanyCreateData>>({
        company_name: '',
        email: '',
        password: '',
        company_description: '',
        company_industry: '',
        company_website: '',
        is_sponsor: false
    })

    const [error, setError] = useState<string | null>(null)

    // Reset/Load form data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (company) {
                setFormData({
                    company_name: company.company_name,
                    email: company.email,
                    company_description: company.company_description || '',
                    company_industry: company.company_industry || '',
                    company_website: company.company_website || '',
                    is_sponsor: company.is_sponsor,
                    password: '' // Keep empty in edit mode
                })
            } else {
                setFormData({
                    company_name: '',
                    email: '',
                    password: '',
                    company_description: '',
                    company_industry: '',
                    company_website: '',
                    is_sponsor: false
                })
            }
            setError(null)
        }
    }, [isOpen, company])

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminService.createCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies-global'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
            onClose()
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error creating company')
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: CompanyUpdateData) => adminService.updateCompany(company!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies-global'] })
            onClose()
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error updating company')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (isEdit) {
            const updateData: CompanyUpdateData = {
                company_name: formData.company_name,
                email: formData.email,
                company_description: formData.company_description,
                company_industry: formData.company_industry,
                company_website: formData.company_website,
                is_sponsor: formData.is_sponsor
            }
            updateMutation.mutate(updateData)
        } else {
            // Validation
            if (!formData.password) {
                setError('Password is required for new companies')
                return
            }
            createMutation.mutate(formData as CompanyCreateData)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

        setFormData(prev => ({
            ...prev,
            [name]: val
        }))
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Company' : 'New Company'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Tech Solutions Inc."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="hr@company.com"
                    />
                    {!isEdit && (
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Industry"
                        name="company_industry"
                        value={formData.company_industry}
                        onChange={handleChange}
                        placeholder="e.g. Technology, Finance..."
                    />
                    <Input
                        label="Website"
                        name="company_website"
                        value={formData.company_website}
                        onChange={handleChange}
                        placeholder="https://company.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="company_description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sic-steel focus:border-sic-steel"
                        rows={3}
                        value={formData.company_description}
                        onChange={handleChange}
                        placeholder="Briefly describe the company..."
                    />
                </div>

                <div className="flex items-center gap-2 py-2">
                    <input
                        id="is_sponsor"
                        name="is_sponsor"
                        type="checkbox"
                        checked={formData.is_sponsor}
                        onChange={handleChange}
                        className="h-4 w-4 text-sic-steel border-gray-300 rounded focus:ring-sic-steel"
                    />
                    <label htmlFor="is_sponsor" className="text-sm font-medium text-gray-700">
                        Sponsor Company
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        {isEdit ? 'Save Changes' : 'Create Company'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
