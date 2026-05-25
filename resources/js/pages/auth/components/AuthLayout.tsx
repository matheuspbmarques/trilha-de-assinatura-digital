import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="flex h-dvh flex-col items-center p-8">{children}</main>
    );
}
