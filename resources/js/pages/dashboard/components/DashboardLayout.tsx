import MobileMenu from './MobileMenu';
import { HTMLAttributes, ReactElement } from 'react';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PeopleIcon from '@mui/icons-material/People';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import {
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
            <ListItem key={index} className="p-0!">
                <ListItemButton onClick={() => router.visit(route)} className='text-slate-100!'>
                    <ListItemIcon className='text-inherit!'>{icon}</ListItemIcon>
                    <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
        );
    });

    return (
        <div {...props} className="flex h-dvh flex-col lg:flex-row">
            <MobileMenu menuItems={menuItems} />
            <aside
                color="#1769aa"
                className="flex flex-col bg-[#1769aa]! max-lg:hidden"
            >
                <List className="flex-1! p-0!">{renderMenuItems}</List>
                <SignOutMenuButton />
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
