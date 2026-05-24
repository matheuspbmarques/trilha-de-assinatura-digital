import { createInertiaApp } from '@inertiajs/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const queryClient = new QueryClient();
const muiTheme = createTheme({
    colorSchemes: {
        dark: {
            palette: {
                divider: '#45556c',
                primary: {
                    main: '#f1f5f9',
                },
            },
        },
    },
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    withApp(app) {
        return (
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={muiTheme}>{app}</ThemeProvider>
            </QueryClientProvider>
        );
    },
});
