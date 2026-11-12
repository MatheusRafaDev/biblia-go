# ADR 001: Mecanismo Offline-First com SQLite e FTS5

## Status
Aceito

## Contexto
O aplicativo Bíblia Go exige funcionamento 100% offline para leitura dos 66 livros canônicos, 1.189 capítulos e mais de 31.000 versículos por tradução. Além disso, a busca por texto precisa ser instantânea (sub-100ms) em dispositivos móveis com recursos limitados.

Alternativas consideradas:
1. **AsyncStorage / MMKV**: Rápido para chave-valor, mas inviável para consultas complexas, filtros por testamento/livro e busca textual sobre 31.000 registros.
2. **WatermelonDB / Realm**: Poderosos, porém adicionam complexidade excessiva de build nativo e dependências externas pesadas no ecossistema Expo.
3. **expo-sqlite com Virtual Table FTS5 (Full-Text Search)**: Embutido no Expo SDK, suporte nativo a transações ACID, consultas relacionais e índices FTS5 pré-compilados.

## Decisão
Adotamos o **`expo-sqlite`** associado a uma tabela virtual **FTS5** (`verses_fts`) sincronizada por gatilhos (*triggers*) `AFTER INSERT`, `AFTER DELETE` e `AFTER UPDATE`.

A camada de acesso ao banco segue o padrão Repository (`BibleRepository`), garantindo que nenhum componente React Native acesse SQL diretamente.

## Consequências
### Positivas
- Consultas de busca textual executadas em menos de 40ms sobre toda a Bíblia.
- Suporte a operadores booleanos e prefixos (`termo*`).
- Portabilidade total: o mesmo arquivo SQLite pode ser exportado, auditado e inspecionado.
- Zero dependências de rede para operação central do leitor.

### Negativas / Mitigações
- Espaço em disco adicional para o índice FTS5 (~8MB por tradução completa). Mitigado pelo download sob demanda de traduções adicionais.
