import { router } from '@inertiajs/react';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { Pagination, Box, Typography } from '@mui/material';
import type { TPaginatedProcessos } from '@/types/processos.types';
import DashboardLayout from './components/DashboardLayout';
import { ProcessoCard } from './components/ProcessoCard';
import { Title } from './components/Title';

type TProcessosPageProps = {
    processos: TPaginatedProcessos;
};

export default function Processos({ processos }: TProcessosPageProps) {
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        // Navigate using Inertia with the new page number, preserving state
        router.get('/dashboard/processos', { page: value }, { preserveState: true });
    };

    const renderProcessos = processos.data.map((processo, index) => {
        return (
            <li key={processo.id || index} className="h-full">
                <ProcessoCard {...processo} />
            </li>
        );
    });

    return (
        <DashboardLayout>
            <header className="flex justify-between items-center">
                <Title>Processos</Title>
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
        </DashboardLayout>
    );
}
