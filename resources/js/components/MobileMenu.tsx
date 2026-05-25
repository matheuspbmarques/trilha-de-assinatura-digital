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
import { MenuItem } from './layouts/dashboard/DashboardLayout';
import { SignOutMenuButton } from './SignOutMenuButton';

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
            <AppBar className="items-end lg:hidden!" sx={{ position: 'static' }}>
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
                <SignOutMenuButton />
            </Drawer>
        </>
    );
}
