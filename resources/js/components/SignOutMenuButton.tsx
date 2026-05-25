import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { router } from '@inertiajs/react';
import { localApiBaseUrl } from '@/api/local.api';

export function SignOutMenuButton() {
    return (
        <ListItem>
            <ListItemButton
                onClick={() =>
                    router.get(`${localApiBaseUrl}/api/auth/sign-out`)
                }
            >
                <ListItemIcon>
                    <MeetingRoomIcon />
                </ListItemIcon>
                <ListItemText primary="Sair" className='lg:text-slate-100' />
            </ListItemButton>
        </ListItem>
    );
}
