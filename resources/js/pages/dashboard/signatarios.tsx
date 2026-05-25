import DashboardLayout from './components/DashboardLayout';
import { Title } from './components/Title';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddSignatarioModal } from './components/Modals/AddSignatarioModal';
import { useState } from 'react';
import { IconButton } from '@/components/IconButton';

export default function Signatarios() {
    const [showAddSignatarioModal, setShowAddSignatarioModal] =
        useState<boolean>(true);

    return (
        <DashboardLayout>
            <header className="flex justify-between">
                <Title>Signatarios</Title>
                <IconButton onClick={() => setShowAddSignatarioModal(true)}>
                    <AddIcon />
                </IconButton>
                <Button
                    startIcon={<AddIcon />}
                    className="max-lg:hidden!"
                    onClick={() => setShowAddSignatarioModal(true)}
                    variant="contained"
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
