import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { Paper, Typography, Chip, Button } from '@mui/material';
import type { TSignatario } from '@/types/signatarios.types';

type TSignatarioCard = TSignatario & {
    onEdit(): void;
};

export function SignatarioCard({
    nome,
    email,
    cargo,
    setor,
    ativo,
    onEdit,
}: TSignatarioCard) {
    return (
        <Paper
            elevation={2}
            className="group relative flex flex-col justify-between p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100/60"
        >
            <div className="flex flex-col gap-4 flex-1">
                {/* Header: Name and Signatario Icon */}
                <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                        <PersonIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Typography
                            variant="h6"
                            className="font-semibold text-slate-800 text-sm lg:text-base line-clamp-1 leading-tight"
                            title={nome}
                        >
                            {nome}
                        </Typography>
                        <span className="inline-block mt-1 text-xs font-medium text-slate-400">
                            {cargo}
                        </span>
                    </div>
                </div>

                {/* Badges/Chips */}
                <div className="flex flex-wrap gap-2">
                    <Chip
                        label={setor}
                        size="small"
                        variant="outlined"
                        className="text-slate-600! border-slate-200! font-medium!"
                    />
                    <Chip
                        label={ativo ? 'Ativo' : 'Inativo'}
                        color={ativo ? 'success' : 'default'}
                        size="small"
                        variant="filled"
                        className="font-semibold!"
                    />
                </div>

                {/* Email & Details */}
                <div className="flex-1 mt-1">
                    <Typography variant="caption" className="text-slate-400 block mb-0.5 font-medium">
                        E-mail:
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-slate-600 text-xs lg:text-sm break-all font-medium"
                    >
                        {email}
                    </Typography>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onEdit}
                    startIcon={<EditIcon sx={{ fontSize: '14px!' }} />}
                    className="text-blue-600! border-blue-200! hover:bg-blue-50/50! hover:border-blue-300!"
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                >
                    Editar Signatário
                </Button>
            </div>
        </Paper>
    );
}

