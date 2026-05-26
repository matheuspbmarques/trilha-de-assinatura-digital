import EditIcon from '@mui/icons-material/Edit';
import { Paper, Typography } from '@mui/material';
import { IconButton } from '@/components/IconButton';
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
        <Paper elevation={2} className="relative flex p-4">
            <div className="absolute top-2 right-2">
                <IconButton
                    onClick={onEdit}
                    className="p-1.5!"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
                <div>
                    <Typography variant="caption" className="text-slate-500">Nome:</Typography>
                    <Typography className="font-medium text-sm lg:text-base">{nome}</Typography>
                </div>
                <div>
                    <Typography variant="caption" className="text-slate-500">Email:</Typography>
                    <Typography className="font-medium text-sm lg:text-base">{email}</Typography>
                </div>
                <div>
                    <Typography variant="caption" className="text-slate-500">Cargo:</Typography>
                    <Typography className="font-medium text-sm lg:text-base">{cargo}</Typography>
                </div>
                <div>
                    <Typography variant="caption" className="text-slate-500">Setor:</Typography>
                    <Typography className="font-medium text-sm lg:text-base">{setor}</Typography>
                </div>
                <div>
                    <Typography variant="caption" className="text-slate-500">Ativo:</Typography>
                    <Typography className="font-medium text-sm lg:text-base">{ativo ? 'Sim' : 'Não'}</Typography>
                </div>
            </div>
        </Paper>
    );
}
