export type TProcessoStatus =
    | 'Pendente'
    | 'Em aprovação'
    | 'Aprovado'
    | 'Reprovado'
    | 'Cancelado';

export type TProcesso = {
    id: string;
    usuario_id: string;
    titulo: string;
    descricao: string;
    status: TProcessoStatus;
    categoria: string;
    url: string;
    created_at: string;
    updated_at: string;
};

export type TPaginatedProcessos = {
    current_page: number;
    data: TProcesso[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
