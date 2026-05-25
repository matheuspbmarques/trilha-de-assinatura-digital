import { Modal } from '@/components/Modal';
import { Button, TextField } from '@mui/material';
import { useForm } from '@inertiajs/react';
import { SubmitEventHandler } from 'react';

type TAddSignatarioModal = {
    open: boolean;
    onClose(): void;
    onCreate(): void;
};

export function AddSignatarioModal({
    open,
    onClose,
    onCreate,
}: TAddSignatarioModal) {
    const { errors, setData, post, clearErrors, processing, reset } = useForm({
        nome: '',
        email: '',
        cargo: '',
        setor: '',
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post('/api/signatarios', {
            onSuccess() {
                console.log('Success!');
                reset();
                onClose();
                onCreate();
            },
        });
    };

    return (
        <Modal.Container open={open} onClose={onClose}>
            <Modal.Contents>
                <Modal.Header.Container>
                    <Modal.Header.Title>
                        Adicionar Signatário
                    </Modal.Header.Title>
                    <Modal.Header.CloseButton onClick={onClose} />
                </Modal.Header.Container>
                <form onSubmit={submit} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <TextField
                            label="Nome"
                            name="nome"
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
                            error={!!errors.email}
                            helperText={errors.email}
                            onChange={(e) => {
                                setData('email', e.target.value);
                                clearErrors('email');
                            }}
                        />
                        <TextField
                            label="Cargo"
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
                            error={!!errors.setor}
                            helperText={errors.setor}
                            onChange={(e) => {
                                setData('setor', e.target.value);
                                clearErrors('setor');
                            }}
                            disabled={processing}
                        />
                    </div>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={processing}
                    >
                        Criar
                    </Button>
                </form>
            </Modal.Contents>
        </Modal.Container>
    );
}
