import { router } from '@inertiajs/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderIcon from '@mui/icons-material/Folder';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LaunchIcon from '@mui/icons-material/Launch';
import LoopIcon from '@mui/icons-material/Loop';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import SearchIcon from '@mui/icons-material/Search';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import {
    Paper,
    Typography,
    Box,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Pagination,
    Chip,
    Alert,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControlLabel,
    Checkbox,
    IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { ProcessoDetalhesModal } from './components/Modals/ProcessoDetalhesModal';
import { Title } from './components/Title';

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

type TPaginatedProcessos = {
    current_page: number;
    data: TProcessoDetailed[];
    last_page: number;
    total: number;
};

type THomeProps = {
    metrics: {
        total: number;
        pendentes: number;
        em_aprovacao: number;
        aprovados: number;
        reprovados: number;
        tempo_medio: string;
    };
    filters: {
        status: string | null;
        categoria: string | null;
        signatario_id: string | null;
        data_inicio: string | null;
        data_fim: string | null;
        dias_atraso: number;
        apenas_atrasados: boolean;
    };
    processos: TPaginatedProcessos;
    atrasados: TProcessoDetailed[];
    signatarios: TSignatario[];
    categorias: string[];
};

export default function Home({
    metrics,
    filters,
    processos,
    atrasados = [],
    signatarios = [],
    categorias = [],
}: THomeProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoriaFilter, setCategoriaFilter] = useState(filters.categoria || '');
    const [signatarioFilter, setSignatarioFilter] = useState(filters.signatario_id || '');
    const [dataInicioFilter, setDataInicioFilter] = useState(filters.data_inicio || '');
    const [dataFimFilter, setDataFimFilter] = useState(filters.data_fim || '');
    const [diasAtrasoFilter, setDiasAtrasoFilter] = useState(filters.dias_atraso || 7);
    const [apenasAtrasadosFilter, setApenasAtrasadosFilter] = useState(filters.apenas_atrasados || false);

    const [alertsExpanded, setAlertsExpanded] = useState(false);
    const [selectedProcesso, setSelectedProcesso] = useState<TProcessoDetailed | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleApplyFilters = () => {
        router.get(
            '/dashboard/home',
            {
                status: statusFilter || null,
                categoria: categoriaFilter || null,
                signatario_id: signatarioFilter || null,
                data_inicio: dataInicioFilter || null,
                data_fim: dataFimFilter || null,
                dias_atraso: diasAtrasoFilter,
                apenas_atrasados: apenasAtrasadosFilter,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setCategoriaFilter('');
        setSignatarioFilter('');
        setDataInicioFilter('');
        setDataFimFilter('');
        setDiasAtrasoFilter(7);
        setApenasAtrasadosFilter(false);

        router.get('/dashboard/home', {}, { preserveState: true });
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        router.get(
            '/dashboard/home',
            {
                status: statusFilter || null,
                categoria: categoriaFilter || null,
                signatario_id: signatarioFilter || null,
                data_inicio: dataInicioFilter || null,
                data_fim: dataFimFilter || null,
                dias_atraso: diasAtrasoFilter,
                apenas_atrasados: apenasAtrasadosFilter,
                page: value,
            },
            { preserveState: true }
        );
    };

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'Pendente':
                return 'warning';
            case 'Em aprovação':
                return 'info';
            case 'Aprovado':
                return 'success';
            case 'Reprovado':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDateTime = (dateStr: string | null | undefined) => {
        if (!dateStr) {
return '';
}

        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout>
            <Box className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <Title>Acompanhamento de Processos</Title>
                </header>

                {/* 1. Indicadores Gerais Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {/* Total */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-indigo-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Total de Processos
                            </Typography>
                            <Typography variant="h4" className="font-extrabold text-slate-800">
                                {metrics.total}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                            <FolderIcon />
                        </div>
                    </Paper>

                    {/* Em aprovação */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-cyan-50/50 to-blue-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Em Aprovação
                            </Typography>
                            <Typography variant="h4" className="font-extrabold text-cyan-700">
                                {metrics.em_aprovacao}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                            <LoopIcon className="animate-spin-slow" />
                        </div>
                    </Paper>

                    {/* Pendentes */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-amber-50/50 to-orange-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Pendentes
                            </Typography>
                            <Typography variant="h4" className="font-extrabold text-amber-700">
                                {metrics.pendentes}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                            <PauseCircleIcon />
                        </div>
                    </Paper>

                    {/* Aprovados */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-green-50/50 to-emerald-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Aprovados
                            </Typography>
                            <Typography variant="h4" className="font-extrabold text-green-700">
                                {metrics.aprovados}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-500/20">
                            <CheckCircleIcon />
                        </div>
                    </Paper>

                    {/* Reprovados */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-red-50/50 to-rose-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Reprovados
                            </Typography>
                            <Typography variant="h4" className="font-extrabold text-red-700">
                                {metrics.reprovados}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                            <ErrorIcon />
                        </div>
                    </Paper>

                    {/* Tempo Médio */}
                    <Paper className="p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-purple-50/50 to-fuchsia-50/20">
                        <div>
                            <Typography variant="caption" className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                                Tempo Médio
                            </Typography>
                            <Typography variant="h6" className="font-extrabold text-purple-700 truncate max-w-[110px]" title={metrics.tempo_medio}>
                                {metrics.tempo_medio}
                            </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                            <TimerIcon />
                        </div>
                    </Paper>
                </div>

                {/* 2. Painel de Alertas de Atraso (Requisito 4) */}
                {atrasados.length > 0 && (
                    <Box className="w-full">
                        <Alert
                            severity="warning"
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={() => setAlertsExpanded(!alertsExpanded)}
                                    endIcon={alertsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    className="font-bold!"
                                    sx={{ textTransform: 'none' }}
                                >
                                    {alertsExpanded ? 'Ocultar' : 'Visualizar'}
                                </Button>
                            }
                            icon={<WarningIcon className="text-amber-600" />}
                            className="rounded-2xl border border-amber-200 bg-amber-50/40 text-amber-900 shadow-sm"
                        >
                            <Typography variant="body2" className="font-bold">
                                Atenção! Existem {atrasados.length} processos atrasados ou pendentes há mais de {filters.dias_atraso} dias.
                            </Typography>
                        </Alert>

                        <Collapse in={alertsExpanded}>
                            <Paper className="mt-2 p-4 border border-slate-150 rounded-2xl bg-white max-h-[300px] overflow-y-auto shadow-sm">
                                <ul className="flex flex-col gap-2.5">
                                    {atrasados.map((proc) => (
                                        <li
                                            key={proc.id}
                                            className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <Typography variant="body2" className="font-semibold text-slate-800 truncate">
                                                    {proc.titulo}
                                                </Typography>
                                                <Typography variant="caption" className="text-slate-400 block mt-0.5">
                                                    Criado em: {formatDateTime(proc.created_at)} ({Math.floor((Date.now() - new Date(proc.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias pendente) • Status: <strong>{proc.status}</strong>
                                                </Typography>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSelectedProcesso(proc);
                                                        setDetailsOpen(true);
                                                    }}
                                                    className="py-1! px-3! text-xs! font-bold!"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Auditoria
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Paper>
                        </Collapse>
                    </Box>
                )}

                {/* 3. Filtros Avançados (Requisito 2) */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                        <FilterListIcon sx={{ fontSize: 16 }} /> Filtros de Acompanhamento
                    </Typography>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
                        {/* Status */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="filter-status-label">Status</InputLabel>
                            <Select
                                labelId="filter-status-label"
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="Pendente">Pendente</MenuItem>
                                <MenuItem value="Em aprovação">Em Aprovação</MenuItem>
                                <MenuItem value="Aprovado">Aprovado</MenuItem>
                                <MenuItem value="Reprovado">Reprovado</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Categoria */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="filter-categoria-label">Categoria / Tipo</InputLabel>
                            <Select
                                labelId="filter-categoria-label"
                                value={categoriaFilter}
                                label="Categoria / Tipo"
                                onChange={(e) => setCategoriaFilter(e.target.value)}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {categorias.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Signatário */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="filter-signatario-label">Signatário</InputLabel>
                            <Select
                                labelId="filter-signatario-label"
                                value={signatarioFilter}
                                label="Signatário"
                                onChange={(e) => setSignatarioFilter(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {signatarios.map((sig) => (
                                    <MenuItem key={sig.id} value={sig.id}>
                                        {sig.nome} ({sig.cargo})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Dias atraso limit config */}
                        <TextField
                            label="Dias em Aberto (Atraso)"
                            type="number"
                            size="small"
                            fullWidth
                            value={diasAtrasoFilter}
                            onChange={(e) => setDiasAtrasoFilter(Number(e.target.value))}
                            slotProps={{
                                htmlInput: { min: 1 }
                            }}
                        />

                        {/* Period Data Inicio */}
                        <TextField
                            label="Período - De"
                            type="date"
                            size="small"
                            fullWidth
                            value={dataInicioFilter}
                            onChange={(e) => setDataInicioFilter(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />

                        {/* Period Data Fim */}
                        <TextField
                            label="Período - Até"
                            type="date"
                            size="small"
                            fullWidth
                            value={dataFimFilter}
                            onChange={(e) => setDataFimFilter(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />

                        {/* Checkbox Apenas Atrasados */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={apenasAtrasadosFilter}
                                    onChange={(e) => setApenasAtrasadosFilter(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" className="font-semibold text-slate-700">
                                    Filtrar apenas atrasados
                                </Typography>
                            }
                        />

                        {/* Buttons */}
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleClearFilters}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Limpar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={handleApplyFilters}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Filtrar
                            </Button>
                        </div>
                    </div>
                </Paper>

                {/* 4. Listagem e Histórico Completo de Alterações (Requisitos 2 e 3) */}
                <Paper className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                    <TableContainer>
                        <Table>
                            <TableHead className="bg-slate-50">
                                <TableRow>
                                    <TableCell className="font-bold! text-slate-700! text-xs! uppercase!">Processo</TableCell>
                                    <TableCell className="font-bold! text-slate-700! text-xs! uppercase!">Categoria</TableCell>
                                    <TableCell className="font-bold! text-slate-700! text-xs! uppercase!">Criado em</TableCell>
                                    <TableCell className="font-bold! text-slate-700! text-xs! uppercase!">Status</TableCell>
                                    <TableCell className="font-bold! text-slate-700! text-xs! uppercase!">Signatários (Status)</TableCell>
                                    <TableCell align="right" className="font-bold! text-slate-700! text-xs! uppercase!">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" className="py-8 text-slate-400 italic">
                                            Nenhum processo encontrado para os filtros selecionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    processos.data.map((proc) => (
                                        <TableRow key={proc.id} hover className="transition-colors">
                                            <TableCell className="py-4!">
                                                <Typography variant="body2" className="font-bold text-slate-800 line-clamp-1">
                                                    {proc.titulo}
                                                </Typography>
                                                <Typography variant="caption" className="text-slate-400 block line-clamp-1 max-w-sm">
                                                    {proc.descricao}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className="py-4!">
                                                <Chip label={proc.categoria} variant="outlined" size="small" className="text-slate-500! border-slate-200! text-[11px]!" />
                                            </TableCell>
                                            <TableCell className="py-4! text-slate-600 text-xs font-medium">
                                                {formatDateTime(proc.created_at)}
                                            </TableCell>
                                            <TableCell className="py-4!">
                                                <Chip
                                                    label={proc.status}
                                                    color={getStatusChipColor(proc.status)}
                                                    size="small"
                                                    className="font-semibold! text-[11px]!"
                                                />
                                            </TableCell>
                                            <TableCell className="py-4!">
                                                <Box className="flex flex-wrap gap-1 max-w-xs">
                                                    {proc.signatarios_assoc?.map((assoc) => (
                                                        <Chip
                                                            key={assoc.id}
                                                            label={`${assoc.signatario.nome.split(' ')[0]} (${assoc.status[0]})`}
                                                            size="small"
                                                            color={getStatusChipColor(assoc.status)}
                                                            variant="outlined"
                                                            className="text-[10px]! font-medium!"
                                                            title={`${assoc.signatario.nome} - ${assoc.status}`}
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" className="py-4!">
                                                <Box className="flex justify-end gap-1.5">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedProcesso(proc);
                                                            setDetailsOpen(true);
                                                        }}
                                                        className="shadow-sm! text-xs! py-1! px-3!"
                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        Ver Histórico
                                                    </Button>
                                                    <IconButton
                                                        size="small"
                                                        href={proc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="border border-slate-200! bg-slate-50! hover:bg-slate-100! text-slate-600!"
                                                    >
                                                        <LaunchIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {processos.last_page > 1 && (
                        <Box className="flex justify-center p-5 border-t border-slate-100">
                            <Pagination
                                count={processos.last_page}
                                page={processos.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="medium"
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Modal de Detalhes e Histórico de Status Completo (Requisito 3) */}
            <ProcessoDetalhesModal
                open={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false);
                    setSelectedProcesso(null);
                }}
                processo={selectedProcesso}
            />
        </DashboardLayout>
    );
}
