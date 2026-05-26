import { router } from '@inertiajs/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LaunchIcon from '@mui/icons-material/Launch';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    Paper,
    Typography,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Chip,
    Divider,
    Box,
    Alert,
} from '@mui/material';
import React, { useState } from 'react';

type TSignatario = {
    id: string;
    nome: string;
    email: string;
    cargo: string;
    setor: string;
};

type TSignatarioAssoc = {
    id: string;
    status: 'Pendente' | 'Aprovado' | 'Reprovado';
    ordem_assinatura: number | null;
    respondido_em: string | null;
    justificativa: string | null;
    ip_requisicao: string | null;
    signatario: TSignatario;
};

type TProcesso = {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    url: string;
    fluxo_sequencial: boolean;
    signatarios_assoc: TSignatarioAssoc[];
};

type TValidarPageProps = {
    state: 'valid' | 'invalid_token' | 'expired' | 'already_signed' | 'waiting_turn' | 'process_completed';
    processoStatus?: string;
    relation?: {
        id: string;
        token: string;
        token_expira_em: string;
        status: 'Pendente' | 'Aprovado' | 'Reprovado';
        ordem_assinatura: number | null;
        respondido_em: string | null;
        justificativa: string | null;
        ip_requisicao: string | null;
        signatario: TSignatario;
        processo: TProcesso;
    };
};

