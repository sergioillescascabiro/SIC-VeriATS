import { useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth.tsx'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoggingIn, loginError } = useAuth()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        console.log('🔐 Login attempt:', { email, password: '***' })
        console.log('🔐 Login function:', typeof login)
        login({ email, password })
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-sic-steel mb-2">
                        SIC
                    </h1>
                    <p className="text-gray-600 text-sm">
                        High-Trust Blind Recruitment Platform
                    </p>
                </div>

                {/* Login Card */}
                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    inputMode="email"
                                />
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Error Message */}
                            {loginError && (
                                <div
                                    className="p-3 rounded-lg bg-sic-rejected/10 border border-sic-rejected/20 text-sic-rejected text-sm"
                                    role="alert"
                                >
                                    {loginError instanceof Error
                                        ? loginError.message
                                        : 'Invalid email or password'}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                isLoading={isLoggingIn}
                                disabled={!email || !password}
                            >
                                {isLoggingIn ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    Secure authentication powered by SIC-VeriATS
                </p>
            </div>
        </div>
    )
}
