/**
 * Format verification score as percentage
 * @param score - Score from 0 to 100
 * @returns Formatted string like "95% Verified"
 */
export function formatScore(score: number): string {
    return `${Math.round(score)}% Verified`
}

/**
 * Format date in readable format
 * @param date - ISO date string or Date object
 * @returns Formatted date like "Jan 23, 2026"
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length).trim() + '...'
}

/**
 * Generate SIC code from candidate ID
 * @param id - Candidate ID
 * @returns SIC code like "SIC-88"
 */
export function generateSICCode(id: number): string {
    return `SIC-${id}`
}