export default function Validar({ state, relation, processoStatus }: TValidarPageProps) {
    const [decisao, setDecisao] = useState<'Aprovado' | 'Reprovado'>('Aprovado');
    const [justificativa, setJustificativa] = useState('');
    const [errors, setErrors] = useState<{ decisao?: string; justificativa?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);

    const formatDateTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusChip = (status: 'Pendente' | 'Aprovado' | 'Reprovado') => {
        switch (status) {
            case 'Aprovado':
                return <Chip label="Aprovou" color="success" size="small" className="font-semibold!" />;
            case 'Reprovado':
                return <Chip label="Reprovou" color="error" size="small" className="font-semibold!" />;
            default:
                return <Chip label="Pendente" color="warning" size="small" className="font-semibold!" />;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!relation) return;

        // Validations
        const newErrors: { justificativa?: string } = {};
        if (decisao === 'Reprovado' && !justificativa.trim()) {
            newErrors.justificativa = 'A justificativa é obrigatória ao reprovar o processo.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        router.post(
            `/processos/validar/${relation.token}`,
            {
                decisao,
                justificativa: decisao === 'Reprovado' ? justificativa : '',
            },
            {
                onError: (err) => {
                    setErrors({
                        general: err.error || 'Ocorreu um erro ao enviar sua decisão.',
                        ...err,
                    });
                    setLoading(false);
                },
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    const renderCardHeader = () => (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-600">
                <ShieldIcon />
                <Typography variant="subtitle2" className="font-bold uppercase tracking-wider text-xs">
                    Assinatura Digital Segura
                </Typography>
            </div>
            {relation?.token_expira_em && state === 'valid' && (
                <Typography variant="caption" className="text-slate-400">
                    Expira em: {formatDateTime(relation.token_expira_em)}
                </Typography>
            )}
        </div>
    );

    // States layout
    if (state === 'invalid_token') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Paper className="max-w-md w-full p-8 text-center border border-slate-100 rounded-2xl shadow-md">
                    <WarningAmberIcon sx={{ fontSize: 64 }} className="text-amber-500 mb-4" />
                    <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                        Link Inválido
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mb-6">
                        O token de assinatura fornecido é inválido, não existe ou o processo foi excluído. Certifique-se de ter copiado o link correto enviado para seu e-mail.
                    </Typography>
                    <Divider className="my-4" />
                    <Typography variant="caption" className="text-slate-400 block">
                        Trilha de Assinatura Digital
                    </Typography>
                </Paper>
            </div>
        );
    }

    if (state === 'expired' && relation) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Paper className="max-w-md w-full p-8 text-center border border-slate-100 rounded-2xl shadow-md">
                    <ErrorIcon sx={{ fontSize: 64 }} className="text-error-main text-red-500 mb-4" />
                    <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                        Link Expirado
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mb-6">
                        Este link de assinatura expirou. Por motivos de segurança, os convites de assinatura são válidos por até 7 dias após o envio.
                    </Typography>
                    <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 mb-6">
                        <Typography variant="subtitle2" className="font-semibold text-slate-700 text-sm">
                            Processo: {relation.processo.titulo}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 block mt-1">
                            Expiração: {formatDateTime(relation.token_expira_em)}
                        </Typography>
                    </div>
                    <Divider className="my-4" />
                    <Typography variant="caption" className="text-slate-400 block">
                        Solicite ao criador do processo o reenvio do link.
                    </Typography>
                </Paper>
            </div>
        );
    }

    if (state === 'waiting_turn' && relation) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Paper className="max-w-md w-full p-8 text-center border border-slate-100 rounded-2xl shadow-md">
                    <HourglassEmptyIcon sx={{ fontSize: 64 }} className="text-blue-500 mb-4 animate-pulse" />
                    <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                        Aguardando Assinaturas Anteriores
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mb-6">
                        Este processo possui um <strong>fluxo sequencial de assinaturas</strong>. Outros signatários devem assinar antes de você poder registrar sua decisão.
                    </Typography>
                    <div className="bg-blue-50/50 p-4 rounded-xl text-left border border-blue-100 mb-6">
                        <Typography variant="subtitle2" className="font-semibold text-blue-900 text-sm">
                            Sua ordem de assinatura: {relation.ordem_assinatura}
                        </Typography>
                        <Typography variant="caption" className="text-blue-700 block mt-1">
                            Você receberá um novo e-mail assim que for a sua vez de revisar e assinar o documento.
                        </Typography>
                    </div>
                    <Divider className="my-4" />
                    <Typography variant="caption" className="text-slate-400 block">
                        Trilha de Assinatura Digital
                    </Typography>
                </Paper>
            </div>
        );
    }

    if (state === 'process_completed' && relation) {
        const isApproved = processoStatus === 'Aprovado';
        const isRejected = processoStatus === 'Reprovado';

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Paper className="max-w-md w-full p-8 text-center border border-slate-100 rounded-2xl shadow-md">
                    {isApproved ? (
                        <CheckCircleIcon sx={{ fontSize: 64 }} className="text-green-500 mb-4" />
                    ) : isRejected ? (
                        <ErrorIcon sx={{ fontSize: 64 }} className="text-red-500 mb-4" />
                    ) : (
                        <LockIcon sx={{ fontSize: 64 }} className="text-slate-400 mb-4" />
                    )}
                    <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                        Processo {processoStatus}
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mb-6">
                        Este processo digital já foi finalizado e arquivado com o status de <strong>{processoStatus}</strong>. Não é mais possível registrar aprovações ou reprovações.
                    </Typography>
                    <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 mb-6">
                        <Typography variant="subtitle2" className="font-semibold text-slate-700 text-sm">
                            Documento: {relation.processo.titulo}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 block mt-1">
                            Categoria: {relation.processo.categoria}
                        </Typography>
                    </div>
                    <Divider className="my-4" />
                    <Typography variant="caption" className="text-slate-400 block">
                        Trilha de Assinatura Digital
                    </Typography>
                </Paper>
            </div>
        );
    }

    if (state === 'already_signed' && relation) {
        const approved = relation.status === 'Aprovado';
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Paper className="max-w-md w-full p-8 text-center border border-slate-100 rounded-2xl shadow-md">
                    {approved ? (
                        <CheckCircleIcon sx={{ fontSize: 64 }} className="text-green-500 mb-4" />
                    ) : (
                        <ErrorIcon sx={{ fontSize: 64 }} className="text-red-500 mb-4" />
                    )}
                    <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                        Decisão Já Registrada
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mb-6">
                        Você já registrou sua decisão para este documento. Sua resposta foi salva no histórico do processo.
                    </Typography>
                    <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 mb-6 flex flex-col gap-2">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-semibold uppercase text-[10px]">
                                Sua Decisão
                            </Typography>
                            <div className="mt-0.5 flex items-center gap-2">
                                {getStatusChip(relation.status)}
                                <span className="text-xs text-slate-400">
                                    em {formatDateTime(relation.respondido_em)}
                                </span>
                            </div>
                        </div>
                        {relation.justificativa && (
                            <div>
                                <Typography variant="caption" className="text-slate-400 font-semibold uppercase text-[10px]">
                                    Justificativa enviada
                                </Typography>
                                <Typography variant="body2" className="text-slate-600 bg-white p-2 rounded border border-slate-100 mt-0.5 italic">
                                    "{relation.justificativa}"
                                </Typography>
                            </div>
                        )}
                        {relation.ip_requisicao && (
                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                                <Typography variant="caption" className="text-slate-400 font-semibold uppercase text-[10px]">
                                    Identificação IP
                                </Typography>
                                <span className="text-xs font-mono text-slate-500">{relation.ip_requisicao}</span>
                            </div>
                        )}
                    </div>
                    <Divider className="my-4" />
                    <Typography variant="caption" className="text-slate-400 block">
                        Trilha de Assinatura Digital
                    </Typography>
                </Paper>
            </div>
        );
    }

    // Default 'valid' sign state
    if (state === 'valid' && relation) {
        const { processo, signatario } = relation;

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
                <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-8 flex flex-col gap-6">
                    {/* Header Brand */}
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                            <ShieldIcon sx={{ fontSize: 20 }} />
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight text-lg">Trilha de Assinatura Digital</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Process details card */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                                {renderCardHeader()}

                                <Typography variant="h5" className="font-extrabold text-slate-800 mb-2 leading-tight">
                                    {processo.titulo}
                                </Typography>

                                <div className="flex gap-2 mb-4">
                                    <Chip label={processo.categoria} variant="outlined" size="small" className="text-slate-600! border-slate-200!" />
                                    {processo.fluxo_sequencial && (
                                        <Chip label="Assinatura Sequencial" color="info" variant="outlined" size="small" icon={<HistoryIcon sx={{ fontSize: '14px!' }} />} className="font-medium!" />
                                    )}
                                </div>

                                <Typography variant="caption" className="text-slate-400 block font-semibold uppercase text-[10px] mb-1">
                                    Descrição do Processo
                                </Typography>
                                <Typography variant="body2" className="text-slate-600 leading-relaxed mb-6">
                                    {processo.descricao}
                                </Typography>

                                <Divider className="my-4" />

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <Typography variant="caption" className="text-slate-400 block font-semibold uppercase text-[10px]">
                                            Signatário Solicitado
                                        </Typography>
                                        <Typography variant="body1" className="font-bold text-slate-800">
                                            {signatario.nome}
                                        </Typography>
                                        <Typography variant="caption" className="text-slate-500 block">
                                            {signatario.cargo} • {signatario.setor} (E-mail: {signatario.email})
                                        </Typography>
                                    </div>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        href={processo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        endIcon={<LaunchIcon />}
                                        className="shadow-sm shadow-blue-500/20"
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Visualizar Documento
                                    </Button>
                                </div>
                            </Paper>

                            {/* Signatories validation form */}
                            <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm">
                                <Typography variant="h6" className="font-bold text-slate-800 mb-4">
                                    Sua Decisão
                                </Typography>

                                {errors.general && (
                                    <Alert severity="error" className="mb-4 rounded-xl">
                                        {errors.general}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <RadioGroup
                                        value={decisao}
                                        onChange={(e) => setDecisao(e.target.value as 'Aprovado' | 'Reprovado')}
                                        className="flex flex-row gap-4 mb-2"
                                    >
                                        <FormControlLabel
                                            value="Aprovado"
                                            control={<Radio color="success" />}
                                            label={
                                                <Box className={`px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${decisao === 'Aprovado' ? 'border-green-500 bg-green-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                                                    <span className="font-bold text-green-700">Aprovar</span>
                                                    <span className="text-xs text-slate-500">Declaro estar de acordo com o documento.</span>
                                                </Box>
                                            }
                                            className="m-0! flex-1"
                                        />
                                        <FormControlLabel
                                            value="Reprovado"
                                            control={<Radio color="error" />}
                                            label={
                                                <Box className={`px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${decisao === 'Reprovado' ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                                                    <span className="font-bold text-red-700">Reprovar</span>
                                                    <span className="text-xs text-slate-500">Recuso este documento e informo a justificativa.</span>
                                                </Box>
                                            }
                                            className="m-0! flex-1"
                                        />
                                    </RadioGroup>

                                    {decisao === 'Reprovado' && (
                                        <TextField
                                            label="Justificativa da Reprovação"
                                            multiline
                                            rows={4}
                                            required
                                            value={justificativa}
                                            onChange={(e) => setJustificativa(e.target.value)}
                                            placeholder="Descreva detalhadamente o motivo da reprovação deste documento..."
                                            error={!!errors.justificativa}
                                            helperText={errors.justificativa}
                                            fullWidth
                                            className="bg-slate-50"
                                            slotProps={{
                                                inputLabel: { shrink: true }
                                            }}
                                        />
                                    )}

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color={decisao === 'Aprovado' ? 'success' : 'error'}
                                        size="large"
                                        disabled={loading}
                                        className="py-3 mt-2 font-bold shadow-md"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {loading ? 'Processando...' : `Confirmar e Enviar Decisão (${decisao})`}
                                    </Button>
                                </form>
                            </Paper>
                        </div>

                        {/* Side: list of all signatories */}
                        <div className="md:col-span-1">
                            <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4">
                                <div>
                                    <Typography variant="subtitle1" className="font-bold text-slate-800">
                                        Signatários do Processo
                                    </Typography>
                                    <Typography variant="caption" className="text-slate-400">
                                        Acompanhe o andamento das assinaturas.
                                    </Typography>
                                </div>

                                <Divider />

                                <ul className="flex flex-col gap-3">
                                    {processo.signatarios_assoc?.map((assoc, idx) => {
                                        const isCurrent = assoc.signatario.id === signatario.id;
                                        return (
                                            <li
                                                key={assoc.id}
                                                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${isCurrent ? 'border-blue-200 bg-blue-50/10 ring-1 ring-blue-100' : 'border-slate-100 bg-slate-50/30'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0">
                                                        <Typography variant="body2" className={`font-semibold text-slate-800 truncate ${isCurrent ? 'text-blue-700 font-bold' : ''}`}>
                                                            {assoc.signatario.nome} {isCurrent && '(Você)'}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-slate-400 block truncate">
                                                            {assoc.signatario.cargo}
                                                        </Typography>
                                                    </div>
                                                    {getStatusChip(assoc.status)}
                                                </div>
                                                {processo.fluxo_sequencial && assoc.ordem_assinatura && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Typography variant="caption" className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                            Ordem: {assoc.ordem_assinatura}
                                                        </Typography>
                                                    </div>
                                                )}
                                                {assoc.respondido_em && (
                                                    <Typography variant="caption" className="text-[10px] text-slate-400 italic mt-0.5">
                                                        Respondeu em: {formatDateTime(assoc.respondido_em)}
                                                    </Typography>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Paper>
                        </div>
                    </div>
                </main>
                <footer className="py-6 text-center border-t border-slate-100 bg-white">
                    <Typography variant="caption" className="text-slate-400">
                        © {new Date().getFullYear()} Trilha de Assinatura Digital. Sistema Seguro de Assinaturas Eletrônicas.
                    </Typography>
                </footer>
            </div>
        );
    }

    return null;
}
