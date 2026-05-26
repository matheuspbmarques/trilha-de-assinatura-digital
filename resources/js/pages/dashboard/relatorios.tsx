import { router } from '@inertiajs/react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StorageIcon from '@mui/icons-material/Storage';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import TerminalIcon from '@mui/icons-material/Terminal';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { Title } from './components/Title';

type TStatusReportItem = {
    status: string;
    quantidade: number;
    percentual: number;
};

type TProdutividadeReportItem = {
    signatario_id: string;
    nome: string;
    cargo: string;
    setor: string;
    aprovacoes: number;
    reprovacoes: number;
    tempo_medio: string;
    tempo_medio_seconds: number;
};

type TPeriodoReportItem = {
    periodo: string;
    criados: number;
    concluidos: number;
};

type TCategoriaReportItem = {
    categoria: string;
    quantidade: number;
    percentual: number;
};

type TReprovacaoReportItem = {
    processo_titulo: string;
    signatario_nome: string;
    data_reprovacao: string;
    justificativa: string;
};

type TRelatoriosProps = {
    filters: {
        data_inicio: string;
        data_fim: string;
        agrupamento: 'dia' | 'semana' | 'mes';
    };
    statusReport: TStatusReportItem[];
    produtividadeReport: TProdutividadeReportItem[];
    periodoReport: TPeriodoReportItem[];
    reprovacoesReport: TReprovacaoReportItem[];
    categoriaReport?: TCategoriaReportItem[];
    datalakeSimulation?: {
        success: boolean;
        partitions: string[];
        count: number;
    } | null;
    successMsg?: string | null;
};

