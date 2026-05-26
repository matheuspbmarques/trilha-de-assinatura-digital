# Trilha de Assinatura Digital - Análise de Dados

Este repositório contém a implementação dos recursos de análise de dados sobre os processos digitais. Toda a inteligência analítica foi centralizada na camada de serviço dedicada (`App\Services\AnalyticsService`), mantendo os controllers limpos e focados apenas em direcionar o fluxo da aplicação.

Abaixo, descrevemos quais indicadores foram implementados, suas fórmulas e a lógica matemática por trás de cada cálculo.

---

## Indicadores Implementados

### 1. Tempo Médio de Aprovação dos Processos
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

---

### 2. Produtividade por Signatário (Tempo Médio de Resposta)
Mede o tempo médio que cada signatário leva para responder a um convite de assinatura (aprovando ou reprovando) a partir do momento em que o convite foi liberado para ele.

* **Origem dos Dados**:
  * Data de liberação do convite (Ativação): Calculada a partir de `signatarios_processos.token_expira_em` menos 7 dias (visto que o token expira em 7 dias), ou a data de criação do processo (`processos.created_at`) como fallback caso o token não tenha data de expiração registrada.
  * Data de resposta: `signatarios_processos.respondido_em`
* **Cálculo**:
  Para cada resposta registrada do signatário, calcula-se o tempo de resposta em segundos:
  $$TempoResposto = t_{\text{Respondido}} - t_{\text{Ativacao}}$$
  A média por signatário é dada pela soma dos tempos de resposta dividida pelo número total de convites respondidos por ele (aprovações + reprovações).
* **Formatação**: Exibido em formato compacto na tabela de produtividade (ex: `12s`, `4m`, `2h` ou `1 dia e 3h`).

---

### 3. Distribuição por Status
Mostra a concentração atual de processos em cada etapa do fluxo de trabalho (Pendente, Em aprovação, Aprovado, Reprovado, Cancelado).

* **Origem dos Dados**: Tabela `processos`, filtrada por período de criação.
* **Cálculo**:
  Conta-se a quantidade de processos em cada status $s$. O percentual é a divisão desta quantidade pelo total de processos criados no período:
  $$Percentual_s = \left( \frac{Quantidade_s}{TotalProcessos} \right) \times 100$$
* **Garantia de Integridade**: O serviço garante que todos os 5 status sejam retornados (mesmo com valor zero) para que a interface permaneça uniforme.

---

### 4. Volume por Categoria
Identifica qual categoria de processo (ex: Contratos, Recursos Humanos, Jurídico, Financeiro) possui maior volume de tráfego, respondendo à pergunta *"Qual categoria de processo possui maior volume?"*.

* **Origem dos Dados**: Tabela `processos`.
* **Cálculo**:
  Os processos são agrupados pelo campo `categoria` e contados. O resultado é ordenado do maior volume para o menor, calculando a porcentagem de representatividade de cada categoria:
  $$Percentual_c = \left( \frac{Quantidade_c}{TotalProcessos} \right) \times 100$$
* **Visualização**: Implementado como um widget gráfico de barras de progresso horizontais customizadas na tela de relatórios gerenciais, com suporte a exportação CSV.

---

### 5. Processos Criados e Concluídos por Período
Acompanha a série histórica do fluxo de processos ao longo do tempo, divididos de acordo com o agrupamento selecionado (Dia, Semana ou Mês).

* **Origem dos Dados**:
  * Processo Criado: `processos.created_at` dentro do intervalo do período.
  * Processo Concluído (Status final Aprovado ou Reprovado): `processos.updated_at` dentro do intervalo do período.
* **Cálculo**:
  Divide-se o intervalo de busca em fatias temporais (slots). Para cada slot, conta-se:
  * Quantidade de processos com `created_at` correspondente ao slot (Contagem de Criados).
  * Quantidade de processos com status "Aprovado" ou "Reprovado" cujo `updated_at` corresponde ao slot (Contagem de Concluídos).
* **Visualização**: Exibido no gráfico de barras vertical animado em SVG no painel de relatórios.

---

## Estrutura para Datalake & Base Analítica

Visando facilitar a análise de dados por equipes de BI, ferramentas de relatórios externas ou engenharia de dados, implementamos uma infraestrutura analítica contendo tabelas denormalizadas no banco de dados e arquivos estruturados particionados (simulando um Data Lake corporativo).

### 1. Tabela Analítica no Banco de Dados (`processos_analiticos`)
A tabela `processos_analiticos` armazena de forma denormalizada a relação entre **Processos** e seus respectivos **Signatários**. Diferente do modelo transacional (OLTP), o modelo analítico (OLAP) reduz a necessidade de múltiplos `JOINs`, otimizando a performance de leitura.

