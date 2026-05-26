import { Divider, Typography, Chip, Box, Button } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LaunchIcon from '@mui/icons-material/Launch';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import { Modal } from '@/components/Modal';

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
    signatarios_assoc?: TSignatarioAssoc[];
};

type TProcessoDetalhesModalProps = {
    open: boolean;
    onClose(): void;
    processo: TProcessoDetailed | null;
};

export function ProcessoDetalhesModal({ open, onClose, processo }: TProcessoDetalhesModalProps) {
    if (!processo) return null;

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
                                            {assoc.status !== 'Pendente' && (
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

                    {/* Right Panel: Status History Timeline */}
                    <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                        <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                            Histórico de Status do Processo
                        </Typography>

                        {processo.historico && processo.historico.length > 0 ? (
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
                    <Button variant="contained" onClick={onClose} color="primary">
                        Fechar
                    </Button>
                </div>
            </Modal.Contents>
        </Modal.Container>
    );
}
