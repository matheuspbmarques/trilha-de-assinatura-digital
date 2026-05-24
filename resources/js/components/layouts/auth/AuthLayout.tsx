import { HTMLAttributes } from 'react';

export default function AuthLayout({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <main
            {...props}
            className={`bg flex min-h-dvh flex-col items-center justify-center p-6 lg:flex-row lg:gap-16 ${className}`}
        />
    );
}
