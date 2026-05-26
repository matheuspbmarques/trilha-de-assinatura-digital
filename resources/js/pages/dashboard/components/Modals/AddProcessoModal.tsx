import { useForm } from '@inertiajs/react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';
import {
    Button,
    TextField,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormHelperText,
    Typography,
    Paper,
    InputAdornment,
} from '@mui/material';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import { IconButton } from '@/components/IconButton';
import type { TSignatario } from '@/types/signatarios.types';

type TAddProcessoModalProps = {
    open: boolean;
    onClose(): void;
    onCreate(): void;
    signatarios: TSignatario[];
};

const CATEGORIES = [
    'Contratos',
    'Recursos Humanos',
    'Financeiro',
    'Jurídico',
    'Compras',
    'Vendas',
    'Administrativo',
    'Tecnologia',
];

export function AddProcessoModal({ open, onClose, onCreate, signatarios }: TAddProcessoModalProps) {
    const { errors, setData, post, clearErrors, processing, reset, data } = useForm({
        titulo: '',
        descricao: '',
        categoria: '',
        arquivo: null as File | null,
        fluxo_sequencial: false,
        signatarios: [] as string[], // array of signatory IDs in order
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        clearErrors('arquivo');
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB

            // Validate file extension on client side
            const allowedExtensions = ['pdf', 'jpeg', 'png', 'jpg'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

            if (!allowedExtensions.includes(fileExtension)) {
                setFileError('O arquivo deve ser PDF ou imagem (jpeg, png, jpg).');
                setData('arquivo', null);
                return;
            }

            if (file.size > maxSize) {
                setFileError('O arquivo excede o tamanho máximo de 5MB.');
                setData('arquivo', null);
                return;
            }

            setData('arquivo', file);
        }
    };

    const handleRemoveFile = () => {
        setData('arquivo', null);
        setFileError('');
        clearErrors('arquivo');
    };

    const addSignatario = (id: string) => {
        if (!data.signatarios.includes(id)) {
            setData('signatarios', [...data.signatarios, id]);
            clearErrors('signatarios');
        }
    };

    const removeSignatario = (id: string) => {
        setData('signatarios', data.signatarios.filter((sId) => sId !== id));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newList = [...data.signatarios];
        const temp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = temp;
        setData('signatarios', newList);
    };

    const moveDown = (index: number) => {
        if (index === data.signatarios.length - 1) return;
        const newList = [...data.signatarios];
        const temp = newList[index];
        newList[index] = newList[index + 1];
        newList[index + 1] = temp;
        setData('signatarios', newList);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/api/processos', {
            onSuccess: () => {
                reset();
                setSearchQuery('');
                setFileError('');
                onClose();
                onCreate();
            },
        });
    };

    // Filter signatarios by query
    const filteredAvailableSignatarios = signatarios.filter((s) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
            s.nome.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            s.cargo.toLowerCase().includes(query) ||
            s.setor.toLowerCase().includes(query);
        const isNotSelected = !data.signatarios.includes(s.id);
        return matchesQuery && isNotSelected;
    });

    // Get selected signatarios details in order
    const selectedSignatariosDetails = data.signatarios
        .map((id) => signatarios.find((s) => s.id === id))
        .filter((s): s is TSignatario => !!s);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <Modal.Container open={open} onClose={onClose}>
            <Modal.Contents className="max-w-4xl! w-full rounded-2xl overflow-hidden p-0! bg-white">
                <Modal.Header.Container className="p-6 bg-slate-50 border-b border-slate-100">
                    <Modal.Header.Title className="text-slate-800">
                        Criar Novo Processo
                    </Modal.Header.Title>
                    <Modal.Header.CloseButton onClick={onClose} />
                </Modal.Header.Container>

                <form onSubmit={submit} className="flex flex-col h-[75vh] md:h-[70vh]">
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Form Details & File Upload */}
                        <div className="flex flex-col gap-5">
                            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                                Informações Gerais
                            </Typography>
                            
                            <TextField
                                label="Título do Processo"
                                value={data.titulo}
                                error={!!errors.titulo}
                                helperText={errors.titulo}
                                onChange={(e) => {
                                    setData('titulo', e.target.value);
                                    clearErrors('titulo');
                                }}
                                disabled={processing}
                                fullWidth
                                variant="outlined"
                                size="small"
                            />

                            <TextField
                                label="Descrição"
                                value={data.descricao}
                                error={!!errors.descricao}
                                helperText={errors.descricao}
                                onChange={(e) => {
                                    setData('descricao', e.target.value);
                                    clearErrors('descricao');
                                }}
                                disabled={processing}
                                multiline
                                rows={3}
                                fullWidth
                                variant="outlined"
                                size="small"
                            />

                            <FormControl fullWidth size="small" error={!!errors.categoria}>
                                <InputLabel id="categoria-select-label">Categoria</InputLabel>
                                <Select
                                    labelId="categoria-select-label"
                                    value={data.categoria}
                                    label="Categoria"
                                    onChange={(e) => {
                                        setData('categoria', e.target.value);
                                        clearErrors('categoria');
                                    }}
                                    disabled={processing}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.categoria && <FormHelperText>{errors.categoria}</FormHelperText>}
                            </FormControl>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.fluxo_sequencial}
                                        onChange={(e) => setData('fluxo_sequencial', e.target.checked)}
                                        disabled={processing}
                                        color="primary"
                                    />
                                }
                                label={
                                    <div className="flex flex-col">
                                        <Typography variant="body2" className="font-semibold text-slate-700">
                                            Fluxo Sequencial
                                        </Typography>
                                        <Typography variant="caption" className="text-slate-400">
                                            Os signatários assinarão em ordem pré-definida
                                        </Typography>
                                    </div>
                                }
                                className="mt-1"
                            />

                            {/* File Upload Section */}
                            <div className="flex flex-col gap-2 mt-2">
                                <Typography variant="caption" className="text-slate-500 font-semibold">
                                    Documento do Processo (PDF ou Imagem - Máx 5MB)
                                </Typography>
                                
                                {!data.arquivo ? (
                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all">
                                        <FileUploadIcon className="text-slate-400 mb-2" fontSize="large" />
                                        <Typography variant="body2" className="text-slate-600 font-medium">
                                            Clique para selecionar o arquivo
                                        </Typography>
                                        <Typography variant="caption" className="text-slate-400 mt-1">
                                            PDF, PNG, JPG ou JPEG
                                        </Typography>
                                        <input
                                            type="file"
                                            accept=".pdf,image/jpeg,image/png,image/jpg"
                                            onChange={handleFileChange}
                                            disabled={processing}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <Paper className="p-4 border border-slate-200 shadow-none rounded-xl flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                                                <FileUploadIcon />
                                            </div>
                                            <div className="min-w-0">
                                                <Typography variant="body2" className="font-semibold text-slate-700 truncate">
                                                    {data.arquivo.name}
                                                </Typography>
                                                <Typography variant="caption" className="text-slate-400 block">
                                                    Tamanho: {formatBytes(data.arquivo.size)}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={handleRemoveFile}
                                            disabled={processing}
                                            className="min-w-0 px-2!"
                                        >
                                            Remover
                                        </Button>
                                    </Paper>
                                )}

                                {(fileError || errors.arquivo) && (
                                    <FormHelperText error className="mt-1">
                                        {fileError || errors.arquivo}
                                    </FormHelperText>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Signatories Selection */}
                        <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                                Signatários
                            </Typography>

                            {/* Selected Signatories Header */}
                            <div className="flex flex-col gap-2">
                                <Typography variant="caption" className="text-slate-500 font-semibold flex justify-between">
                                    <span>Selecionados ({data.signatarios.length})</span>
                                    {errors.signatarios && (
                                        <span className="text-red-500 font-normal">{errors.signatarios}</span>
                                    )}
                                </Typography>

                                {selectedSignatariosDetails.length === 0 ? (
                                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/30">
                                        <Typography variant="body2" className="text-slate-400">
                                            Nenhum signatário adicionado
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                                        {selectedSignatariosDetails.map((sig, index) => (
                                            <Paper key={sig.id} className="p-3 border border-slate-150 shadow-none rounded-xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {data.fluxo_sequencial && (
                                                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                                                            {index + 1}º
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <Typography variant="body2" className="font-semibold text-slate-700 truncate">
                                                            {sig.nome}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-slate-400 block truncate">
                                                            {sig.email} • {sig.setor}
                                                        </Typography>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {data.fluxo_sequencial && (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => moveUp(index)}
                                                                disabled={index === 0 || processing}
                                                                className="p-1! rounded-full! min-w-0! bg-slate-100! hover:bg-slate-200! text-slate-600!"
                                                            >
                                                                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => moveDown(index)}
                                                                disabled={index === selectedSignatariosDetails.length - 1 || processing}
                                                                className="p-1! rounded-full! min-w-0! bg-slate-100! hover:bg-slate-200! text-slate-600!"
                                                            >
                                                                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeSignatario(sig.id)}
                                                        disabled={processing}
                                                        color="error"
                                                        className="p-1! rounded-full! min-w-0! bg-red-50! hover:bg-red-100! text-red-600!"
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </div>
                                            </Paper>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Search and Select Signatories Section */}
                            <div className="flex flex-col gap-2 mt-2">
                                <Typography variant="caption" className="text-slate-500 font-semibold">
                                    Adicionar Signatários (Buscar para filtrar)
                                </Typography>
                                
                                <TextField
                                    placeholder="Buscar por nome, e-mail, cargo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon className="text-slate-400" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />

                                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mt-1 border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                                    {filteredAvailableSignatarios.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <Typography variant="body2" className="text-slate-400">
                                                Nenhum signatário disponível
                                            </Typography>
                                        </div>
                                    ) : (
                                        filteredAvailableSignatarios.map((sig) => (
                                            <div key={sig.id} className="p-2 hover:bg-white rounded-lg flex items-center justify-between border border-transparent hover:border-slate-100 transition-all">
                                                <div className="min-w-0 mr-3">
                                                    <Typography variant="body2" className="font-medium text-slate-700 truncate">
                                                        {sig.nome}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-slate-400 block truncate">
                                                        {sig.email} • {sig.cargo} ({sig.setor})
                                                    </Typography>
                                                </div>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => addSignatario(sig.id)}
                                                    disabled={processing}
                                                    className="py-0.5! px-2! text-xs! font-bold!"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Adicionar
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            disabled={processing}
                            color="inherit"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={processing || data.signatarios.length === 0 || !data.arquivo || !data.titulo}
                            color="primary"
                        >
                            {processing ? 'Criando...' : 'Criar Processo'}
                        </Button>
                    </div>
                </form>
            </Modal.Contents>
        </Modal.Container>
    );
}
