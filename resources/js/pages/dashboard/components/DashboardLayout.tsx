import MobileMenu from './MobileMenu';
import { HTMLAttributes, ReactElement } from 'react';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PeopleIcon from '@mui/icons-material/People';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { SignOutMenuButton } from './SignOutMenuButton';
import { router } from '@inertiajs/react';

export type MenuItem = {
    icon: ReactElement;
    text: string;
    route: string;
};

const menuItems: Array<MenuItem> = [
    {
        icon: <HomeFilledIcon />,
        route: 'home',
        text: 'Início',
    },
    {
        icon: <PeopleIcon />,
        text: 'Signatários',
        route: 'signatarios',
    },
    {
        icon: <FilePresentIcon />,
        text: 'Processos',
        route: 'processos',
    },
];

export default function DashboardLayout({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const renderMenuItems = menuItems.map(({ icon, text, route }, index) => {
        return (
            <ListItem key={index} className="px-0!">
                <ListItemButton onClick={() => router.visit(route)}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={text} className="text-slate-100" />
                </ListItemButton>
            </ListItem>
        );
    });

    return (
        <Box
            component="div"
            {...props}
            className={`flex h-dvh flex-col lg:flex-row ${className}`}
        >
            <MobileMenu menuItems={menuItems} />
            <Box component="aside" className="flex flex-col max-lg:hidden">
                <List className="flex-1">{renderMenuItems}</List>
                <SignOutMenuButton />
            </Box>
            <main className="flex-1 bg-slate-100 p-6">{children}</main>
        </Box>
    );
}
