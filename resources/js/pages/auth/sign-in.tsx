import { useForm } from '@inertiajs/react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
import type { SubmitEventHandler} from 'react';
import { useState } from 'react';
import SignInIllustration from '../../components/illustrations/SignInIllustration';
import { AuthLayout } from './components/AuthLayout';

export default function SignIn() {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const { post, errors, setData, processing } = useForm({
        acesso: '',
        senha: '',
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post('/api/auth/sign-in');
    };

    return (
        <AuthLayout>
            <div className="flex w-full flex-3">
                <span className="m-auto flex h-64">
                    <SignInIllustration />
                </span>
            </div>
            <div className="w-full flex-4">
                <form
                    onSubmit={submit}
                    className="mx-auto flex max-w-xs flex-col gap-4"
                >
                    <TextField
                        label="Acesso"
                        placeholder="Informe o seu acesso"
                        error={!!errors.acesso}
                        helperText={errors.acesso}
                        name="acesso"
                        onChange={(e) => setData('acesso', e.target.value)}
                        disabled={processing}
                    />
                    <FormControl error={!!errors.senha}>
                        <InputLabel>Senha</InputLabel>
                        <OutlinedInput
                            label="Senha"
                            name="senha"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        color={
                                            errors.senha ? 'error' : undefined
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
                            onChange={(e) => setData('senha', e.target.value)}
                            disabled={processing}
                        />
                        <FormHelperText error={!!errors.senha}>
                            {errors.senha}
                        </FormHelperText>
                    </FormControl>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={processing}
                    >
                        Entrar
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
