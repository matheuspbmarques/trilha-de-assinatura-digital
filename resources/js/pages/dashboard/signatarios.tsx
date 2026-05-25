import DashboardLayout from '@/components/layouts/dashboard/DashboardLayout';
import { Title } from './components/Title';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddSignatarioModal } from './components/Modals/AddSignatarioModal';
import { useState } from 'react';

export default function Signatarios() {
    const [showAddSignatarioModal, setShowAddSignatarioModal] =
        useState<boolean>(true);

    return (
        <DashboardLayout>
            <header className="flex justify-between">
                <Title>Signatarios</Title>
                <IconButton
                    className="bg-slate-800! lg:hidden!"
                    onClick={() => setShowAddSignatarioModal(true)}
                >
                    <AddIcon />
                </IconButton>
                <Button
                    startIcon={<AddIcon />}
                    className="bg-slate-800! max-lg:hidden!"
                    onClick={() => setShowAddSignatarioModal(true)}
                >
                    Novo
                </Button>
            </header>

            <AddSignatarioModal
                open={showAddSignatarioModal}
                onClose={() => setShowAddSignatarioModal(false)}
            />
        </DashboardLayout>
    );
}
