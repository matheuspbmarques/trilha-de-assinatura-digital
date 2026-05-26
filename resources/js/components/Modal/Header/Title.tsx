import type { HTMLAttributes } from 'react';

export function Title({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <h2 {...props} className={`text-xl font-bold ${className}`} />;
}