export default function Relatorios({
    filters,
    statusReport = [],
    produtividadeReport = [],
    periodoReport = [],
    reprovacoesReport = [],
    categoriaReport = [],
    datalakeSimulation = null,
    successMsg = null,
}: TRelatoriosProps) {
    const [dataInicioFilter, setDataInicioFilter] = useState(filters.data_inicio || '');
    const [dataFimFilter, setDataFimFilter] = useState(filters.data_fim || '');
    const [agrupamentoFilter, setAgrupamentoFilter] = useState(filters.agrupamento || 'dia');

    const [loadingConsolidation, setLoadingConsolidation] = useState(false);
    const [loadingSimulation, setLoadingSimulation] = useState(false);
    const [isDatalakeModalOpen, setIsDatalakeModalOpen] = useState(datalakeSimulation !== null);

    const handleConsolidate = () => {
        setLoadingConsolidation(true);
        router.post('/dashboard/relatorios/consolidar', {}, {
            preserveState: true,
            onFinish: () => setLoadingConsolidation(false)
        });
    };

    const handleSimulateDatalake = () => {
        setLoadingSimulation(true);
        router.post('/dashboard/relatorios/simular-datalake', {}, {
            preserveState: true,
            onSuccess: () => {
                setIsDatalakeModalOpen(true);
            },
            onFinish: () => setLoadingSimulation(false)
        });
    };

    const handleApplyFilters = () => {
        router.get(
            '/dashboard/relatorios',
            {
                data_inicio: dataInicioFilter || null,
                data_fim: dataFimFilter || null,
                agrupamento: agrupamentoFilter,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        // Padrão de 30 dias atrás
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);
        const defaultStartStr = defaultStart.toISOString().split('T')[0];
        const defaultEndStr = new Date().toISOString().split('T')[0];

        setDataInicioFilter(defaultStartStr);
        setDataFimFilter(defaultEndStr);
        setAgrupamentoFilter('dia');

        router.get('/dashboard/relatorios', {}, { preserveState: true });
    };

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

    const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
        // Build CSV string using semicolon delimiter for Excel compatibility in pt-BR locale
        const csvContent = [
            headers.join(';'),
            ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        // Add UTF-8 BOM (\uFEFF) for Excel compatibility with special characters
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportStatus = () => {
        const headers = ['Status', 'Quantidade', 'Percentual (%)'];
        const rows = statusReport.map(item => [
            item.status,
            String(item.quantidade),
            `${item.percentual}%`
        ]);
        downloadCSV(headers, rows, `relatorio_status_${filters.data_inicio}_a_${filters.data_fim}`);
    };

    const handleExportCategoria = () => {
        const headers = ['Categoria', 'Quantidade', 'Percentual (%)'];
        const rows = categoriaReport.map(item => [
            item.categoria,
            String(item.quantidade),
            `${item.percentual}%`
        ]);
        downloadCSV(headers, rows, `relatorio_categorias_${filters.data_inicio}_a_${filters.data_fim}`);
    };

    const handleExportPeriodo = () => {
        const headers = ['Período', 'Criados', 'Concluídos'];
        const rows = periodoReport.map(item => [
            item.periodo,
            String(item.criados),
            String(item.concluidos)
        ]);
        downloadCSV(headers, rows, `relatorio_periodo_${filters.data_inicio}_a_${filters.data_fim}`);
    };

    const handleExportProdutividade = () => {
        const headers = ['Signatário', 'Cargo', 'Setor', 'Aprovações', 'Reprovações', 'Tempo Médio de Resposta'];
        const rows = produtividadeReport.map(item => [
            item.nome,
            item.cargo,
            item.setor,
            String(item.aprovacoes),
            String(item.reprovacoes),
            item.tempo_medio
        ]);
        downloadCSV(headers, rows, `relatorio_produtividade_${filters.data_inicio}_a_${filters.data_fim}`);
    };

    const handleExportReprovacoes = () => {
        const headers = ['Processo', 'Signatário', 'Data da Reprovação', 'Justificativa'];
        const rows = reprovacoesReport.map(item => [
            item.processo_titulo,
            item.signatario_nome,
            formatDateTime(item.data_reprovacao),
            item.justificativa
        ]);
        downloadCSV(headers, rows, `relatorio_reprovacoes_${filters.data_inicio}_a_${filters.data_fim}`);
    };

    // Obter cor do badge do status do processo
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Pendente':
                return { text: 'text-amber-700', bg: 'bg-amber-100', fill: '#f59e0b', gradient: 'from-amber-400 to-orange-500' };
            case 'Em aprovação':
                return { text: 'text-cyan-700', bg: 'bg-cyan-100', fill: '#06b6d4', gradient: 'from-cyan-400 to-blue-500' };
            case 'Aprovado':
                return { text: 'text-green-700', bg: 'bg-green-100', fill: '#10b981', gradient: 'from-green-400 to-emerald-600' };
            case 'Reprovado':
                return { text: 'text-red-700', bg: 'bg-red-100', fill: '#ef4444', gradient: 'from-red-400 to-rose-600' };
            case 'Cancelado':
            default:
                return { text: 'text-slate-700', bg: 'bg-slate-100', fill: '#6b7280', gradient: 'from-slate-400 to-slate-600' };
        }
    };

    // Cálculos para o Gráfico de Barras Vertical (Processos por Período)
    const maxPeriodoVal = Math.max(
        1,
        ...periodoReport.map(d => Math.max(d.criados, d.concluidos))
    );

    // Renderiza o gráfico SVG de colunas/barras verticais
    const renderPeriodChart = () => {
        if (periodoReport.length === 0) {
            return (
                <div className="py-12 text-center text-slate-400 italic">
                    Nenhum dado disponível no período selecionado.
                </div>
            );
        }

        const height = 240;
        const paddingBottom = 40;
        const paddingTop = 20;
        const chartHeight = height - paddingBottom - paddingTop;
        const barWidth = 14;
        const gap = 16;
        const groupWidth = barWidth * 2 + 4; // Duas barras (criados e concluidos) + pequeno espaço
        const svgWidth = Math.max(800, periodoReport.length * (groupWidth + gap) + 60);

        return (
            <div className="w-full overflow-x-auto pb-2">
                <svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
                    {/* Linhas de grade horizontais */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const y = paddingTop + chartHeight * (1 - pct);
                        const val = Math.round(maxPeriodoVal * pct);

                        return (
                            <g key={idx}>
                                <line x1="45" y1={y} x2={svgWidth - 10} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                                <text x="35" y={y + 4} textAnchor="end" fontSize="10" className="fill-slate-400 font-semibold font-mono">
                                    {val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Barras e labels */}
                    {periodoReport.map((item, idx) => {
                        const x = 60 + idx * (groupWidth + gap);
                        const criadoHeight = (item.criados / maxPeriodoVal) * chartHeight;
                        const concluidoHeight = (item.concluidos / maxPeriodoVal) * chartHeight;

                        const yCriado = paddingTop + chartHeight - criadoHeight;
                        const yConcluido = paddingTop + chartHeight - concluidoHeight;

                        return (
                            <g key={idx} className="group">
                                {/* Barra de Criados (Azul) */}
                                <rect
                                    x={x}
                                    y={yCriado}
                                    width={barWidth}
                                    height={criadoHeight}
                                    fill="url(#blueGrad)"
                                    rx="3"
                                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                                />
                                {/* Barra de Concluídos (Verde) */}
                                <rect
                                    x={x + barWidth + 2}
                                    y={yConcluido}
                                    width={barWidth}
                                    height={concluidoHeight}
                                    fill="url(#greenGrad)"
                                    rx="3"
                                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                                />

                                {/* Tooltips ou textos informativos no topo das barras quando em hover */}
                                <text
                                    x={x + barWidth}
                                    y={Math.min(yCriado, yConcluido) - 8}
                                    textAnchor="middle"
                                    fontSize="10"
                                    className="fill-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                >
                                    {`C: ${item.criados} | F: ${item.concluidos}`}
                                </text>

                                {/* Label do período */}
                                <text
                                    x={x + barWidth}
                                    y={height - 12}
                                    textAnchor="middle"
                                    fontSize="10"
                                    className="fill-slate-500 font-semibold"
                                >
                                    {item.periodo}
                                </text>
                            </g>
                        );
                    })}

                    {/* Definições de gradiente */}
                    <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <Box className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <Title>Relatórios Gerenciais</Title>
                </header>

                {successMsg && (
                    <Alert severity="success" className="rounded-xl shadow-sm border border-green-100 font-medium">
                        {successMsg}
                    </Alert>
                )}

                {/* Datalake & Base Analítica Panel */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <StorageIcon />
                        </div>
                        <div>
                            <Typography variant="subtitle1" className="font-extrabold text-slate-800 leading-tight">
                                Datalake & Base Analítica
                            </Typography>
                            <Typography variant="caption" className="text-slate-400">
                                Consolidação e exportação de dados analíticos para ferramentas de BI e pipelines externos.
                            </Typography>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Card 1: Banco de Dados Analítico */}
                        <Box className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                            <div>
                                <Typography variant="subtitle2" className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                                    <StorageIcon sx={{ fontSize: 18 }} className="text-blue-500" /> Tabela Analítica (DB)
                                </Typography>
                                <Typography variant="caption" className="text-slate-400 block mb-4">
                                    Gera e atualiza a tabela <code>processos_analiticos</code> de forma denormalizada e otimizada para consultas BI.
                                </Typography>
                            </div>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConsolidate}
                                disabled={loadingConsolidation}
                                className="w-full text-xs!"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {loadingConsolidation ? 'Consolidando...' : 'Consolidar no Banco'}
                            </Button>
                        </Box>

                        {/* Card 2: Exportação de Arquivos */}
                        <Box className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                            <div>
                                <Typography variant="subtitle2" className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                                    <DownloadIcon sx={{ fontSize: 18 }} className="text-emerald-500" /> Exportação de Arquivos
                                </Typography>
                                <Typography variant="caption" className="text-slate-400 block mb-4">
                                    Baixe a base analítica consolidada em formato CSV ou JSON contendo métricas e tempos de resposta.
                                </Typography>
                            </div>
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    href="/dashboard/relatorios/download-csv"
                                    target="_blank"
                                    className="flex-1 text-xs!"
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Baixar CSV
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    href="/dashboard/relatorios/download-json"
                                    target="_blank"
                                    className="flex-1 text-xs!"
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Baixar JSON
                                </Button>
                            </div>
                        </Box>

                        {/* Card 3: Estrutura Datalake Simulação */}
                        <Box className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                            <div>
                                <Typography variant="subtitle2" className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                                    <CloudQueueIcon sx={{ fontSize: 18 }} className="text-purple-500" /> Simulação de Datalake
                                </Typography>
                                <Typography variant="caption" className="text-slate-400 block mb-4">
                                    Simula um repositório particionado em diretórios (Hive partition) na pasta do servidor.
                                </Typography>
                            </div>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleSimulateDatalake}
                                disabled={loadingSimulation}
                                className="w-full text-xs!"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {loadingSimulation ? 'Simulando...' : 'Simular Particionamento'}
                            </Button>
                        </Box>
                    </div>
                </Paper>

                {/* Filtros Globais */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                        <FilterListIcon sx={{ fontSize: 16 }} /> Filtros do Período
                    </Typography>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
                        {/* Período - De */}
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

                        {/* Período - Até */}
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

                        {/* Agrupamento */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="report-group-label">Agrupamento Temporal</InputLabel>
                            <Select
                                labelId="report-group-label"
                                value={agrupamentoFilter}
                                label="Agrupamento Temporal"
                                onChange={(e) => setAgrupamentoFilter(e.target.value as 'dia' | 'semana' | 'mes')}
                            >
                                <MenuItem value="dia">Por Dia</MenuItem>
                                <MenuItem value="semana">Por Semana</MenuItem>
                                <MenuItem value="mes">Por Mês</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Botões de Ação */}
                        <div className="flex gap-2 justify-end sm:col-span-1">
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleClearFilters}
                                startIcon={<ClearAllIcon />}
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
                                Gerar Relatórios
                            </Button>
                        </div>
                    </div>
                </Paper>

                {/* Seção 1: Processos por Status & Distribuição por Categoria */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Processos por Status (Proporção e Barras) */}
                    <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <Typography variant="subtitle1" className="font-extrabold text-slate-800 flex items-center gap-2">
                                    <AssessmentIcon className="text-blue-600" /> Distribuição por Status
                                </Typography>
                                <Button size="small" variant="text" onClick={handleExportStatus} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700 }} className="text-xs!">
                                    Exportar
                                </Button>
                            </div>
                            <Typography variant="caption" className="text-slate-400 block mb-6">
                                Quantidade e percentual de processos no período.
                            </Typography>

                            <div className="flex flex-col gap-4">
                                {statusReport.map((item) => {
                                    const colors = getStatusColors(item.status);

                                    return (
                                        <div key={item.status} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-700">{item.status}</span>
                                                <span className="font-mono font-semibold text-slate-500">
                                                    {item.quantidade} ({item.percentual}%)
                                                </span>
                                            </div>
                                            {/* Barra de Progresso Customizada */}
                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                                                    style={{ width: `${item.percentual}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legenda Resumida */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Geral</span>
                            <span className="font-mono text-sm font-extrabold text-slate-800">
                                {statusReport.reduce((acc, curr) => acc + curr.quantidade, 0)} processos
                            </span>
                        </div>
                    </Paper>

                    {/* 2. Processos por Categoria (Proporção e Barras) */}
                    <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <Typography variant="subtitle1" className="font-extrabold text-slate-800 flex items-center gap-2">
                                    <AssessmentIcon className="text-purple-600" /> Distribuição por Categoria
                                </Typography>
                                <Button size="small" variant="text" onClick={handleExportCategoria} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700 }} className="text-xs!">
                                    Exportar
                                </Button>
                            </div>
                            <Typography variant="caption" className="text-slate-400 block mb-6">
                                Volume absoluto e percentual de processos por categoria de documento.
                            </Typography>

                            <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-1">
                                {categoriaReport.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 italic">
                                        Nenhuma categoria registrada no período.
                                    </div>
                                ) : (
                                    categoriaReport.map((item) => (
                                        <div key={item.categoria} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-700">{item.categoria}</span>
                                                <span className="font-mono font-semibold text-slate-500">
                                                    {item.quantidade} ({item.percentual}%)
                                                </span>
                                            </div>
                                            {/* Barra de Progresso Customizada (Gradiente Roxo/Violeta) */}
                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-600 transition-all duration-500"
                                                    style={{ width: `${item.percentual}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Legenda Resumida */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categorias Ativas</span>
                            <span className="font-mono text-sm font-extrabold text-slate-800">
                                {categoriaReport.length} tipos de processos
                            </span>
                        </div>
                    </Paper>
                </div>

                {/* Seção 2: Histórico Temporal (Volume por Período) */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <Typography variant="subtitle1" className="font-extrabold text-slate-800 flex items-center gap-2">
                                <DateRangeIcon className="text-blue-600" /> Volume por Período
                            </Typography>
                            <Button size="small" variant="text" onClick={handleExportPeriodo} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700 }} className="text-xs!">
                                Exportar
                            </Button>
                        </div>
                        <Typography variant="caption" className="text-slate-400 block mb-6">
                            Relação entre processos criados e concluídos agrupados temporalmente.
                        </Typography>

                        {renderPeriodChart()}
                    </div>

                    {/* Legenda do Gráfico */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-400 to-blue-600" />
                            <span className="text-slate-600">Criados</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-green-400 to-green-600" />
                            <span className="text-slate-600">Concluídos</span>
                        </div>
                    </div>
                </Paper>

                {/* Seção 2: Produtividade por Signatário */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <div className="flex justify-between items-start mb-1">
                        <Typography variant="subtitle1" className="font-extrabold text-slate-800 flex items-center gap-2">
                            <PeopleIcon className="text-blue-600" /> Produtividade por Signatário
                        </Typography>
                        <Button size="small" variant="text" onClick={handleExportProdutividade} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700 }} className="text-xs!">
                            Exportar
                        </Button>
                    </div>
                    <Typography variant="caption" className="text-slate-400 block mb-4">
                        Acompanhamento do volume de respostas e tempo médio de retorno de cada signatário.
                    </Typography>

                    <TableContainer className="border border-slate-100 rounded-xl overflow-hidden">
                        <Table size="small">
                            <TableHead className="bg-slate-50">
                                <TableRow>
                                    <TableCell className="font-bold! text-slate-700! py-3!">Signatário</TableCell>
                                    <TableCell className="font-bold! text-slate-700! py-3!">Cargo / Setor</TableCell>
                                    <TableCell align="center" className="font-bold! text-slate-700! py-3!">Aprovações</TableCell>
                                    <TableCell align="center" className="font-bold! text-slate-700! py-3!">Reprovações</TableCell>
                                    <TableCell align="center" className="font-bold! text-slate-700! py-3!">Tempo Médio de Resposta</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produtividadeReport.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" className="py-8 text-slate-400 italic">
                                            Nenhuma assinatura registrada no período.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    produtividadeReport.map((row) => (
                                        <TableRow key={row.signatario_id} hover>
                                            <TableCell className="py-3.5! font-bold text-slate-800">
                                                {row.nome}
                                            </TableCell>
                                            <TableCell className="py-3.5! text-slate-500 text-xs">
                                                {row.cargo} • {row.setor}
                                            </TableCell>
                                            <TableCell align="center" className="py-3.5!">
                                                {row.aprovacoes > 0 ? (
                                                    <Chip label={row.aprovacoes} size="small" className="bg-green-50! text-green-700! font-bold!" />
                                                ) : (
                                                    <span className="text-slate-300 font-bold">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" className="py-3.5!">
                                                {row.reprovacoes > 0 ? (
                                                    <Chip label={row.reprovacoes} size="small" className="bg-red-50! text-red-700! font-bold!" />
                                                ) : (
                                                    <span className="text-slate-300 font-bold">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" className="py-3.5! font-mono text-xs font-bold text-purple-700">
                                                <Chip
                                                    label={row.tempo_medio}
                                                    size="small"
                                                    color={row.tempo_medio === 'N/A' ? 'default' : 'secondary'}
                                                    variant="outlined"
                                                    className="font-bold!"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Seção 3: Histórico Detalhado de Reprovações */}
                <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <div className="flex justify-between items-start mb-1">
                        <Typography variant="subtitle1" className="font-extrabold text-slate-800 flex items-center gap-2">
                            <WarningAmberIcon className="text-red-500" /> Detalhamento de Reprovações
                        </Typography>
                        <Button size="small" variant="text" onClick={handleExportReprovacoes} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 700 }} className="text-xs!">
                            Exportar
                        </Button>
                    </div>
                    <Typography variant="caption" className="text-slate-400 block mb-4">
                        Justificativas formais preenchidas pelos signatários ao reprovar processos.
                    </Typography>

                    <TableContainer className="border border-slate-100 rounded-xl overflow-hidden">
                        <Table size="small">
                            <TableHead className="bg-slate-50">
                                <TableRow>
                                    <TableCell className="font-bold! text-slate-700! py-3! w-1/4">Processo</TableCell>
                                    <TableCell className="font-bold! text-slate-700! py-3! w-1/4">Signatário</TableCell>
                                    <TableCell className="font-bold! text-slate-700! py-3! w-1/6">Data</TableCell>
                                    <TableCell className="font-bold! text-slate-700! py-3!">Justificativa</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reprovacoesReport.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" className="py-8 text-slate-400 italic">
                                            Nenhuma reprovação registrada no período.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reprovacoesReport.map((row, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell className="py-3.5! font-bold text-slate-800">
                                                {row.processo_titulo}
                                            </TableCell>
                                            <TableCell className="py-3.5! text-slate-600 font-semibold text-xs">
                                                {row.signatario_nome}
                                            </TableCell>
                                            <TableCell className="py-3.5! text-slate-500 text-xs font-medium">
                                                {formatDateTime(row.data_reprovacao)}
                                            </TableCell>
                                            <TableCell className="py-3.5! italic text-slate-600 text-xs leading-relaxed bg-red-50/20">
                                                "{row.justificativa}"
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Modal para Visualização da Simulação de Datalake */}
                <Dialog
                    open={isDatalakeModalOpen}
                    onClose={() => setIsDatalakeModalOpen(false)}
                    maxWidth="md"
                    fullWidth
                    sx={{ '& .MuiPaper-root': { borderRadius: '16px' } }}
                >
                    <DialogTitle className="border-b border-slate-100 flex items-center gap-2">
                        <TerminalIcon className="text-slate-700" />
                        <span className="font-bold text-slate-800 text-lg">Datalake Simulado - Estrutura de Partições</span>
                    </DialogTitle>
                    <DialogContent className="pt-6">
                        <Typography variant="body2" className="text-slate-600 mb-4">
                            Abaixo está a representação da estrutura de pastas gerada sob o diretório <code>storage/app/datalake/</code>, particionada por data de criação do processo (padrão Hive Partitioning):
                        </Typography>

                        {datalakeSimulation ? (
                            <Box className="bg-slate-950 text-emerald-400 p-6 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                                <div>$ tree storage/app/datalake</div>
                                <div className="text-slate-400 mt-2">storage/app/datalake/</div>
                                <div className="text-slate-400">├── processos_analiticos.csv <span className="text-slate-500">(base analítica consolidada)</span></div>
                                <div className="text-slate-400">├── processos_analiticos.json <span className="text-slate-500">(base analítica consolidada)</span></div>
                                
                                {datalakeSimulation.partitions.map((partition, index) => {
                                    const parts = partition.replace('datalake/', '').split('/');
                                    const isLast = index === datalakeSimulation.partitions.length - 1;
                                    const connector = isLast ? '└── ' : '├── ';
                                    
                                    return (
                                        <div key={index} className="pl-4 mt-2">
                                            <span className="text-amber-500">{connector}{parts[0]}</span>
                                            <div className="pl-8 text-blue-400">└── {parts[1]}</div>
                                            <div className="pl-12 text-teal-400">└── {parts[2]}</div>
                                            <div className="pl-16 text-slate-400">├── processos.json</div>
                                            <div className="pl-16 text-slate-400">└── processos.csv</div>
                                        </div>
                                    );
                                })}
                                
                                <div className="text-emerald-500/80 mt-4 border-t border-slate-800 pt-3">
                                    ✔ {datalakeSimulation.count} registros exportados e particionados com sucesso em {datalakeSimulation.partitions.length} diretórios.
                                </div>
                            </Box>
                        ) : (
                            <Typography variant="body2" className="text-slate-400 italic text-center py-6">
                                Nenhum dado de simulação disponível. Execute a simulação para gerar os arquivos.
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions className="border-t border-slate-100 p-4">
                        <Button onClick={() => setIsDatalakeModalOpen(false)} variant="contained" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
