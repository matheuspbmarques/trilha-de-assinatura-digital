import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { Pagination, Box, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { IconButton } from '@/components/IconButton';
import type { TPaginatedSignatarios, TSignatario } from '@/types/signatarios.types';
import DashboardLayout from './components/DashboardLayout';
import { AddSignatarioModal } from './components/Modals/AddSignatarioModal';
import { SignatarioCard } from './components/SignatarioCard';
import { Title } from './components/Title';

export default function Signatarios({
    signatarios,
}: {
    signatarios: TPaginatedSignatarios;
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

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        // Navigate using Inertia with the new page number, preserving state
        router.get('/dashboard/signatarios', { page: value }, { preserveState: true });
    };

    const renderSignatarios = signatarios.data.map((signatario, index) => {
        return (
            <li key={signatario.id || index} className="h-full">
                <SignatarioCard
                    {...signatario}
                    onEdit={() => handleOpenEdit(signatario)}
                />
            </li>
        );
    });

    return (
        <DashboardLayout>
            <header className="flex justify-between items-center mb-6">
                <Title>Signatários</Title>

                {/* Button for Desktop size */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    className="max-lg:hidden!"
                >
                    Novo Signatário
                </Button>

                {/* Icon Button for Mobile size */}
                <IconButton
                    color="primary"
                    onClick={handleOpenCreate}
                    className="inline-flex! lg:hidden!"
                >
                    <AddIcon />
                </IconButton>
            </header>

            {signatarios.data.length === 0 ? (
                <Box className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <PeopleIcon sx={{ fontSize: 64 }} className="text-slate-300 mb-4" />
                    <Typography variant="h6" className="text-slate-600 font-semibold mb-1">
                        Nenhum signatário encontrado
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 text-center max-w-sm">
                        Não existem signatários cadastrados no momento.
                    </Typography>
                </Box>
            ) : (
                <div className="flex-1 flex flex-col justify-between gap-6">
                    <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-3 auto-rows-fr">
                        {renderSignatarios}
                    </ul>

                    <Box className="flex justify-center mt-auto py-4">
                        <Pagination
                            count={signatarios.last_page}
                            page={signatarios.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
                        />
                    </Box>
                </div>
            )}

            <AddSignatarioModal
                open={showAddSignatarioModal}
                onClose={handleCloseModal}
                onCreate={() => router.reload()}
                signatario={selectedSignatario}
            />
        </DashboardLayout>
    );
}

