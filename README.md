# Bíblia Go 📖

Aplicativo móvel e web moderno de estudo bíblico em português (pt-BR), desenvolvido com foco em alta performance offline, manipulação eficiente de dados no SQLite local com FTS5, consumo de APIs e Clean Architecture modular orientada a features.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Expo (SDK 58)](https://expo.dev) com [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing) e TypeScript em modo estrito (`strict: true`).
- **Banco de Dados Local**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) com migrações versionadas e **FTS5** (Full-Text Search) para busca instantânea em linguagem natural.
- **Gerenciamento de Estado Remoto e Cache**: [TanStack Query v5](https://tanstack.com/query/latest) para sincronização e cache de requisições.
- **Estado Global Leve**: [Zustand](https://zustand-demo.pmnd.rs/) para preferências de leitura (tradução atual, livro, capítulo, tamanho de fonte).
- **Validação de Schemas**: [Zod](https://zod.dev/) para garantir a integridade dos dados vindos de APIs externas.
- **Gráficos e Visualizações**: [react-native-svg](https://github.com/software-mansion/react-native-svg) para renderização interativa do grafo genealógico bíblico.
- **Notificações**: [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) para agendamento do lembrete diário de leitura.
- **Design System & Tipografia**: Fonte Nunito (`@expo-google-fonts/nunito`), paleta acolhedora com fundo creme (`#FBF7EE`), azul-marinho (`#26244A`), destaque azul (`#3B6EF5`), cards pastel e suporte nativo a **Modo Escuro** (`dark mode`).
- **Testes & Qualidade**: [Vitest](https://vitest.dev/) para suíte de testes unitários rápidos e [ESLint](https://eslint.org/) para linting contínuo.

---

## 📱 Funcionalidades Implementadas (MVP)

### 1. Leitor da Bíblia Offline & Busca FTS5
- Navegação fluida entre os 66 livros canônicos e todos os seus capítulos.
- Busca textual de alta velocidade através da tabela virtual `verses_fts` com triggers de sincronização contínua.
- Destaques com 4 cores pastel e anotações pessoais de estudo gravadas no SQLite.
- Gerenciador completo de favoritos e destaques com filtros por cor.
- Download completo da tradução ACF11 (31.102 versículos) direto da Bolls Life API em lote com transação.

### 2. Comparador de Traduções Lado a Lado
- Comparação simultânea do mesmo versículo em 2 ou 3 versões (ACF11, ARA, KJV, TB10).
- Algoritmo de **diff por palavra** (Longest Common Subsequence - LCS) que realça visualmente divergências entre as versões.
- Seletor rápido de passagem e atalho direto a partir do leitor bíblico.

### 3. Planos de Leitura & Lembretes Diários
- Planos pré-configurados: **Novo Testamento em 90 Dias** e **Bíblia em 1 Ano**.
- Acompanhamento de progresso percentual, dias concluídos e **sequência de dias seguidos (streak 🔥)**.
- Agendamento de lembrete diário às 08:00 com `expo-notifications`.

### 4. Quiz de Histórias Bíblicas
- Banco de perguntas em JSON categorizado por Antigo Testamento, Novo Testamento e Personagens.
- Feedback imediato de acerto/erro com citação do versículo de origem.
- Estatísticas, histórico de partidas e recordes persistidos localmente no SQLite.

### 5. Grafo Interativo de Genealogias
- Metadados inspirados no Theographic Bible Metadata mapeando a linhagem de Adão a Jesus Cristo.
- Visualização em SVG com controles de zoom in/out e busca de personagens.
- Modal de detalhes com biografia, conexões familiares e versículos-chave com botão para abrir diretamente no leitor.

---

## 📂 Arquitetura do Projeto

```text
biblia-go/
├── app/                        # Rotas e layouts do Expo Router
│   ├── _layout.tsx             # Root Layout (QueryClient, SQLite Provider, Fontes)
│   └── (tabs)/                 # Abas principais
│       ├── _layout.tsx         # Tab Bar customizada (5 abas)
│       ├── index.tsx           # Aba 1: Leitor
│       ├── compare.tsx         # Aba 2: Comparador de Traduções
│       ├── plan.tsx            # Aba 3: Planos de Leitura
│       ├── quiz.tsx            # Aba 4: Quiz Bíblico
│       └── characters.tsx      # Aba 5: Grafo de Genealogias
├── src/
│   ├── features/               # Módulos organizados por feature
│   │   ├── reader/             # Leitor, busca FTS5, favoritos e notas
│   │   ├── compare/            # Comparador lado a lado com diff
│   │   ├── plan/               # Planos de leitura e notificações
│   │   ├── quiz/               # Quiz e histórico
│   │   └── graph/              # Grafo de personagens em SVG
│   └── shared/                 # Código compartilhado entre features
│       ├── api/                # Cliente tipado preparado para a Fase 2 (RAG, busca vetorial)
│       ├── components/         # Card, Header, FeedbackStates
│       ├── constants/          # Cores, tema pastel, livros canônicos
│       ├── db/                 # Repositórios SQLite, migrations e tipos
│       ├── hooks/              # useTheme, useDebounce
│       ├── stores/             # useReaderStore (Zustand)
│       └── utils/              # textDiff (algoritmo LCS por palavra)
└── test/                       # Suíte de testes unitários com Vitest
```

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar a suíte de testes unitários
```bash
npm test
```

### 3. Iniciar o aplicativo Expo
```bash
npx expo start
```
- Pressione `w` para rodar na versão **Web**.
- Pressione `a` para abrir no emulador **Android**.
- Pressione `i` para abrir no simulador **iOS**.

### 4. Validação de Tipos e Linter
```bash
npm run typecheck   # npx tsc --noEmit
npm run lint        # npx expo lint
```

---

## 🔮 Fase 2 (Prontidão de Arquitetura)

O módulo `src/shared/api/` já inclui os contratos Zod e a camada cliente preparados para integração com:
- **Back-end próprio em Fastify + Node/TS com Docker**.
- **Busca Semântica Vetorial** com embeddings.
- **Chat com IA contextual (RAG)** que responde dúvidas bíblicas citando sempre o versículo de origem.
- **Sincronização em nuvem** do progresso de leitura e favoritos entre múltiplos aparelhos via JWT.
