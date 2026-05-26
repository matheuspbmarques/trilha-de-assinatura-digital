import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { IconButton } from '@/components/IconButton';
import type { TSignatario } from '@/types/signatarios.types';
import DashboardLayout from './components/DashboardLayout';
import { AddSignatarioModal } from './components/Modals/AddSignatarioModal';
import { SignatarioCard } from './components/SignatarioCard';
import { Title } from './components/Title';

export default function Signatarios({
    signatarios,
}: {
    signatarios: TSignatario[];
}) {
    const [showAddSignatarioModal, setShowAddSignatarioModal] =
        useState<boolean>(false);
    const [selectedSignatario, setSelectedSignatario] =
        useState<TSignatario | null>(null);

    const handleOpenCreate = () => {
        setSelectedSignatario(null);
        setShowAddSignatarioModal(true);
    };

    const handleOpenEdit = (signatario: TSignatario) => {
        setSelectedSignatario(signatario);
        setShowAddSignatarioModal(true);
    };

    const handleCloseModal = () => {
        setShowAddSignatarioModal(false);
        setSelectedSignatario(null);
    };

    const renderSignatarios = Object.values(signatarios).map((signatario, index) => {
        return (
            <li key={signatario.id || index}>
                <SignatarioCard
                    {...signatario}
                    onEdit={() => handleOpenEdit(signatario)}
                />
            </li>
        );
    });

    return (
        <DashboardLayout>
            <header className="flex justify-between">
                <Title>Signatários</Title>
                <IconButton
                    className="lg:hidden!"
                    onClick={handleOpenCreate}
                >
                    <AddIcon />
                </IconButton>
                <Button
                    startIcon={<AddIcon />}
                    className="max-lg:hidden!"
                    onClick={handleOpenCreate}
                    variant="contained"
                >
                    Novo
                </Button>
            </header>

            <ul className='flex flex-col gap-2 lg:grid lg:grid-cols-3'>{renderSignatarios}</ul>

            <AddSignatarioModal
                open={showAddSignatarioModal}
                onClose={handleCloseModal}
                onCreate={() => {}}
                signatario={selectedSignatario}
            />
        </DashboardLayout>
    );
}
