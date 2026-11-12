# ADR 003: Sincronização Bidirecional e Resolução de Conflitos (Cloud Sync)

## Status
Aceito

## Contexto
O usuário pode utilizar o Bíblia Go em múltiplos dispositivos (celular e tablet) ou realizar alterações (marcações de favoritos, notas, progresso de leitura) enquanto estiver sem conexão à internet. Ao reconectar, as alterações locais devem ser enviadas ao servidor e as alterações do servidor devem ser refletidas no cliente sem perda de dados.

Alternativas consideradas:
1. **CRDTs (Conflict-free Replicated Data Types)**: Excelente para edição colaborativa simultânea (ex: Google Docs), porém complexidade matemática e de armazenamento desproporcional para dados devocionais individuais.
2. **Server Always Wins**: Fácil de implementar, mas sobrescreve anotações locais feitas offline pelo usuário.
3. **Last-Write-Wins (LWW) com Timestamps ISO 8601 e Fila Offline**: Cada entidade possui `updated_at`. Na sincronização, a versão com timestamp mais recente prevalece. Em caso de empate, preserva-se o conteúdo mais detalhado (ex: notas mais longas).

## Decisão
Implementamos a estratégia **Last-Write-Wins (LWW) com Timestamps e Fila Offline (`OfflineRequestQueue`)**.
- O cliente enfileira mutações localmente quando não há rede.
- O endpoint `/api/sync` recebe o delta desde `lastSyncedAt`.
- O servidor aplica as alterações mais recentes e retorna o snapshot atualizado das entidades modificadas.

## Consequências
### Positivas
- Algoritmo determinístico e de fácil depuração.
- Suporte a retries com backoff exponencial no cliente mobile.
- Baixo consumo de dados móveis (transfere apenas deltas).

### Negativas / Mitigações
- Dependência de relógios sincronizados (NTP). Mitigado pelo servidor sempre atribuir e validar timestamps no recebimento.
