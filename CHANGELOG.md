# 📜 Changelog — Bíblia Go

Todas as mudanças relevantes deste projeto estão documentadas neste arquivo.
O versionamento segue os padrões de [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-11-12

### ✨ Novas Funcionalidades e Melhorias de Experiência

#### 🕒 Histórico de Leitura Recente
- Gerenciamento inteligente no store Zustand das últimas passagens bíblicas lidas com desduplicação automática e ordenação cronológica.
- Barra de chips rápidos (*Recentes*) integrada diretamente no topo do seletor de livros e capítulos, permitindo alternância instantânea com um toque.

#### ☀️ Versículo do Dia & Devocional Diário
- Novo modal devocional acolhedor acessível pelo leitor, com seleção determinística por dia do ano baseada em temas essenciais (Paz, Ansiedade, Esperança, Fé, Sabedoria).
- Exibição de texto bíblico, reflexão prática para a vida cotidiana, oração do dia guiada e botão de compartilhamento formatado para redes sociais e mensagens.
- Atalho *"Ler no Contexto"* que abre diretamente o livro e capítulo no versículo em destaque.

#### 💡 Busca Semântica por Temas na UI
- Novo seletor de abas no modal de busca: **FTS5 Offline (Palavra Exata)** vs. **Semântica & Temas (IA Fastify)**.
- Pílulas de temas populares (*Ansiedade, Esperança, Perdão, Paz, etc.*) para busca rápida com um toque.
- Indicador percentual de relevância e tags temáticas com navegação direta para as passagens bíblicas.

#### 💾 Central de Dados, Backup Local & Fila Offline
- Interface visual na Central de Dados para exportação completa dos favoritos, progresso de leitura e pontuações de quiz para JSON.
- Importação e restauração com validação de esquema em tempo real via Zod.
- Monitoramento da **Fila Offline de Sincronização** com ações para processamento forçado e descarte seguro.

#### 🧪 Qualidade & Testes
- Adição de testes unitários para o Versículo do Dia (`dailyVerse.test.ts`) e Histórico Recente (`recentPassages.test.ts`).
- Suíte total expandida para **91 testes automatizados (100% de aprovação no Vitest)**.
- 0 erros e 0 warnings no `expo lint` e `tsc --noEmit`.

---

## [1.0.0] - 2026-11-12

### 🎉 Lançamento da Versão Inicial (MVP + Backend Fase 2)

#### 📖 Feature 1: Leitor Bíblico Offline
- Implementação dos 66 livros canônicos com suporte a múltiplas traduções (ACF, ARA, KJV, TB).
- Mecanismo de busca textual Full-Text Search com **SQLite FTS5** e gatilhos de sincronização.
- 4 marcadores de destaque em tons pastel com persistência local.
- Notas de estudo pessoais por versículo com modal de gerenciamento e filtros por cor.
- Estimador de tempo de leitura por capítulo e formatador de cópia de texto com referências.

#### ⚖️ Feature 2: Comparador de Traduções
- Comparação lado a lado de 2 ou 3 versões bíblicas com sincronização de versículos.
- Algoritmo de diff de texto palavra por palavra baseado em **Longest Common Subsequence (LCS)**.
- Algoritmo de comparação tripla com cálculo de similaridade de Jaccard e tokens comuns/únicos.
- Ação rápida de formatação de resumo de comparação para a área de transferência.

#### 📅 Feature 3: Planos de Leitura & Hábitos
- Planos de leitura pré-definidos (Bíblia em 1 ano, Novo Testamento em 90 dias).
- Gerador e validador de planos de leitura personalizados distribuindo capítulos por duração.
- Rastreador de dias consecutivos (*streak*) com cálculo de medalhas e marcos de conquista.
- Agendamento de lembretes devocionais diários via `expo-notifications`.

#### 🧠 Feature 4: Quiz Bíblico
- Banco de perguntas bíblicas em JSON local divididas por categorias temáticas.
- Sistema de pontuação com multiplicadores de dificuldade, bônus de velocidade e bônus de sequência.
- Histórico de desempenho, taxas de acerto e recomendação de categorias para reforço.

#### 🌳 Feature 5: Grafo de Personagens e Genealogias
- Metadados genealógicos baseados no *Theographic Bible Metadata*.
- Visualização interativa com React Native SVG, nós estilizados e conexões genealógicas.
- Filtros por era bíblica (Patriarcas, Reis, Apóstolos), gênero e graus de parentesco.
- Integração direta de cada personagem com suas respectivas passagens bíblicas.

#### ⚡ Fase 2: Backend Fastify & Cloud Services
- Servidor REST autônomo com **Fastify**, **TypeScript Strict** e banco **`node:sqlite`**.
- Módulo de autenticação com JWT e hashing seguro.
- Mecanismo de sincronização bidirecional em nuvem com resolução de conflitos *Last-Write-Wins*.
- Busca semântica vetorial por temas bíblicos e assistente teológico RAG.
- Plugins de resiliência: **Rate Limiting por IP**, **Headers de Segurança (Helmet)**, **Audit Logger** e **Snapshots de Banco**.
- Suporte a fila offline de requisições (`OfflineRequestQueue`) no cliente mobile.
- Mecanismo de exportação e importação de backups locais em formato JSON validado com Zod.

#### 🐳 DevOps & Qualidade
- Dockerfile multi-stage enxuto (`node:24-alpine`) com usuário não-root e compose orquestrado.
- GitHub Actions CI/CD automatizado cobrindo linting, typechecking, testes e build Docker.
- 85 testes automatizados com 100% de aprovação no Vitest.
- Documentação completa da API REST e Architecture Decision Records (ADRs).

