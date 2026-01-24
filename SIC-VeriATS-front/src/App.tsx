import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { routeTree } from './routeTree'
import { AuthProvider } from '@/hooks/useAuth.tsx'

const App = () => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: 1,
                    },
                },
            })
    )

    const history = createBrowserHistory()

    const router = createRouter({
        routeTree,
        history,
        context: {
            queryClient,
        },
        defaultPreload: 'intent',
    })

    // Simple error boundary
    try {
        return (
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </QueryClientProvider>
        )
    } catch (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Error Loading App</h1>
                <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
                <p>Check browser console (F12) for more details</p>
            </div>
        )
    }
}

export default App
