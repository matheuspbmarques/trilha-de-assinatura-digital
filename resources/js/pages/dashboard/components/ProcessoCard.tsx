import DescriptionIcon from '@mui/icons-material/Description';
import LaunchIcon from '@mui/icons-material/Launch';
import { Paper, Typography, Chip, Button } from '@mui/material';
import type { TProcesso } from '@/types/processos.types';

export function ProcessoCard({
    titulo,
    descricao,
    status,
    categoria,
    url,
    created_at,
}: TProcesso) {
    const getStatusConfig = (statusStr: string) => {
        switch (statusStr) {
            case 'Pendente':
                return { color: 'warning' as const, label: 'Pendente' };
            case 'Em aprovação':
                return { color: 'info' as const, label: 'Em Aprovação' };
            case 'Aprovado':
                return { color: 'success' as const, label: 'Aprovado' };
            case 'Reprovado':
                return { color: 'error' as const, label: 'Reprovado' };
            case 'Cancelado':
            default:
                return { color: 'default' as const, label: 'Cancelado' };
        }
    };

    const statusConfig = getStatusConfig(status);
    const dateFormatted = new Date(created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <Paper
            elevation={2}
            className="group relative flex flex-col justify-between p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100/60"
        >
            <div className="flex flex-col gap-4 flex-1">
                {/* Header: Title and Document Icon */}
                <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                        <DescriptionIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Typography
                            variant="h6"
                            className="font-semibold text-slate-800 text-sm lg:text-base line-clamp-2 leading-tight"
                            title={titulo}
                        >
                            {titulo}
                        </Typography>
                        <span className="inline-block mt-1 text-xs font-medium text-slate-400">
                            Criado em: {dateFormatted}
                        </span>
                    </div>
                </div>

                {/* Badges/Chips */}
                <div className="flex flex-wrap gap-2">
                    <Chip
                        label={categoria}
                        size="small"
                        variant="outlined"
                        className="text-slate-600! border-slate-200! font-medium!"
                    />
                    <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        variant="filled"
                        className="font-semibold!"
                    />
                </div>

                {/* Description */}
                <div className="flex-1 mt-1">
                    <Typography variant="caption" className="text-slate-400 block mb-0.5 font-medium">
                        Descrição:
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-slate-600 text-xs lg:text-sm line-clamp-3 leading-relaxed"
                    >
                        {descricao}
                    </Typography>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button
                    variant="outlined"
                    size="small"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<LaunchIcon sx={{ fontSize: '14px!' }} />}
                    className="text-blue-600! border-blue-200! hover:bg-blue-50/50! hover:border-blue-300!"
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                >
                    Visualizar Documento
                </Button>
            </div>
        </Paper>
    );
}
