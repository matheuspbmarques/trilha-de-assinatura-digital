import { IconButton } from '@/components/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonProps } from '@mui/material';

export function CloseButton({ ...props }: ButtonProps) {
    return (
        <IconButton color='error' {...props}>
            <CloseIcon />
        </IconButton>
    );
}
