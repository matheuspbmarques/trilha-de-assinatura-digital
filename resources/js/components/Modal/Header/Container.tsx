import { HTMLAttributes } from 'react';

export function Container({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return <header {...props} className={`flex justify-between items-center ${className}`} />;
}
