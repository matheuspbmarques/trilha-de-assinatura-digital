import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LaunchIcon from '@mui/icons-material/Launch';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { Divider, Typography, Chip, Box, Button, CircularProgress } from '@mui/material';
import { Modal } from '@/components/Modal';
import { router } from '@inertiajs/react';
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
    user_agent: string | null;
    signatario: TSignatario;
};

type THistorico = {
    id: string;
    campo: string;
    descricao: string;
    created_at: string;
};

type TAuditoria = {
    id: string;
    processo_id: string;
    usuario_id: string | null;
    signatario_id: string | null;
    acao: string;
    descricao: string;
    dados_anteriores: Record<string, any> | null;
    dados_novos: Record<string, any> | null;
    created_at: string;
    usuario?: { id: string; acesso: string } | null;
    signatario?: { id: string; nome: string; email: string } | null;
};

type TProcessoDetailed = {
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    categoria: string;
    url: string;
    fluxo_sequencial: boolean;
    created_at: string;
    updated_at: string;
    historico?: THistorico[];
    auditorias?: TAuditoria[];
    signatarios_assoc?: TSignatarioAssoc[];
};

type TProcessoDetalhesModalProps = {
    open: boolean;
    onClose(): void;
    processo: TProcessoDetailed | null;
};

