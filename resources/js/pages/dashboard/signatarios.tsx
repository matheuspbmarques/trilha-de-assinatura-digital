import DashboardLayout from './components/DashboardLayout';
import { Title } from './components/Title';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddSignatarioModal } from './components/Modals/AddSignatarioModal';
import { useState } from 'react';
import { IconButton } from '@/components/IconButton';
import { TSignatario } from '@/types/signatarios.types';
import { SignatarioCard } from './components/SignatarioCard';

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
