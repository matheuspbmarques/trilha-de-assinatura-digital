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
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PeopleIcon from '@mui/icons-material/People';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { router } from '@inertiajs/react';
import { localApiBaseUrl } from '@/api/local.api';

export default function MenuHeader() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    return (
        <>
            <AppBar className="lg:hidden! items-end">
                <Toolbar>
                    <IconButton onClick={() => setShowMenu(true)}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer open={showMenu} onClose={() => setShowMenu(false)} anchor='right'>
                <List className="flex-1">
                    <ListItem className="px-0!">
                        <ListItemButton>
                            <ListItemIcon>
                                <HomeFilledIcon />
                            </ListItemIcon>
                            <ListItemText primary="Início" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem className="px-0!">
                        <ListItemButton>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Signatários" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem className="px-0!">
                        <ListItemButton>
                            <ListItemIcon>
                                <FilePresentIcon />
                            </ListItemIcon>
                            <ListItemText primary="Processos" />
                        </ListItemButton>
                    </ListItem>
                </List>
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
