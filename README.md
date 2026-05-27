# Trilha de Assinatura Digital - Análise de Dados e Containerização

Este projeto consiste em uma plataforma para controle e auditoria analítica de processos de assinatura digital. O ambiente foi planejado para ser flexível e permitir o desenvolvimento tanto diretamente no host quanto em um ambiente isolado via Docker (Laravel Sail), sem que um interfira ou quebre as configurações do outro.

---

## 1. Passos para Instalação e Configuração

Você pode executar o projeto de duas formas: utilizando o **Docker (via Laravel Sail)** ou executando diretamente no **Ambiente Local (Host)**.

### Opção A: Execução via Docker (Laravel Sail) - Recomendado

O Docker Compose está configurado para expor as portas sem conflitar com eventuais serviços locais do host (por exemplo, PostgreSQL na porta 5432).

1. **Requisitos**: Docker e Docker Compose instalados.
2. **Copie o arquivo de ambiente**:
   ```bash
   cp .env.example .env
   ```
   *Nota: Não é necessário alterar os hosts do banco ou do cache no `.env` para rodar no Docker, pois o `compose.yaml` aplica overrides automáticos para o container (veja a seção de escolhas técnicas).*
3. **Inicie os containers**:
   ```bash
   ./vendor/bin/sail up -d
   ```
4. **Instale as dependências e compile o frontend**:
   ```bash
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run build  # ou ./vendor/bin/sail npm run dev
   ```
5. **Gere a chave da aplicação**:
   ```bash
   ./vendor/bin/sail artisan key:generate
   ```

---

### Opção B: Execução no Ambiente Local (Host)

1. **Requisitos**: PHP >= 8.2, Composer, PostgreSQL rodando localmente (porta 5432), Node.js & NPM.
2. **Configure o arquivo de ambiente**:
   ```bash
   cp .env.example .env
   ```
   Certifique-se de que os dados de conexão do seu banco PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) correspondam às suas credenciais locais no host.
3. **Instale as dependências**:
   ```bash
   composer install
   npm install
   ```
4. **Gere a chave da aplicação**:
   ```bash
   php artisan key:generate
   ```
5. **Inicie o servidor de desenvolvimento e o Vite**:
   ```bash
   php artisan serve --port=8000
   ```
   E em outro terminal:
   ```bash
   npm run dev
   ```

---

## 2. Como Executar Migrations e Seeders

As migrations estruturam o banco de dados e os seeders alimentam a aplicação com dados iniciais de teste (usuários, signatários, processos e históricos de auditoria).

### Via Docker (Laravel Sail):
* **Executar Migrations e Seeders (Tudo junto)**:
  ```bash
  ./vendor/bin/sail artisan migrate --seed
  ```
* **Executar apenas as migrations**:
  ```bash
  ./vendor/bin/sail artisan migrate
  ```
* **Executar apenas os seeders**:
  ```bash
  ./vendor/bin/sail artisan db:seed
  ```

### Via Ambiente Local (Host):
* **Executar Migrations e Seeders (Tudo junto)**:
  ```bash
  php artisan migrate --seed
  ```
* **Executar apenas as migrations**:
  ```bash
  php artisan migrate
  ```
* **Executar apenas os seeders**:
  ```bash
  php artisan db:seed
  ```

---

## 3. Como Iniciar Filas/Jobs

A aplicação utiliza filas para processar tarefas demoradas em segundo plano (como a consolidação analítica). O driver de fila está configurado como `database` no arquivo `.env`.

### Via Docker (Laravel Sail):
Inicie o worker de filas rodando o comando:
```bash
./vendor/bin/sail artisan queue:work
```

### Via Ambiente Local (Host):
Inicie o worker de filas rodando o comando:
```bash
php artisan queue:work
```

---

## 4. Como Acessar o Sistema

Após iniciar a aplicação, os seguintes endereços estarão disponíveis:

