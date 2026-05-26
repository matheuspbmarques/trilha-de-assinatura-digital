import CloseIcon from '@mui/icons-material/Close';
import type { ButtonProps } from '@mui/material';
import { IconButton } from '@/components/IconButton';

export function CloseButton({ ...props }: ButtonProps) {
    return (
        <IconButton color='error' {...props}>
            <CloseIcon />
        </IconButton>
    );
}
