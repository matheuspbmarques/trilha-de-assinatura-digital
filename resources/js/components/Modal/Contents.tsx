import { HTMLAttributes } from 'react';

export function Contents({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={`bg-slate-100 p-4 w-full max-w-xl flex flex-col gap-8 ${className}`} />;
}
