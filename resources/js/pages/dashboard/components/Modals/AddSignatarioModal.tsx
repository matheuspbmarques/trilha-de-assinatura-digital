import { useForm } from '@inertiajs/react';
import { Button, TextField, Switch, FormControlLabel } from '@mui/material';
import type { SubmitEventHandler} from 'react';
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
        ativo: signatario?.ativo || true as boolean,
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (e) => {
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
            <Modal.Contents>
                <Modal.Header.Container>
                    <Modal.Header.Title>
                        {signatario ? 'Editar Signatário' : 'Adicionar Signatário'}
                    </Modal.Header.Title>
                    <Modal.Header.CloseButton onClick={onClose} />
                </Modal.Header.Container>
                <form onSubmit={submit} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-4">
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
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={data.ativo}
                                    onChange={(e) => setData('ativo', e.target.checked)}
                                    disabled={processing}
                                />
                            }
                            label="Ativo"
                        />
                    </div>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={processing}
                    >
                        {signatario ? 'Salvar' : 'Criar'}
                    </Button>
                </form>
            </Modal.Contents>
        </Modal.Container>
    );
}
