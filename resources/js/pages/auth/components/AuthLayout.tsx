import { createTheme, ThemeProvider } from '@mui/material';
import { ReactNode } from 'react';

const theme = createTheme({
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

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <main className="flex flex-col items-center h-dvh p-8">{children}</main>
        </ThemeProvider>
    );
}
