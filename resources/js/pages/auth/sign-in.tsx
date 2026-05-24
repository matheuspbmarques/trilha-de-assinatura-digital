import AuthLayout from '@/components/layouts/auth/AuthLayout';
import {
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SignInIllustration from '../../components/illustrations/SignInIllustration';
import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { router } from '@inertiajs/react'
import { localApiBaseUrl } from '@/api/local.api';

const signInSchema = z.object({
    acesso: z.string().min(1, 'Informe o seu acesso'),
    senha: z.string().min(1, 'Informe a sua senha'),
});
type TSignIn = z.infer<typeof signInSchema>;

export default function SignIn() {
    const [showPassword, setShowPassword] = useState<Boolean>(false);

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<TSignIn>({
        resolver: zodResolver(signInSchema),
    });

    const submit = (data: TSignIn) => {
        router.post(`${localApiBaseUrl}/api/auth/sign-in`, data, {
            onError: e => {
                console.log(e);
            }
        })
    };

    return (
        <AuthLayout>
            <div className="flex flex-1 items-center lg:justify-end">
                <span className="w-64 lg:w-sm">
                    <SignInIllustration />
                </span>
            </div>
            <div className="flex w-full flex-2 flex-col items-center gap-4 lg:flex-1 lg:items-start">
                <form
                    onSubmit={handleSubmit(submit)}
                    className="flex w-full max-w-xs flex-col gap-4"
                >
                    <TextField
                        label="Acesso"
                        placeholder="Informe o seu acesso"
                        {...register('acesso')}
                        error={!!errors.acesso}
                        helperText={errors.acesso?.message}
                    />
                    <FormControl error={!!errors.senha}>
                        <InputLabel>Senha</InputLabel>
                        <OutlinedInput
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        color={
                                            !!errors.senha ? 'error' : 'primary'
                                        }
                                    >
                                        {showPassword ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            }
                            {...register('senha')}
                        />
                        <FormHelperText error={!!errors.senha}>
                            {errors.senha?.message}
                        </FormHelperText>
                    </FormControl>
                    <Button variant="contained" type="submit">
                        Entrar
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
