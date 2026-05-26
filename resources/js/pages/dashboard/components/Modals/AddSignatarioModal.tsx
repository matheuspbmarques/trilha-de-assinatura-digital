import { useForm } from '@inertiajs/react';
import {
    Button,
    TextField,
    Switch,
    FormControlLabel,
    Typography,
} from '@mui/material';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import type { TSignatario } from '@/types/signatarios.types';

type TAddSignatarioModal = {
    open: boolean;
    onClose(): void;
    onCreate(): void;
    signatario?: TSignatario | null;
};

export function AddSignatarioModal({
    open,
    onClose,
    onCreate,
    signatario,
}: TAddSignatarioModal) {
    const { errors, setData, post, put, clearErrors, processing, reset, data } = useForm({
        nome: signatario?.nome || '',
        email: signatario?.email || '',
        cargo: signatario?.cargo || '',
        setor: signatario?.setor || '',
        ativo: signatario?.ativo ?? true,
    });

    useEffect(() => {
        if (open) {
            setData({
                nome: signatario?.nome || '',
                email: signatario?.email || '',
                cargo: signatario?.cargo || '',
                setor: signatario?.setor || '',
                ativo: signatario?.ativo ?? true,
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [signatario, open, setData, clearErrors, reset]);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (signatario) {
            put(`/api/signatarios/${signatario.id}`, {
                onSuccess() {
                    reset();
                    onClose();
                    onCreate();
                },
            });
        } else {
            post('/api/signatarios', {
                onSuccess() {
                    reset();
                    onClose();
                    onCreate();
                },
            });
        }
    };

    return (
        <Modal.Container open={open} onClose={onClose}>
            <Modal.Contents className="max-w-lg! w-full rounded-2xl overflow-hidden p-0! bg-white">
                <Modal.Header.Container className="p-6 bg-slate-50 border-b border-slate-100">
                    <Modal.Header.Title className="text-slate-800">
                        {signatario ? 'Editar Signatário' : 'Adicionar Signatário'}
                    </Modal.Header.Title>
                    <Modal.Header.CloseButton onClick={onClose} />
                </Modal.Header.Container>

                <form onSubmit={submit} className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5">
                        <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                            Informações do Signatário
                        </Typography>

                        <TextField
                            label="Nome"
                            name="nome"
                            value={data.nome}
                            error={!!errors.nome}
                            helperText={errors.nome}
                            onChange={(e) => {
                                setData('nome', e.target.value);
                                clearErrors('nome');
                            }}
                            disabled={processing}
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="E-mail"
                            name="email"
                            value={data.email}
                            error={!!errors.email}
                            helperText={errors.email}
                            onChange={(e) => {
                                setData('email', e.target.value);
                                clearErrors('email');
                            }}
                            disabled={processing}
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Cargo"
                            value={data.cargo}
                            error={!!errors.cargo}
                            helperText={errors.cargo}
                            onChange={(e) => {
                                setData('cargo', e.target.value);
                                clearErrors('cargo');
                            }}
                            disabled={processing}
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Setor/Departamento"
                            value={data.setor}
                            error={!!errors.setor}
                            helperText={errors.setor}
                            onChange={(e) => {
                                setData('setor', e.target.value);
                                clearErrors('setor');
                            }}
                            disabled={processing}
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={data.ativo}
                                    onChange={(e) => setData('ativo', e.target.checked)}
                                    disabled={processing}
                                    color="primary"
                                />
                            }
                            label={
                                <div className="flex flex-col">
                                    <Typography variant="body2" className="font-semibold text-slate-700">
                                        Ativo
                                    </Typography>
                                    <Typography variant="caption" className="text-slate-400">
                                        Signatário ativo para participar dos fluxos de assinatura
                                    </Typography>
                                </div>
                            }
                            className="mt-1"
                        />
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            disabled={processing}
                            color="inherit"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={processing}
                            color="primary"
                        >
                            {processing ? (signatario ? 'Salvando...' : 'Criando...') : (signatario ? 'Salvar Alterações' : 'Criar Signatário')}
                        </Button>
                    </div>
                </form>
            </Modal.Contents>
        </Modal.Container>
    );
}

