export type TSignatario = {
    id: string;
    nome: string;
    email: string;
    cargo: string;
    setor: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
};

export type TPaginatedSignatarios = {
    current_page: number;
    data: TSignatario[];
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

