import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'verified' | 'pending' | 'rejected' | 'neutral' | 'success' | 'warning' | 'default' | 'secondary' | 'sponsor'
    size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center font-medium rounded-full'

        const variants = {
            verified: 'bg-sic-verified/10 text-sic-verified border border-sic-verified/20',
            rejected: 'bg-sic-rejected/10 text-sic-rejected border border-sic-rejected/20',
            pending: 'bg-sic-pending/10 text-sic-pending border border-sic-pending/20',
            neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
            success: 'bg-green-100 text-green-700 border border-green-200',
            warning: 'bg-orange-100 text-orange-700 border border-orange-200',
            default: 'bg-gray-100 text-gray-700 border border-gray-200',
            secondary: 'bg-gray-200 text-gray-600 border border-gray-300',
            sponsor: 'bg-blue-100 text-blue-700 border border-blue-200',
        }

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-3 py-1 text-sm',
        }

        return (
            <span
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </span>
        )
    }
)

Badge.displayName = 'Badge'

export default Badge
