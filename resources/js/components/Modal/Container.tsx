import type { ModalProps } from '@mui/material';
import { Modal } from '@mui/material';

type TContainer = {
    open: boolean;
} & ModalProps;

export function Container({ open, className, ...props }: TContainer) {
    return <Modal {...props} open={open} className={`p-6! flex items-center justify-center ${className}`} />;
}
