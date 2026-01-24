/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'sic-steel': '#0F4C81',      // Primary brand (Azure Slate)
                'sic-ice': '#F8FAFC',        // Background tint
                'sic-verified': '#065F46',   // Forest Green (muted)
                'sic-rejected': '#991B1B',   // Brick Red (muted)
                'sic-pending': '#64748B',    // Neutral Gray
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            minHeight: {
                'touch': '48px',  // Minimum touch target
            },
            minWidth: {
                'touch': '48px',
            },
        },
    },
    plugins: [],
}