export function ProcessoDetalhesModal({ open, onClose, processo }: TProcessoDetalhesModalProps) {
    if (!processo) {
        return null;
    }

    const [confirmCancel, setConfirmCancel] = useState(false);
    const [isResending, setIsResending] = useState<string | null>(null);

    const formatDateTime = (dateStr: string | null | undefined) => {
        if (!dateStr) {
            return '';
        }

        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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

    const statusConfig = getStatusConfig(processo.status);

    const getSignatarioStatusIcon = (status: 'Pendente' | 'Aprovado' | 'Reprovado') => {
        switch (status) {
            case 'Aprovado':
                return <CheckCircleIcon className="text-green-500" sx={{ fontSize: 18 }} />;
            case 'Reprovado':
                return <ErrorIcon className="text-red-500" sx={{ fontSize: 18 }} />;
            default:
                return <HourglassEmptyIcon className="text-amber-500" sx={{ fontSize: 18 }} />;
        }
    };

    const handleCancelProcess = () => {
        router.post(`/dashboard/processos/${processo.id}/cancelar`, {}, {
            onSuccess: () => {
                setConfirmCancel(false);
            },
            onError: (err) => {
                console.error(err);
                setConfirmCancel(false);
            }
        });
    };

    const handleResendEmail = (relationId: string) => {
        setIsResending(relationId);
        router.post(`/dashboard/processos/${processo.id}/reenviar-email/${relationId}`, {}, {
            onFinish: () => {
                setIsResending(null);
            }
        });
    };

    const getActionBadgeStyle = (acao: string) => {
        switch (acao) {
            case 'Criação':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-600' };
            case 'Aprovação':
                return { bg: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-600' };
            case 'Reprovação':
                return { bg: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-600' };
            case 'Cancelamento':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-600' };
            case 'Reenvio de E-mail':
                return { bg: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-600' };
            case 'Alteração de Status':
            default:
                return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-600' };
        }
    };

    const formatValue = (val: any): string => {
        if (val === null || val === undefined) return 'Nulo';
        if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    const renderDiff = (anteriores: any, novos: any) => {
        if (!anteriores && !novos) return null;

        const keys = Array.from(new Set([
            ...Object.keys(anteriores || {}),
            ...Object.keys(novos || {})
        ])).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'signatarios');

        if (keys.length === 0) return null;

        return (
            <div className="mt-2 bg-slate-100/60 p-2.5 rounded-lg border border-slate-200/50 text-[11px] font-sans">
                <span className="font-bold text-slate-500 uppercase block mb-1.5 text-[9px] tracking-wider">Alterações de Dados</span>
                <div className="flex flex-col gap-1.5">
                    {keys.map((key) => {
                        const oldVal = anteriores ? anteriores[key] : undefined;
                        const newVal = novos ? novos[key] : undefined;
                        
                        const formattedKey = key
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());

                        if (oldVal !== undefined && newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                            return (
                                <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200/30 pb-1 last:border-0 last:pb-0">
                                    <span className="font-semibold text-slate-700">{formattedKey}:</span>
                                    <span className="text-slate-600 truncate max-w-[250px]" title={`${formatValue(oldVal)} ➔ ${formatValue(newVal)}`}>
                                        <span className="line-through text-red-500 mr-1.5">{formatValue(oldVal)}</span>
                                        <span className="text-green-600 font-medium">{formatValue(newVal)}</span>
                                    </span>
                                </div>
                            );
                        } else if (newVal !== undefined && oldVal === undefined) {
                            return (
                                <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200/30 pb-1 last:border-0 last:pb-0">
                                    <span className="font-semibold text-slate-700">{formattedKey}:</span>
                                    <span className="text-green-600 font-medium truncate max-w-[250px]" title={formatValue(newVal)}>{formatValue(newVal)}</span>
                                </div>
                            );
                        } else if (oldVal !== undefined && newVal === undefined) {
                            return (
                                <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200/30 pb-1 last:border-0 last:pb-0">
                                    <span className="font-semibold text-slate-700">{formattedKey}:</span>
                                    <span className="text-red-500 line-through truncate max-w-[250px]" title={formatValue(oldVal)}>{formatValue(oldVal)}</span>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    };

    return (
        <Modal.Container open={open} onClose={onClose}>
            <Modal.Contents className="max-w-4xl! w-full rounded-2xl overflow-hidden p-0! bg-white shadow-xl">
                <Modal.Header.Container className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                        <Modal.Header.Title className="text-slate-800 flex items-center gap-2">
                            <DescriptionIcon className="text-blue-600" /> Detalhes do Processo
                        </Modal.Header.Title>
                        <span className="text-xs text-slate-400">ID: {processo.id}</span>
                    </div>
                    <Modal.Header.CloseButton onClick={onClose} />
                </Modal.Header.Container>

                <div className="overflow-y-auto p-6 max-h-[75vh] grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Panel: Basic info and Signatories */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <Typography variant="h6" className="font-extrabold text-slate-800 leading-snug mb-2">
                                {processo.titulo}
                            </Typography>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Chip
                                    label={processo.categoria}
                                    size="small"
                                    variant="outlined"
                                    className="text-slate-600! border-slate-200!"
                                />
                                <Chip
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    size="small"
                                    variant="filled"
                                    className="font-semibold!"
                                />
                                {processo.fluxo_sequencial && (
                                    <Chip
                                        label="Fluxo Sequencial"
                                        color="info"
                                        variant="outlined"
                                        size="small"
                                        icon={<HistoryIcon sx={{ fontSize: '14px!' }} />}
                                    />
                                )}
                            </div>

                            <Typography variant="caption" className="text-slate-400 block font-semibold uppercase text-[10px] mb-1">
                                Descrição
                            </Typography>
                            <Typography variant="body2" className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-4">
                                {processo.descricao}
                            </Typography>

                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    href={processo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<LaunchIcon sx={{ fontSize: '14px!' }} />}
                                    className="text-blue-600! border-blue-200! hover:bg-blue-50/50!"
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Abrir Documento do Processo
                                </Button>

                                {/* Action: Cancelar Processo (Requisito de Auditoria) */}
                                {['Pendente', 'Em aprovação'].includes(processo.status) && (
                                    <div className="mt-2 p-3.5 border border-red-100 bg-red-50/20 rounded-xl">
                                        {!confirmCancel ? (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                fullWidth
                                                startIcon={<CancelIcon />}
                                                onClick={() => setConfirmCancel(true)}
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                                className="text-red-600! border-red-200! hover:bg-red-50!"
                                            >
                                                Cancelar Processo
                                            </Button>
                                        ) : (
                                            <div className="flex flex-col gap-2 text-center">
                                                <Typography variant="caption" className="text-red-700 font-bold">
                                                    Deseja realmente cancelar este processo? Esta ação é irreversível.
                                                </Typography>
                                                <div className="flex gap-2 justify-center mt-1">
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={handleCancelProcess}
                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                        className="py-1 px-3"
                                                    >
                                                        Confirmar
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() => setConfirmCancel(false)}
                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                        className="py-1 px-3"
                                                    >
                                                        Voltar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Divider />

                        {/* Signatories Tracking */}
                        <div>
                            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-3">
                                Acompanhamento de Assinaturas
                            </Typography>

                            {processo.signatarios_assoc && processo.signatarios_assoc.length > 0 ? (
                                <ul className="flex flex-col gap-3">
                                    {processo.signatarios_assoc.map((assoc, idx) => (
                                        <li
                                            key={assoc.id}
                                            className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50/60 transition-all flex flex-col gap-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0">
                                                    <Typography variant="body2" className="font-semibold text-slate-800">
                                                        {assoc.signatario.nome}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-slate-400 block">
                                                        {assoc.signatario.cargo} • {assoc.signatario.setor}
                                                    </Typography>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
                                                    {getSignatarioStatusIcon(assoc.status)}
                                                    <span className={`text-xs font-semibold ${assoc.status === 'Aprovado' ? 'text-green-600' : assoc.status === 'Reprovado' ? 'text-red-600' : 'text-amber-600'}`}>
                                                        {assoc.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order badge for sequential flow */}
                                            {processo.fluxo_sequencial && assoc.ordem_assinatura && (
                                                <div className="mt-1">
                                                    <Chip
                                                        label={`Ordem: ${assoc.ordem_assinatura}º`}
                                                        size="small"
                                                        className="bg-slate-100! text-slate-500! font-medium! text-[10px]!"
                                                    />
                                                </div>
                                            )}

                                            {/* Response metadata */}
                                            {assoc.status !== 'Pendente' ? (
                                                <div className="mt-1 pt-1.5 border-t border-slate-100/50 flex flex-col gap-1 text-[11px] text-slate-500">
                                                    <div className="flex justify-between">
                                                        <span>Respondeu em:</span>
                                                        <span className="font-medium text-slate-700">{formatDateTime(assoc.respondido_em)}</span>
                                                    </div>
                                                    {assoc.ip_requisicao && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="flex items-center gap-0.5 text-slate-400"><SecurityIcon sx={{ fontSize: 10 }} /> IP:</span>
                                                            <span className="font-mono text-slate-600">{assoc.ip_requisicao}</span>
                                                        </div>
                                                    )}
                                                    {assoc.justificativa && (
                                                        <div className="mt-1 bg-red-50/30 border border-red-100/50 p-2 rounded-lg">
                                                            <span className="font-semibold text-red-700 block text-[10px] uppercase">Justificativa da Reprovação</span>
                                                            <span className="italic text-slate-600 text-[11px]">"{assoc.justificativa}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Action: Reenviar E-mail (Requisito de Auditoria) */
                                                ['Pendente', 'Em aprovação'].includes(processo.status) && (
                                                    <div className="mt-2 flex justify-end">
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            size="small"
                                                            startIcon={isResending === assoc.id ? <CircularProgress size={10} color="inherit" /> : <EmailIcon />}
                                                            disabled={isResending !== null}
                                                            onClick={() => handleResendEmail(assoc.id)}
                                                            sx={{ textTransform: 'none', fontSize: 10, py: 0.25, px: 1.5, fontWeight: 600 }}
                                                            className="text-purple-600! border-purple-200! hover:bg-purple-50! hover:border-purple-300!"
                                                        >
                                                            {isResending === assoc.id ? 'Enviando...' : 'Reenviar E-mail'}
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Typography variant="body2" className="text-slate-400 italic">
                                    Nenhum signatário associado a este processo.
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Audit History Timeline */}
                    <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                        <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                            Histórico de Auditoria do Processo
                        </Typography>

                        {/* Renders audit logs if they exist, otherwise falls back to basic status history */}
                        {processo.auditorias && processo.auditorias.length > 0 ? (
                            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                                {processo.auditorias.map((log, idx) => {
                                    const badge = getActionBadgeStyle(log.acao);
                                    let performerType = 'Sistema';
                                    let performerName = '';
                                    if (log.usuario) {
                                        performerType = 'Usuário';
                                        performerName = log.usuario.acesso;
                                    } else if (log.signatario) {
                                        performerType = 'Signatário';
                                        performerName = log.signatario.nome;
                                    }

                                    return (
                                        <div key={log.id} className="relative flex gap-3 pb-1">
                                            {/* Timeline connector line */}
                                            {idx !== (processo.auditorias?.length ?? 0) - 1 && (
                                                <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-100"></div>
                                            )}
                                            {/* Timeline bullet */}
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-1 z-10 border bg-white ${badge.dot === 'bg-green-600' ? 'border-green-300' : badge.dot === 'bg-red-600' ? 'border-red-300' : 'border-slate-300'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></div>
                                            </div>
                                            {/* Timeline card */}
                                            <div className="flex-1 bg-slate-50/60 p-3 rounded-xl border border-slate-100/80 shadow-sm">
                                                <div className="flex flex-wrap justify-between items-center gap-1.5 mb-1.5">
                                                    <Chip
                                                        label={log.acao}
                                                        size="small"
                                                        className={`${badge.bg} font-bold! text-[9px]! uppercase! border!`}
                                                    />
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {formatDateTime(log.created_at)}
                                                    </span>
                                                </div>

                                                {/* Performer Info */}
                                                <div className="flex items-center gap-1 mb-2 text-[10px] text-slate-500 font-medium">
                                                    {performerType === 'Usuário' ? (
                                                        <PersonIcon sx={{ fontSize: 12 }} className="text-blue-500" />
                                                    ) : performerType === 'Signatário' ? (
                                                        <PersonIcon sx={{ fontSize: 12 }} className="text-purple-500" />
                                                    ) : (
                                                        <SettingsIcon sx={{ fontSize: 12 }} className="text-slate-400" />
                                                    )}
                                                    <span>{performerType}: <strong className="text-slate-700">{performerName || 'Sistema'}</strong></span>
                                                </div>

                                                <Typography variant="body2" className="text-slate-700 text-xs leading-relaxed font-normal mb-1">
                                                    {log.descricao}
                                                </Typography>

                                                {/* Render data comparison */}
                                                {renderDiff(log.dados_anteriores, log.dados_novos)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : processo.historico && processo.historico.length > 0 ? (
                            <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
                                {processo.historico.map((log, idx) => (
                                    <div key={log.id} className="relative flex gap-3 pb-1">
                                        {/* Timeline connector lines */}
                                        {idx !== processo.historico!.length - 1 && (
                                            <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-150"></div>
                                        )}
                                        {/* Timeline bullet */}
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center mt-1 z-10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        </div>
                                        {/* Timeline content */}
                                        <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/70">
                                            <div className="flex justify-between items-start mb-1">
                                                <Chip
                                                    label={log.campo.toUpperCase()}
                                                    size="small"
                                                    className="bg-blue-50! text-blue-700! font-semibold! text-[9px]!"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatDateTime(log.created_at)}
                                                </span>
                                            </div>
                                            <Typography variant="body2" className="text-slate-700 text-xs leading-relaxed font-medium">
                                                {log.descricao}
                                            </Typography>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                                <Typography variant="body2" className="text-slate-400">
                                    Nenhum histórico registrado para este processo.
                                </Typography>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button variant="contained" onClick={onClose} color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Fechar
                    </Button>
                </div>
            </Modal.Contents>
        </Modal.Container>
    );
}
