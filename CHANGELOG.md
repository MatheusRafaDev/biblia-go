# 📜 Changelog — Bíblia Go

Todas as mudanças relevantes deste projeto estão documentadas neste arquivo.
O versionamento segue os padrões de [Semantic Versioning](https://semver.org/).

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
