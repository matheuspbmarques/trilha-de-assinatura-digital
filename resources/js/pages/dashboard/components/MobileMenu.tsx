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
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { MenuItem } from './DashboardLayout';
import { SignOutMenuButton } from './SignOutMenuButton';
import { router } from '@inertiajs/react';

export default function MobileMenu({
    menuItems,
}: {
    menuItems: Array<MenuItem>;
}) {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const renderMenuItems = menuItems.map(({ icon, text, route }, index) => {
        return (
            <ListItem key={index} className="p-0!">
                <ListItemButton onClick={() => router.visit(route)}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
        );
    });

    return (
        <>
            <AppBar position="static" component="div" className='lg:hidden!'>
                <Toolbar>
                    <Typography variant="overline" sx={{ flex: 1 }}>
                        Trilha de Assinatura Digital
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => setShowMenu(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                open={showMenu}
                onClose={() => setShowMenu(false)}
                anchor="right"
            >
                <List className="flex-1 p-0!">{renderMenuItems}</List>
                <SignOutMenuButton />
            </Drawer>
        </>
    );
}
