import { ButtonProps, Button } from '@mui/material';

export function IconButton({ className, ...props }: ButtonProps) {
    return (
        <Button
            variant="contained"
            {...props}
            className={`min-w-0! rounded-full! p-2! ${className}`}
        />
    );
}