### Acesso via Docker (Laravel Sail):
* **Aplicação Web**: [http://localhost](http://localhost) (porta padrão `80`)
* **Painel Mailpit (Captura de E-mails local)**: [http://localhost:8025](http://localhost:8025)
* **Banco de Dados (PostgreSQL no Host)**: `localhost:5433` (redirecionado do container porta `5432`)
* **Redis**: `localhost:6379`

### Acesso via Ambiente Local (Host):
* **Aplicação Web**: [http://localhost:8000](http://localhost:8000) (ou a porta configurada no `artisan serve`)
* **Vite Dev Server**: `http://localhost:5173`

---

## 5. Usuário e Senha de Teste

A aplicação possui autenticação. O banco seeded possui o seguinte usuário pré-configurado:

* **Usuário (Acesso)**: `test`
* **Senha**: `senha`

---

## 6. Breve Explicação das Escolhas Técnicas

1. **Separação de Ambientes (Docker vs. Host)**: 
   Para evitar que as configurações do Docker quebrem o ambiente local do desenvolvedor (ou vice-versa), adotamos uma estratégia de **injeção de ambiente no container via Docker Compose**. 
   * No arquivo `compose.yaml`, as variáveis `DB_HOST=pgsql`, `REDIS_HOST=redis` e `MAIL_HOST=mailpit` são passadas diretamente na seção `environment` da aplicação.
   * Isso permite que o arquivo `.env` do host mantenha `DB_HOST=127.0.0.1` e funcione sem modificações ou exposição de chaves privadas locais, mantendo o desenvolvimento no host íntegro.
   * O banco de dados do Docker Compose foi mapeado para a porta **5433** no host, evitando conflito com instalações locais de PostgreSQL do desenvolvedor (que escutam na porta 5432).
2. **Laravel 11 & PHP 8.2+**: Utilizado pela robustez do ORM (Eloquent), facilidade na criação de comandos Artisan e arquitetura baseada em serviços.
3. **Inertia.js & React (TypeScript & Material UI)**: O Inertia conecta o backend Laravel com o frontend React diretamente, evitando a complexidade de um repositório separado e mantendo a experiência de SPA (Single Page Application). A interface analítica foi construída usando componentes modernos do Material UI (MUI).
4. **Arquitetura Analítica Denormalizada**: Criamos uma tabela analítica (`processos_analiticos`) que serve como uma camada OLAP básica de consulta rápida, evitando múltiplos `JOINs` complexos na base de produção (OLTP).

---

## 7. Explicação dos Indicadores Implementados

Toda a inteligência analítica foi centralizada na camada de serviço dedicada (`App\Services\AnalyticsService`), calculando os seguintes indicadores:

### A. Tempo Médio de Aprovação dos Processos
Mede o tempo médio decorrido desde o momento da criação de um processo até a sua aprovação final (quando todos os signatários requeridos assinaram).

* **Origem dos Dados**:
  * Data de criação do processo: `processos.created_at`
  * Data da alteração de status para "Aprovado": `processos_historico.created_at` (onde `campo = 'status'` e `descricao` contém "Aprovado")
* **Cálculo**:
  Para cada processo aprovado $i$, calcula-se o intervalo em segundos:
  $$Tempo_i = t_{\text{Aprovacao}_i} - t_{\text{Criacao}_i}$$
  Em seguida, a média aritmética dos segundos de todos os $N$ processos aprovados no período é calculada:
  $$M\text{é}dia = \frac{1}{N} \sum_{i=1}^{N} Tempo_i$$
* **Formatação**: Convertido de forma amigável para o usuário (ex: `12 seg`, `5 min`, `3 horas` ou `2 dias e 4h`).

### B. Produtividade por Signatário (Tempo Médio de Resposta)
Mede o tempo médio que cada signatário leva para responder a um convite de assinatura (aprovando ou reprovando) a partir do momento em que o convite foi liberado para ele.

* **Origem dos Dados**:
  * Data de liberação do convite (Ativação): Calculada a partir de `signatarios_processos.token_expira_em` menos 7 dias (visto que o token expira em 7 dias), ou a data de criação do processo (`processos.created_at`) como fallback caso o token não tenha data de expiração registrada.
  * Data de resposta: `signatarios_processos.respondido_em`
* **Cálculo**:
  Para cada resposta registrada do signatário, calcula-se o tempo de resposta em segundos:
  $$TempoResposto = t_{\text{Respondido}} - t_{\text{Ativacao}}$$
  A média por signatário é dada pela soma dos tempos de resposta dividida pelo número total de convites respondidos por ele (aprovações + reprovações).
* **Formatação**: Exibido em formato compacto na tabela de produtividade (ex: `12s`, `4m`, `2h` ou `1 dia e 3h`).

### C. Distribuição por Status
Mostra a concentração atual de processos em cada etapa do fluxo de trabalho (Pendente, Em aprovação, Aprovado, Reprovado, Cancelado).

* **Origem dos Dados**: Tabela `processos`, filtrada por período de criação.
* **Cálculo**:
  Conta-se a quantidade de processos em cada status $s$. O percentual é a divisão desta quantidade pelo total de processos criados no período:
  $$Percentual_s = \left( \frac{Quantidade_s}{TotalProcessos} \right) \times 100$$
* **Garantia de Integridade**: O serviço garante que todos os 5 status sejam retornados (mesmo com valor zero) para que a interface permaneça uniforme.

### D. Volume por Categoria
Identifica qual categoria de processo (ex: Contratos, Recursos Humanos, Jurídico, Financeiro) possui maior volume de tráfego.

* **Origem dos Dados**: Tabela `processos`.
* **Cálculo**:
  Os processos são agrupados pelo campo `categoria` e contados. O resultado é ordenado do maior volume para o menor, calculando a porcentagem de representatividade de cada categoria:
  $$Percentual_c = \left( \frac{Quantidade_c}{TotalProcessos} \right) \times 100$$

### E. Processos Criados e Concluídos por Período
Acompanha a série histórica do fluxo de processos ao longo do tempo, divididos de acordo com o agrupamento selecionado (Dia, Semana ou Mês).

* **Origem dos Dados**:
  * Processo Criado: `processos.created_at` dentro do intervalo do período.
  * Processo Concluído (Status final Aprovado ou Reprovado): `processos.updated_at` dentro do intervalo do período.
* **Cálculo**:
  Divide-se o intervalo de busca em fatias temporais (slots). Para cada slot, conta-se:
  * Quantidade de processos com `created_at` correspondente ao slot (Contagem de Criados).
  * Quantidade de processos com status "Aprovado" ou "Reprovado" cujo `updated_at` corresponde ao slot (Contagem de Concluídos).

---

## 8. Explicação da Estrutura Criada para Relatórios/Datalake

Visando facilitar a análise de dados por equipes de BI ou pipelines de engenharia de dados, implementamos uma infraestrutura analítica contendo:

### A. Tabela Analítica no Banco de Dados (`processos_analiticos`)
A tabela `processos_analiticos` armazena de forma denormalizada a relação entre **Processos** e seus respectivos **Signatários**. O schema da tabela contém os seguintes campos:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador único do registro analítico. |
| `processo_id` | `UUID` | Identificador do processo. |
| `usuario_id` | `UUID` | Identificador do usuário proprietário. |
| `titulo` | `VARCHAR(256)` | Título do processo. |
| `categoria` | `VARCHAR(256)` | Categoria do documento (ex: Recursos Humanos, Financeiro). |
| `status` | `VARCHAR(64)` | Status geral do processo (Pendente, Aprovado, etc). |
| `signatario_id` | `UUID` (Nullable) | Identificador do signatário. |
| `signatario_nome` | `VARCHAR(256)` (Nullable) | Nome do signatário. |
| `signatario_cargo` | `VARCHAR(256)` (Nullable) | Cargo do signatário. |
| `data_criacao` | `TIMESTAMP` | Data de criação do processo. |
| `data_resposta` | `TIMESTAMP` (Nullable) | Data em que o signatário assinou/reprovou. |
| `tipo_resposta` | `VARCHAR(64)` (Nullable) | Resposta do signatário (Pendente, Aprovado, Reprovado). |
| `tempo_resposta_em_horas` | `DECIMAL(8,2)` (Nullable) | Tempo de resposta do signatário calculado em horas. |
| `justificativa_reprovacao` | `VARCHAR(1024)` (Nullable) | Justificativa preenchida pelo signatário em caso de reprovação. |

### B. Simulação de Particionamento (Datalake Hive)
Ao executar a consolidação, os arquivos são gravados no diretório em `storage/app/private/datalake/`. Para otimizar consultas de grandes volumes e simular repositórios de nuvem (AWS S3 ou GCS), o sistema gera uma árvore particionada por data de criação:

```text
storage/app/private/datalake/
├── processos_analiticos.csv             <-- Base analítica global em CSV
├── processos_analiticos.json            <-- Base analítica global em JSON
├── partition_year=2025/
│    └── partition_month=12/
│         └── partition_day=31/
│              ├── processos.csv         <-- Dados específicos desse dia
│              └── processos.json
└── partition_year=2026/
     └── partition_month=05/
          └── partition_day=26/
               ├── processos.csv
               └── processos.json
```

### C. Integração com BI e Pipelines
* **BI (Metabase/PowerBI)**: Conexão direta com a tabela `processos_analiticos` utilizando SQL direto simplificado (`SELECT *`).
* **Pipelines ETL (Airflow/Athena/BigQuery)**: Consumo incremental de partições de disco ou bucket sincronizado (`aws s3 sync`), utilizando **Partition Pruning** para ler apenas as pastas das datas consultadas.

---

## 9. Pontos que Ficaram Pendentes

Todas as funcionalidades centrais e requisitos da aplicação foram entregues com sucesso (Dashboard analítico interativo, exportação de Datalake CSV/JSON particionado, filas, histórico de auditoria e Dockerização isolada). Como melhorias futuras e próximos passos, destacam-se:

1. **Sincronização Direta com Cloud Object Storage**: Implementar um adapter no Laravel Filesystem (ex: AWS S3 ou Google Cloud Storage) para enviar automaticamente as partições de arquivos geradas do Datalake para a nuvem.
2. **Autenticação Avançada / SSO**: Implementar integração com provedores de SSO (Single Sign-On) ou autenticação via OAuth/OpenID Connect para múltiplos usuários corporativos.
3. **Geração de PDF do Relatório Analítico**: Adicionar exportação visual direta dos gráficos e widgets analíticos em formato PDF para compartilhamento gerencial rápido.

---

## 10. Justificativa de Bibliotecas Auxiliares

Em conformidade com as diretrizes do projeto, detalhamos abaixo as bibliotecas auxiliares utilizadas nas categorias de **Autenticação**, **Layout**, **Exportação de Arquivos**, **Gráficos** e **Manipulação de Planilhas**, com as devidas justificativas técnicas.

### A. Autenticação (Authentication)
* **`web-token/jwt-framework` (PHP)**: Utilizada para codificação, decodificação, assinatura e validação dos tokens JWT dos convites de assinatura enviados aos signatários. Garante que os tokens de validação sejam criptograficamente seguros e invioláveis, permitindo autenticação stateless e expiração precisa dos links.
* **`laravel/sanctum` (PHP)**: Usada para a autenticação simples baseada em cookies/tokens de API para as rotas protegidas no painel administrativo e interações seguras de frontend-backend gerenciadas pelo Inertia.js.

### B. Layout & Design System
* **`@mui/material` & `@mui/icons-material` (React)**: Componentes prontos do Material UI para construir a interface administrativa e os painéis com agilidade, oferecendo tabelas, modais, formulários dinâmicos e feedbacks visuais integrados de alto padrão estético.
* **`@emotion/react` & `@emotion/styled` (React)**: Mecanismo de estilização dinâmico exigido internamente pelo Material UI para a injeção eficiente de CSS em tempo de execução.
* **`tailwindcss` & `@tailwindcss/vite` (CSS/Vite)**: Framework utilitário de CSS de alta produtividade. Utilizado em conjunto com o MUI para estilizações rápidas, responsividade complementar, micro-interações, hover effects e gradientes customizados.
* **`class-variance-authority`, `clsx` & `tailwind-merge`**: Utilitários essenciais no frontend para concatenar classes condicionais e evitar conflitos de estilos gerados dinamicamente no Tailwind CSS.

### C. Exportação de Arquivos & Manipulação de Planilhas
* **Sem bibliotecas externas adicionais**: Para garantir máxima performance de processamento e evitar dependências complexas (como PhpSpreadsheet), toda a geração e exportação de relatórios analíticos em **CSV** e **JSON** foi desenvolvida de forma nativa:
  * No **Backend**, a classe `AnalyticsExportService.php` utiliza os fluxos nativos de E/S do PHP (`fopen` com `php://temp` e `fputcsv`) estruturando os arquivos do Datalake com delimitadores de ponto e vírgula e BOM (Byte Order Mark) UTF-8 para compatibilidade direta com o Microsoft Excel.
  * No **Frontend**, a exportação direta de tabelas do relatório para planilhas em formato de texto separado por ponto e vírgula é feita utilizando a API nativa de `Blob` do próprio navegador no arquivo `relatorios.tsx`.

### D. Gráficos (Charts)
* **Sem bibliotecas externas adicionais**: Em vez de carregar pacotes pesados como Chart.js ou Recharts, o gráfico de evolução histórica de processos por período foi desenvolvido utilizando elementos **SVG puros dinâmicos** no React. Os cálculos de escala das barras, eixos e tooltip em tempo de execução são resolvidos puramente com TypeScript e estilizados com gradientes e transições nativas do Tailwind CSS no componente `Relatorios.tsx`.
