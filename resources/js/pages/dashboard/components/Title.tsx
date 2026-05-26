import type { HTMLAttributes } from 'react';

export function Title({
    className,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) {
    return <h1 {...props} className={`text-3xl font-bold ${className}`} />;
}
