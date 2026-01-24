import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'flat' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'flat', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Base styles - minimalist flat design
                    'bg-white rounded-lg',
                    // Variant-specific
                    variant === 'flat' && 'border border-gray-200',
                    variant === 'elevated' && 'shadow-sm',
                    // Responsive padding (mobile-first)
                    'p-4 md:p-6',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

// Card subcomponents for better composition
export const CardHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('mb-4 pb-4 border-b border-gray-200', className)}
        {...props}
    />
))

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn('text-lg font-semibold text-gray-900', className)}
        {...props}
    />
))

CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-gray-700', className)} {...props} />
))

CardContent.displayName = 'CardContent'

export default Card