O schema da tabela contém os seguintes campos:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador único do registro analítico. |
| `processo_id` | `UUID` | Identificador do processo. |
| `usuario_id` | `UUID` | Identificador do usuário proprietário do processo. |
| `titulo` | `VARCHAR(256)` | Título do processo. |
| `categoria` | `VARCHAR(256)` | Categoria do documento (ex: Recursos Humanos, Financeiro). |
| `status` | `VARCHAR(64)` | Status geral do processo (Pendente, Aprovado, etc). |
| `signatario_id` | `UUID` (Nullable) | Identificador do signatário vinculado. |
| `signatario_nome` | `VARCHAR(256)` (Nullable) | Nome do signatário. |
| `signatario_cargo` | `VARCHAR(256)` (Nullable) | Cargo do signatário. |
| `data_criacao` | `TIMESTAMP` | Data de criação do processo. |
| `data_resposta` | `TIMESTAMP` (Nullable) | Data em que o signatário assinou/reprovou. |
| `tipo_resposta` | `VARCHAR(64)` (Nullable) | Resposta do signatário (Pendente, Aprovado, Reprovado). |
| `tempo_resposta_em_horas` | `DECIMAL(8,2)` (Nullable) | Tempo de resposta do signatário calculado em horas. |
| `justificativa_reprovacao` | `VARCHAR(1024)` (Nullable) | Justificativa preenchida pelo signatário em caso de reprovação. |

---

### 2. Rotinas de Consolidação e Simulação
Foram disponibilizados três mecanismos para gerar e exportar estes dados analíticos:

1. **Artisan CLI Command**:
   ```bash
   php artisan analytics:consolidate
   ```
   Esta rotina limpa a tabela `processos_analiticos`, calcula os indicadores e insere os registros atualizados de todos os processos do sistema. Além disso, exporta os consolidados globais em formatos `CSV` e `JSON` no diretório de datalake e cria uma estrutura de arquivos particionados.
   
2. **Background Queueable Job**:
   O job `App\Jobs\ConsolidateAnalyticsJob` pode ser despachado pela fila (Queue) para rodar de forma assíncrona, evitando que operações demoradas impactem a navegação do usuário.

3. **Painel de Controle no Frontend**:
   Integrado no menu **Relatórios**, o usuário pode:
   * Trigar a consolidação da base analítica instantaneamente.
   * Baixar os arquivos analíticos consolidados globais (`CSV` ou `JSON`).
   * Simular a geração de partições e visualizar graficamente a árvore de diretórios criada no storage.

---

### 3. Simulação de Particionamento (Datalake Hive)
Ao executar a consolidação ou simulação, os arquivos são gravados no diretório do servidor em `storage/app/private/datalake/`. Para otimizar o processamento de grandes volumes e simular repositórios de nuvem (AWS S3, Google Cloud Storage), o sistema gera uma árvore particionada por data de criação do processo:

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

---

### 4. Integração Futura com BI e Pipelines de Dados

#### A. Conexão Direta com Ferramentas de BI (Metabase, Power BI, Tableau)
* **DirectQuery / Import via Banco**: Ferramentas de BI podem se conectar diretamente ao banco PostgreSQL da aplicação e consumir a tabela `processos_analiticos`. Por ser denormalizada, a query de carga do dashboard torna-se trivial (`SELECT * FROM processos_analiticos`), reduzindo o consumo de CPU do banco relacional.
* **Agendamento de Refresh**: Os dashboards podem agendar atualizações periódicas (ex: a cada hora ou uma vez ao dia) logo após a execução da rotina de consolidação.

#### B. Pipelines de Engenharia de Dados (ETL/ELT - Airflow, dbt)
* **Ingestão Incremental**: Pipelines de engenharia de dados (como Apache Airflow ou Prefect) podem executar a CLI `php artisan analytics:consolidate` e capturar apenas as partições correspondentes ao dia de processamento (`partition_year=YYYY/partition_month=MM/partition_day=DD`).
* **Sincronização para Object Storage**: Os dados particionados salvos em disco podem ser sincronizados incrementalmente com buckets na nuvem (ex: `aws s3 sync storage/app/private/datalake/ s3://meu-datalake-corporativo/`).
* **Consultas Serverless (AWS Athena / BigQuery)**: Uma vez no Cloud Storage sob o formato `partition_year=...`, ferramentas como AWS Athena, Databricks ou Google BigQuery conseguem mapear os arquivos e realizar consultas SQL diretamente sobre o Datalake. O particionamento em pastas garante a técnica de **Partition Pruning** (o Athena lê apenas as pastas das datas consultadas), reduzindo drasticamente o custo e tempo de execução das queries.

