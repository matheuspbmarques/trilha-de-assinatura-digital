import { router } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { Pagination, Box, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { IconButton } from '@/components/IconButton';
import type { TPaginatedProcessos } from '@/types/processos.types';
import type { TSignatario } from '@/types/signatarios.types';
import DashboardLayout from './components/DashboardLayout';
import { AddProcessoModal } from './components/Modals/AddProcessoModal';
import { ProcessoDetalhesModal } from './components/Modals/ProcessoDetalhesModal';
import { ProcessoCard } from './components/ProcessoCard';
import { Title } from './components/Title';

type TProcessosPageProps = {
    processos: TPaginatedProcessos;
    signatarios: TSignatario[];
};

export default function Processos({ processos, signatarios = [] }: TProcessosPageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProcesso, setSelectedProcesso] = useState<any | null>(null);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        // Navigate using Inertia with the new page number, preserving state
        router.get('/dashboard/processos', { page: value }, { preserveState: true });
    };

    const renderProcessos = processos.data.map((processo, index) => {
        return (
            <li key={processo.id || index} className="h-full">
                <ProcessoCard
                    {...processo}
                    onShowDetails={() => {
                        setSelectedProcesso(processo);
                        setDetailsOpen(true);
                    }}
                />
            </li>
        );
    });

    return (
        <DashboardLayout>
            <header className="flex justify-between items-center mb-6">
                <Title>Processos</Title>

                {/* Button for Desktop size */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                    className="max-lg:hidden!"
                >
                    Novo Processo
                </Button>

                {/* Icon Button for Mobile size */}
                <IconButton
                    color="primary"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex! lg:hidden!"
                >
                    <AddIcon />
                </IconButton>
            </header>

            {processos.data.length === 0 ? (
                <Box className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <FilePresentIcon sx={{ fontSize: 64 }} className="text-slate-300 mb-4" />
                    <Typography variant="h6" className="text-slate-600 font-semibold mb-1">
                        Nenhum processo encontrado
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 text-center max-w-sm">
                        Não existem processos vinculados ao seu usuário no momento.
                    </Typography>
                </Box>
            ) : (
                <div className="flex-1 flex flex-col justify-between gap-6">
                    <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-3 auto-rows-fr">
                        {renderProcessos}
                    </ul>

                    <Box className="flex justify-center mt-auto py-4">
                        <Pagination
                            count={processos.last_page}
                            page={processos.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
                        />
                    </Box>
                </div>
            )}

            <AddProcessoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={() => router.reload()}
                signatarios={signatarios}
            />

            <ProcessoDetalhesModal
                open={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false);
                    setSelectedProcesso(null);
                }}
                processo={processos.data.find(p => p.id === selectedProcesso?.id) || selectedProcesso}
            />
        </DashboardLayout>
    );
}
