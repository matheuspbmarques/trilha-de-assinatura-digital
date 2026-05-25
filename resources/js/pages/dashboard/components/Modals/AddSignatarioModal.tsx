import { Modal } from '@/components/Modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { router } from '@inertiajs/react';

type TAddSignatarioModal = {
    open: boolean;
    onClose(): void;
};

const addSignatarioFormSchema = z.object({
    nome: z.string().min(1, 'Informe o nome do signatário'),
    email: z.email('Informe um e-mail válido'),
    cargo: z.string().min(1, 'Informe o cargo do signatário'),
    setor: z.string().min(1, 'Informe o setor do signatário'),
});

type TAddSignatario = z.infer<typeof addSignatarioFormSchema>;

export function AddSignatarioModal({ open, onClose }: TAddSignatarioModal) {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<TAddSignatario>({
        resolver: zodResolver(addSignatarioFormSchema),
    });

    const submit = (data: TAddSignatario) => {
        router.post('../api/signatarios', data, {
            onSuccess(res) {
                console.log(res);
            },
            onError(res) {
                console.log('error', res);
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
                <form
                    onSubmit={handleSubmit(submit)}
                    className="flex flex-col gap-2"
                >
                    <div className="flex flex-col gap-4">
                        <TextField
                            label="Nome"
                            {...register('nome')}
                            error={!!errors.nome}
                            helperText={errors.nome?.message}
                        />
                        <TextField
                            label="E-mail"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        <TextField
                            label="Cargo"
                            {...register('cargo')}
                            error={!!errors.cargo}
                            helperText={errors.cargo?.message}
                        />
                        <TextField
                            label="Setor/Departamento"
                            {...register('setor')}
                            error={!!errors.setor}
                            helperText={errors.setor?.message}
                        />
                    </div>
                    <Button variant="contained" type="submit">
                        Criar
                    </Button>
                </form>
            </Modal.Contents>
        </Modal.Container>
    );
}
