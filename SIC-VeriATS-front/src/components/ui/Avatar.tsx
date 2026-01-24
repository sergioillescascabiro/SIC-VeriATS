import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    sicCode?: string // e.g., "SIC-88"
    score?: number // 0-100
    size?: 'sm' | 'md' | 'lg'
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, sicCode, score = 0, size = 'md', ...props }, ref) => {
        // Generate background color based on score (red → yellow → green)
        const getScoreColor = (score: number): string => {
            if (score >= 80) return 'bg-sic-verified' // Green
            if (score >= 50) return 'bg-yellow-500' // Yellow
            return 'bg-sic-rejected' // Red
        }

        const sizes = {
            sm: 'h-10 w-10 text-sm',
            md: 'h-16 w-16 text-base',
            lg: 'h-24 w-24 text-lg',
        }

        const displayText = sicCode || 'SIC'

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-full text-white font-semibold',
                    getScoreColor(score),
                    sizes[size],
                    className
                )}
                aria-label={`Anonymous candidate ${sicCode || ''}`}
                {...props}
            >
                {displayText}
            </div>
        )
    }
)

Avatar.displayName = 'Avatar'

export default Avatar
