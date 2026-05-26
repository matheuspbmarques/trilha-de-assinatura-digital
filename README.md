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
