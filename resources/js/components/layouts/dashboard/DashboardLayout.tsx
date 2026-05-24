import MobileMenu from '@/components/MobileMenu';
import { HTMLAttributes, ReactElement } from 'react';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PeopleIcon from '@mui/icons-material/People';
import FilePresentIcon from '@mui/icons-material/FilePresent';

export type MenuItem = {
    icon: ReactElement;
    text: string;
    route: string;
}

const menuItems: Array<MenuItem> = [
    {
        icon: <HomeFilledIcon />,
        route: 'dashboard.home',
        text: 'Início',
    },
    {
        icon: <PeopleIcon />,
        text: 'Signatários',
        route: 'dashboard.signatarios',
    },
    {
        icon: <FilePresentIcon />,
        text: 'Processos',
        route: 'dashboard.processos',
    },
];

export default function DashboardLayout({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`${className}`}>
            <MobileMenu menuItems={menuItems} />
            <main>{children}</main>
        </div>
    );
}
