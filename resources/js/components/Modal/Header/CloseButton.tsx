import { IconButton, IconButtonProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export function CloseButton({ className, ...props }:IconButtonProps) {
    return (
        <IconButton {...props} className={`bg-red-700! ${className}`}>
            <CloseIcon />
        </IconButton>
    );
}
