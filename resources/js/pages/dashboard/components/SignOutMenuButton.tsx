import { router } from '@inertiajs/react';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { localApiBaseUrl } from '@/api/local.api';

export function SignOutMenuButton() {
    return (
        <ListItem className="p-0!">
            <ListItemButton
                onClick={() =>
                    router.get(`${localApiBaseUrl}/api/auth/sign-out`)
                }
                className='lg:text-slate-100!'
            >
                <ListItemIcon className='text-inherit!'>
                    <MeetingRoomIcon />
                </ListItemIcon>
                <ListItemText primary="Sair" />
            </ListItemButton>
        </ListItem>
    );
}
