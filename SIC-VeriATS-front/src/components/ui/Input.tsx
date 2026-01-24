import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
        const inputId = props.id || props.name

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                    </label>
                )}

                <input
                    type={type}
                    ref={ref}
                    id={inputId}
                    className={cn(
                        // Base styles
                        'w-full px-4 py-3 text-base rounded-lg border transition-colors duration-150',
                        'min-h-touch', // Mobile-first: 48px minimum height
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        // States
                        error
                            ? 'border-sic-rejected text-sic-rejected focus:border-sic-rejected focus:ring-sic-rejected/20'
                            : 'border-gray-300 text-gray-900 focus:border-sic-steel focus:ring-sic-steel/20',
                        // Disabled
                        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                        className
                    )}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-2 text-sm text-sic-rejected"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
