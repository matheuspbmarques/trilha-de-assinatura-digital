import {
    AppBar,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { router } from '@inertiajs/react';
import { localApiBaseUrl } from '@/api/local.api';
import { MenuItem } from './layouts/dashboard/DashboardLayout';

export default function MobileMenu({
    menuItems,
}: {
    menuItems: Array<MenuItem>;
}) {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const renderMenuItems = menuItems.map(({ icon, text, route }, index) => {
        return (
            <ListItem key={index} className="px-0!">
                <ListItemButton>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
        );
    });

    return (
        <>
            <AppBar className="items-end lg:hidden!">
                <Toolbar>
                    <IconButton onClick={() => setShowMenu(true)}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                open={showMenu}
                onClose={() => setShowMenu(false)}
                anchor="right"
            >
                <List className="flex-1">{renderMenuItems}</List>
                <ListItem>
                    <ListItemButton
                        onClick={() =>
                            router.get(`${localApiBaseUrl}/api/auth/sign-out`)
                        }
                    >
                        <ListItemIcon>
                            <MeetingRoomIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sair" />
                    </ListItemButton>
                </ListItem>
            </Drawer>
        </>
    );
}
